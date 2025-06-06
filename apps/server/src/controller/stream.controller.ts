import { env, handleZodError } from "@pkgs/zod-client";
import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";
import { createRazorpayOrder } from "../services/payments.service";
import { and, count, eq, or, sql } from "drizzle-orm";
import {
    ChatMessage,
    Order,
    Stream,
    User,
    StreamerRequest,
} from "@pkgs/drizzle-client";
import {
    asyncHandler,
    ApiResponse,
    Role,
    ApiError,
    ErrCodes,
    logger,
    MiddlewareUserT,
} from "@pkgs/lib";
import { createStreamSchema } from "@pkgs/zod-client/validators";
import { uploadDocumentOnCloudinary } from "../lib/cloudinary";
import { alias } from "drizzle-orm/pg-core";

/**
 * Controller for streamers to start a new stream
 */
const createNewStream = asyncHandler(async (req, res) => {
    const { title, youtubeVideoUrl, chatSlowMode, about, thumbnailUrl } =
        handleZodError(createStreamSchema.safeParse(req.body));
    const user = req.user;

    let thumbnail: string | null = null;

    if (req.file) {
        thumbnail = await uploadDocumentOnCloudinary(req.file.path);
    }

    if (!thumbnailUrl && !thumbnail)
        throw new ApiError(
            403,
            "Please upload any thumbnail for the video.",
            ErrCodes.VALIDATION_ERR
        );

    const streams = await db
        .insert(Stream)
        .values({
            streamTitle: title,
            streamingUid: uuidv4().toString(),
            streamerId: user.id,
            thumbnailUrl: thumbnail ?? thumbnailUrl ?? "",
            about,
            chatSlowMode,
            videoUrl: youtubeVideoUrl,
        })
        .returning()
        .execute();

    if (!streams || streams.length <= 0)
        throw new ApiError(400, "Failed to create new stream.");

    const stream = streams[0];

    res.status(201).json(
        new ApiResponse(201, {
            stream: { ...stream, streamingToken: undefined },
        })
    );
});

/**
 * This controller is required to fetch youtube data while creating a
 * stream for youtube live
 * TODO: still work left for this but this will work fine
 */
const fetchYoutubeData = asyncHandler(async (req, res) => {
    const { videoUrl } = req.query;

    if (!videoUrl) throw new ApiError(400, "Please provide video url.");

    const url = new URL(String(videoUrl));

    console.log("search params", url.searchParams.get("v"));
    const videoId = url.searchParams.get("v");

    if (!videoId) throw new ApiError(400, "Video not found.");

    const youtube = google.youtube("v3");
    const result = await youtube.videos.list({
        part: ["snippet", "contentDetails", "statistics"],
        id: [videoId],
        key: env.GOOGLE_API_KEY,
    });

    const items = result["data"]["items"];

    if (!items?.length || items.length <= 0)
        return res.status(200).json(new ApiResponse(200, null));

    const video = items[0]["snippet"];

    logger.info(JSON.stringify(video));

    res.status(200).json(
        new ApiResponse(200, {
            title: video?.title,
            thumbnail: video?.thumbnails?.high?.url,
            channelTitle: video?.channelTitle,
            description: video?.description,
        })
    );
});

/**
 * Fetch all streams created by a specific streamer
 */
const getAllStreams = asyncHandler(async (req, res) => {
    const user = req.user;
    const { page, limit } = req.query;

    const currentPage = parseInt(page ? page.toString() : "1");
    const currentLimit = parseInt(limit ? limit.toString() : "10");

    const results = await db
        .select({
            id: Stream.id,
            streamTitle: Stream.streamTitle,
            streamingUid: Stream.streamingUid,
            streamerId: Stream.streamerId,
            updatedAt: Stream.updatedAt,
            streamerName: sql`${User.firstName} || ' ' || ${User.lastName}`.as(
                "streamerName"
            ),
            thumbnail: Stream.thumbnailUrl,
        })
        .from(Stream)
        .where(eq(Stream.streamerId, user?.id))
        .innerJoin(User, eq(User.id, Stream.streamerId))
        .offset((currentPage - 1) * currentLimit)
        .limit(currentLimit)
        .groupBy(
            Stream.streamTitle,
            Stream.streamingUid,
            Stream.id,
            Stream.updatedAt,
            Stream.thumbnailUrl,
            User.firstName,
            User.lastName
        )
        .execute();

    const [countResult] = await db
        .select({ totalItems: count() })
        .from(Stream)
        .where(eq(Stream.streamerId, user?.id))
        .execute();

    if (!results || !countResult)
        throw new ApiError(400, "Failed to get user/token data.");
    const totalPages = Math.ceil(countResult.totalItems / currentLimit);

    res.status(200).json(
        new ApiResponse(200, {
            page: currentPage,
            limit: currentLimit,
            totalPages,
            totalItems: countResult.totalItems,
            data: results,
        })
    );
});

/**
 * Get any stream by it's uid
 */
const getStreamById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    let userRole: Role = "viewer";

    if (req.user.role == "admin") userRole = "admin";
    const [stream] = await db
        .select({
            streamTitle: Stream.streamTitle,
            streamUid: Stream.streamingUid,
            streamerId: Stream.streamerId,
            id: Stream.id,
            youtubeVideoUrl: Stream.videoUrl,
            about: Stream.about,
            streamerName: sql`${User.firstName} || ' ' || ${User.lastName}`.as(
                "streamerName"
            ),
        })
        .from(Stream)
        .where(eq(Stream.streamingUid, id))
        .innerJoin(User, eq(User.id, Stream.streamerId))
        .groupBy(
            Stream.streamTitle,
            Stream.streamingUid,
            Stream.streamerId,
            Stream.id,
            Stream.videoUrl,
            Stream.about,
            User.id,
            User.firstName,
            User.lastName
        )
        .execute();

    if (!stream) throw new ApiError(400, "Stream not found.");

    stream.streamerId == req.user.id ? (userRole = "streamer") : null;

    if (userRole != "streamer") {
        const [usr] = await db
            .select({ watchHistory: User.watchHistory })
            .from(User)
            .where(eq(User.id, req.user.id))
            .execute();
        if (!usr) throw new ApiError(400, "Failed to get user details.");

        const { watchHistory } = usr;

        if (!watchHistory.includes(stream.id))
            await db
                .update(User)
                .set({ watchHistory: [...watchHistory, stream.id] })
                .where(eq(User.id, req.user.id))
                .execute();
    }

    res.status(200).json(new ApiResponse(200, { stream, userRole }));
});

/**
 * Fetch any chats by specific streaming uid
 * TODO: have to add pagination like features
 */
const getAllChatsByStreamingId = asyncHandler(async (req, res) => {
    const { streamId } = req.params;

    const ReplyMessage = alias(ChatMessage, "replyMessage");
    const ReplyUser = alias(User, "replyUser");

    const results = await db
        .select({
            id: ChatMessage.id,
            message: ChatMessage.message,
            user: {
                fullName: sql`${User.firstName} || ' ' || ${User.lastName}`,
                username: User.username,
                profilePicture: User.profilePicture,
            },
            markRead: ChatMessage.markRead,
            upVotes: sql`COALESCE(array_length(${ChatMessage.upVotes}, 1), 0)`,
            downVotes: sql`COALESCE(array_length(${ChatMessage.downVotes}, 1), 0)`,
            pinned: ChatMessage.pinned,
            createdAt: ChatMessage.createdAt,
            updatedAt: ChatMessage.updatedAt,
            orderId: ChatMessage.cfOrderId,
            paymentAmount: Order.orderAmount,
            paymentCurrency: Order.orderCurrency,
            reply: {
                messageId: ReplyMessage.id,
                message: ReplyMessage.message,
                username: ReplyUser.username,
            },
        })
        .from(ChatMessage)
        .leftJoin(User, eq(ChatMessage.userId, User.id))
        .leftJoin(Order, eq(ChatMessage.cfOrderId, Order.cfOrderId))
        .leftJoin(ReplyMessage, eq(ChatMessage.replyToId, ReplyMessage.id))
        .leftJoin(ReplyUser, eq(ReplyMessage.userId, ReplyUser.id))
        .where(
            and(
                eq(ChatMessage.streamUid, String(streamId)),
                or(
                    eq(ChatMessage.paymentStatus, "IDLE"),
                    eq(ChatMessage.paymentStatus, "paid")
                )
            )
        )
        .groupBy(
            ChatMessage.id,
            ChatMessage.message,
            User.firstName,
            User.lastName,
            User.username,
            User.profilePicture,
            ChatMessage.markRead,
            ChatMessage.pinned,
            ChatMessage.createdAt,
            ChatMessage.updatedAt,
            Order.orderCurrency,
            Order.orderAmount,
            ReplyMessage.id,
            ReplyMessage.message,
            ReplyUser.username,
            ReplyMessage.userId,
            ChatMessage.replyToId
        )
        .execute();

    res.status(200).json(new ApiResponse(200, { chats: results }));
});

/**
 * !IMPORTANT => Controller for make premium chats creating a razorpay order
 */
const makePremiumChat = asyncHandler(async (req, res) => {
    const user = req.user;
    const { streamId } = req.params;
    const { paymentAmount, message } = req.body;
    if (streamId.trim() == "")
        throw new ApiError(400, "Failed to get streamid.");

    if (!paymentAmount) throw new ApiError(400, "Failed to get order amount.");

    const orderAmt = parseInt(paymentAmount.toString());

    if (Number.isNaN(orderAmt))
        throw new ApiError(400, "Please enter a valid payment amount.");

    const [stream] = await db
        .select()
        .from(Stream)
        .where(eq(Stream.streamingUid, streamId))
        .execute();

    if (!stream)
        throw new ApiError(400, "Failed to get the stream you wanna chat on.");

    const [streamer] = await db
        .select({ razorpayAccountId: StreamerRequest.razorpayAccountId })
        .from(StreamerRequest)
        .where(eq(StreamerRequest.userId, stream.streamerId))
        .execute();

    if (!streamer || !streamer.razorpayAccountId)
        throw new ApiError(400, "Failed to fetch streamer details.");

    const orderResult = await createRazorpayOrder({
        user: req.user as MiddlewareUserT,
        orderAmount: orderAmt,
        transferAccountId: streamer.razorpayAccountId,
    });

    if (!orderResult)
        throw new ApiError(
            400,
            "Failed to create payment order for your premium chat."
        );

    const {
        orderId: newOrderId,
        paymentSessionId,
        paymentStatus,
    } = orderResult;

    const [newChat] = await db
        .insert(ChatMessage)
        .values({
            message: String(message),
            userId: user.id,
            cfOrderId: newOrderId,
            paymentStatus,
            streamUid: streamId.toString(),
            updatedAt: new Date(),
        })
        .returning()
        .execute();

    if (!newChat) throw new ApiError(400, "failed to insert new chat.");

    res.status(201).json(
        new ApiResponse(201, { paymentSessionId, orderId: newOrderId })
    );
});

export {
    createNewStream,
    getAllStreams,
    getStreamById,
    getAllChatsByStreamingId,
    makePremiumChat,
    fetchYoutubeData,
};

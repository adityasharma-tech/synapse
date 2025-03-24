import jwt from "jsonwebtoken";
import establishDbConnection from "../db";

import { Stream } from "../schemas/stream.sql";
import { and, count, eq, or, sql } from "drizzle-orm";
import { ApiResponse } from "../lib/ApiResponse";
import { v4 as uuidv4 } from "uuid";
import { asyncHandler } from "../lib/asyncHandler";
import { ApiError, ErrCodes } from "../lib/ApiError";
import { logger } from "../lib/logger";
import { ChatMessage } from "../schemas/chats.sql";
import { User } from "../schemas/user.sql";
import { createCfOrder, createRazorpayOrder } from "../services/payments.service";
import { MiddlewareUserT } from "../lib/types";
import { Order } from "../schemas/order.sql";

const createNewStream = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const user = req.user;

  if (!title || !user)
    throw new ApiError(
      400,
      "Title is required field.",
      ErrCodes.VALIDATION_ERR
    );

  const db = establishDbConnection();

  const streamingToken = jwt.sign(
    { streamerId: user.id },
    process.env.STREAMER_SECRET_KEY!,
    { expiresIn: "6hr" }
  );

  const streams = await db
    .insert(Stream)
    .values({
      streamTitle: title,
      streamingUid: uuidv4().toString(),
      streamerId: user.id,
      streamingToken,
      updatedAt: new Date(),
    })
    .returning()
    .execute();

  if (!streams || streams.length <= 0)
    throw new ApiError(400, "Failed to create new stream.");

  const stream = streams[0];

  res
    .status(201)
    .json(
      new ApiResponse(201, { stream: { ...stream, streamingToken: undefined } })
    );
});

const getAllStreams = asyncHandler(async (req, res) => {
  const user = req.user;
  const { page, limit } = req.query;

  const currentPage = parseInt(page ? page.toString() : "1");
  const currentLimit = parseInt(limit ? limit.toString() : "10");

  const db = establishDbConnection();

  const results = await db
    .select({
      id: Stream.id,
      streamTitle: Stream.streamTitle,
      streamingUid: Stream.streamingUid,
      streamerId: Stream.streamerId,
      updatedAt: Stream.updatedAt,
    })
    .from(Stream)
    .where(eq(Stream.streamerId, user?.id))
    .offset((currentPage - 1) * currentLimit)
    .limit(currentLimit)
    .execute();

  const [countResult] = await db
    .select({ totalItems: count() })
    .from(Stream)
    .where(eq(Stream.streamerId, user?.id))
    .execute();

  if (!results || !countResult)
    throw new ApiError(400, "Failed to get user/token data.");
  const totalPages = Math.ceil(countResult.totalItems / currentLimit);

  res
    .status(200)
    .json(
      new ApiResponse(200, {
        page: currentPage,
        limit: currentLimit,
        totalPages,
        totalItems: countResult.totalItems,
        data: results,
      })
    );
});

const getStreamById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.info(`Id of stream: ${id}`);
  const db = establishDbConnection();

  const [stream] = await db
    .select()
    .from(Stream)
    .where(eq(Stream.streamingUid, id))
    .execute();

  if (!stream) throw new ApiError(400, "Stream not found.");

  res.status(200).json({ stream });
});

const getAllChatsByStreamingId = asyncHandler(async (req, res) => {
  const { streamId } = req.params;

  const db = establishDbConnection();
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
      paymentCurrency: Order.orderCurrency
    })
    .from(ChatMessage)
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
      Order.orderAmount
    )
    .leftJoin(User, eq(ChatMessage.userId, User.id))
    .leftJoin(Order, eq(ChatMessage.cfOrderId, Order.cfOrderId))
    .where(
      and(
        eq(ChatMessage.streamUid, String(streamId)),
        or(
          eq(ChatMessage.paymentStatus, "IDLE"),
          eq(ChatMessage.paymentStatus, "PAID")
        )
      )
    )
    .execute();

  res.status(200).json(new ApiResponse(200, { chats: results }));
});

const makePremiumChat = asyncHandler(async (req, res) => {
  const user = req.user;
  const { streamId } = req.params;
  const { paymentAmount, message } = req.body;
  if (streamId.trim() == "") throw new ApiError(400, "Failed to get streamid.");

  if (!paymentAmount) throw new ApiError(400, "Failed to get order amount.");

  const orderAmt = parseInt(paymentAmount.toString());

  if (Number.isNaN(orderAmt))
    throw new ApiError(400, "Please enter a valid payment amount.");

  const db = establishDbConnection();

  const [stream] = await db
    .select()
    .from(Stream)
    .where(eq(Stream.streamingUid, streamId))
    .execute();

  if (!stream)
    throw new ApiError(400, "Failed to get the stream you wanna chat on.");

  const orderResult = await createRazorpayOrder({
    user: req.user as MiddlewareUserT,
    orderAmount: orderAmt,
  });

  console.log(orderResult);

  if (!orderResult)
    throw new ApiError(
      400,
      "Failed to create payment order for your premium chat."
    );

  const { orderId: newOrderId, paymentSessionId, paymentStatus } = orderResult;

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

  res.status(201).json(new ApiResponse(201, { paymentSessionId, orderId: newOrderId }));
});

export {
  createNewStream,
  getAllStreams,
  getStreamById,
  getAllChatsByStreamingId,
  makePremiumChat,
};

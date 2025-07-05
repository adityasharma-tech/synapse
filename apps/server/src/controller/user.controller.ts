import { and, eq } from "drizzle-orm";
import { msg91AuthKey } from "../lib/constants";
import {
    createBeneficiary,
    createRazorpayPlan,
} from "../services/payments.service";
import { uploadDocumentOnCloudinary } from "../lib/cloudinary";
import {
    TokenTable,
    User,
    StreamerRequest,
    Plans,
    Emote,
} from "@pkgs/drizzle-client";
import {
    ApiError,
    ApiResponse,
    asyncHandler,
    ErrCodes,
    hasPermission,
    logger,
    MiddlewareUserT,
} from "@pkgs/lib";
import { handleZodError } from "@pkgs/zod-client";
import {
    createPaymentPlanSchema,
    getChannelPlanDetailSchema,
    uploadCustomEmotesSchema,
} from "@pkgs/zod-client/validators";

/**
 * For logout remove the cookies and clear the caches
 */
const logoutHandler = asyncHandler(async (_, res) => {
    res.clearCookie("__Secure-rfc_refresh");
    res.clearCookie("__Secure-rfc_access");

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.status(200).json(new ApiResponse(200, null, "Logout success."));
});

/**
 * Get the current logged in user details
 */
const getUserHandler = asyncHandler(async (req, res) => {
    const user = req.user;
    res.status(200).json(new ApiResponse(200, { user }));
});

/**
 * Update user specific info
 */
const updateUserHandler = asyncHandler(async (req, res) => {
    const user = req.user;

    const updateData = req.body;

    const [dbUser] = await db
        .select()
        .from(User)
        .where(eq(User.id, user?.id))
        .execute();

    if (!dbUser)
        throw new ApiError(400, "User not found.", ErrCodes.DB_ROW_NOT_FOUND);

    await db
        .update(User)
        .set({
            firstName: updateData.firstName ?? dbUser.firstName,
            lastName: updateData.lastName ?? dbUser.lastName,
            username: updateData.username ?? dbUser.username,
        })
        .where(eq(User.id, user?.id))
        .execute();

    res.status(200).json(new ApiResponse(200, null, "User updated success."));
});

/**
 * IMPORTANT (deprecated) => This controller is for cashfree payouts which we
 *                        are not gonna use more.
 */
const applyForStreamer = asyncHandler(async (req, res) => {
    const user = req.user;
    const {
        bankAccountNumber,
        vpa,
        bankIfsc,
        phoneNumber,
        countryCode,
        streetAddress,
        city,
        state,
        postalCode,
    } = req.body;

    if (!user)
        throw new ApiError(
            400,
            "Please provide required fields.",
            ErrCodes.VALIDATION_ERR
        );

    const tokens = await db
        .select()
        .from(TokenTable)
        .where(eq(TokenTable.userId, user.id))
        .execute();

    if (!tokens || tokens.length <= 0)
        throw new ApiError(500, "some error occured.");

    const usrToken = tokens[0];

    // check if user is already a streamer
    if (usrToken.streamerVerificationToken)
        throw new ApiError(400, "You may be already a streamer.");

    const streamerToken = await createBeneficiary({
        bankAccountNumber,
        vpa,
        bankIfsc,
        email: user.email,
        phoneNumber,
        countryCode,
        streetAddress,
        city,
        state,
        postalCode,
        userId: String(user.id),
        name: `${user.firstName} ${user.lastName}`,
    });

    await db
        .update(User)
        .set({ role: "streamer", updatedAt: new Date() })
        .where(eq(User.id, user.id))
        .execute();

    const result = await db
        .update(TokenTable)
        .set({
            streamerVerificationToken: streamerToken,
            updatedAt: new Date(),
        })
        .where(eq(TokenTable.userId, user.id))
        .execute();

    if (!result)
        throw new ApiError(
            400,
            "Failed to update streamer token.",
            ErrCodes.DB_UPDATE_ERR
        );
    res.status(201).json(new ApiResponse(201, null));
});

/**
 * Controller to apply for streamer with razorpay route payments
 * - this will submit an application which will be reviewed by admin
 *    and then pass to next
 */
const applyForStreamerV2 = asyncHandler(async (req, res) => {
    const user = req.user;

    console.log(`Form Data: `, req.body);
    const {
        bankAccountNumber,
        bankIfsc,
        phoneNumber,
        streetAddress,
        city,
        state,
        postalCode,
        youtubeChannelName,
        authToken,
        panNumber,
    } = req.body;

    const documentFilePath = req.file?.path;

    if (!documentFilePath)
        throw new ApiError(400, "required document not attached yet.");

    if (
        [
            bankAccountNumber,
            bankIfsc,
            phoneNumber,
            streetAddress,
            city,
            state,
            postalCode,
            youtubeChannelName,
            authToken,
            panNumber,
        ].some((value) => (value ? value.trim() == "" : true))
    ) {
        throw new ApiError(400, "Validation error", ErrCodes.VALIDATION_ERR);
    }

    const url = new URL(
        "https://control.msg91.com/api/v5/widget/verifyAccessToken"
    );
    let headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };

    let body = { authkey: msg91AuthKey, "access-token": authToken };
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    });
    const result = await response.json();

    // TODO:  Some failure in verifying the phone auth token to double check btw
    //        it is already checked in frontend but 'frontend ke code par barosa nai karna'
    console.log(result);

    // fetch streamer previous requests
    const [preRequest] = await db
        .select({
            requestStatus: StreamerRequest.requestStatus,
            userId: StreamerRequest.userId,
        })
        .from(StreamerRequest)
        .where(eq(StreamerRequest.userId, user.id))
        .execute();

    // check if it is already done or not
    if (preRequest && preRequest.requestStatus == "done")
        throw new ApiError(400, "You application is already fulfilled.");

    if (preRequest)
        throw new ApiError(400, "You already applied for streamer request.");

    // pan/aadhar document upload to cloudinary database
    const docUploadResult = await uploadDocumentOnCloudinary(documentFilePath);

    if (!docUploadResult)
        throw new ApiError(
            400,
            "Failed to upload document to cloudinary resources."
        );

    // Adding new application to our database
    const [request] = await db
        .insert(StreamerRequest)
        .values({
            accountEmail: user.email,
            accountName: `${user.firstName} ${user.lastName}`,
            businessName: youtubeChannelName,
            userId: user.id,
            bankAccountNumber,
            bankIfscCode: bankIfsc,
            city,
            phoneNumber,
            postalCode,
            state,
            streetAddress,
            panCard: panNumber.toUpperCase().trim(),
            kycDocumentUrl: docUploadResult,
        })
        .returning()
        .execute();

    if (!request) throw new ApiError(400, "Failed to submit your application");

    res.status(201).json(
        new ApiResponse(201, "Your application is submitted succesfully.")
    );
});

const getAllWatchHistory = asyncHandler(async (req, res) => {
    const user = req.user;

    const [dbUser] = await db
        .select({ watchHistory: User.watchHistory })
        .from(User)
        .where(eq(User.id, user.id))
        .execute();

    if (!dbUser) throw new ApiError(400, "Failed to get user info.");

    res.status(200).json(
        new ApiResponse(200, { watchHistory: dbUser.watchHistory })
    );
});

const createPaymentPlan = asyncHandler(async (req, res) => {
    const { inrAmountPerMonth, planDetails, planName } = handleZodError(
        createPaymentPlanSchema.safeParse(req.body)
    );

    if (!hasPermission(req.user as MiddlewareUserT, "plan:create"))
        throw new ApiError(
            401,
            "You are not authorized to create a plan.",
            ErrCodes.UNAUTHORIZED
        );

    await db.transaction(async (tx) => {
        const [result] = await tx
            .insert(Plans)
            .values({
                amount: inrAmountPerMonth,
                details: planDetails,
                name: planName,
                streamerId: req.user.id,
            })
            .returning()
            .execute();
        if (!result) throw new ApiError(400, "Failed to create plan.");
        try {
            const plan = await createRazorpayPlan(
                planName,
                planDetails,
                inrAmountPerMonth
            );
            const [updatedResult] = await tx
                .update(Plans)
                .set({ razorpayPlanId: plan.id })
                .where(eq(Plans.id, result.id))
                .returning()
                .execute();
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        { plan: updatedResult },
                        "Payment plan created"
                    )
                );
        } catch (error) {
            tx.rollback();
            throw error;
        }
    });

    throw new ApiError(200, "Failed to create plan.");
});

const getChannelPlanDetails = asyncHandler(async (req, res) => {
    const { streamerId } = handleZodError(
        getChannelPlanDetailSchema.safeParse(req.query)
    );

    if (!hasPermission(req.user as MiddlewareUserT, "plan:view"))
        throw new ApiError(
            401,
            "You are not authorized to get a plan.",
            ErrCodes.UNAUTHORIZED
        );

    const [result] = await db
        .select({
            planAmount: Plans.amount,
            planDetails: Plans.details,
            planName: Plans.name,
            streamerId: Plans.streamerId,
        })
        .from(Plans)
        .where(eq(Plans.streamerId, streamerId))
        .execute();

    if (!result)
        throw new ApiError(400, "Failed to fetch streamer plan details.");

    res.status(200).json(new ApiResponse(200, { plan: result }));
});

const uploadCustomEmotes = asyncHandler(async (req, res) => {
    if (!hasPermission(req.user as MiddlewareUserT, "emote:create"))
        throw new ApiError(403, "You have no permission to create emotes.");

    if (!req.file)
        throw new ApiError(
            400,
            "Please upload the emoji image as your choice."
        );

    const { code: preCode, name } = handleZodError(
        uploadCustomEmotesSchema.safeParse(req.body)
    );

    const code = ":" + req.user.id + "_" + preCode + ":";

    const imageUrl = await uploadDocumentOnCloudinary(req.file.path, {
        transformation: {
            height: 28,
            width: 28,
        },
    });

    if (!imageUrl)
        throw new ApiError(
            400,
            "Failed to upload image to third party provider."
        );

    await db
        .insert(Emote)
        .values({ code, imageUrl, name, streamerId: req.user.id })
        .execute();

    res.status(200).json(new ApiResponse(200, null, "custom emote created"));
});

const getAllEmotesForAStreamer = asyncHandler(async (req, res) => {
    const { streamerId } = req.params;

    const emotes = await db
        .select({
            code: Emote.code,
            name: Emote.name,
            imageUrl: Emote.imageUrl,
        })
        .from(Emote)
        .where(eq(Emote.streamerId, Number(streamerId)))
        .execute();

    res.status(200).json(new ApiResponse(200, emotes));
});

const deleteEmoteByCode = asyncHandler(async (req, res) => {
    if (!hasPermission(req.user as MiddlewareUserT, "emote:delete-own"))
        throw new ApiError(403, "You have no permission to create emotes.");

    const { id } = req.params;

    await db
        .delete(Emote)
        .where(and(eq(Emote.code, id), eq(Emote.streamerId, req.user.id)))
        .execute();

    res.status(200).json(new ApiResponse(200, null, "Emote deleted."));
});

export {
    logoutHandler,
    getUserHandler,
    applyForStreamer,
    deleteEmoteByCode,
    createPaymentPlan,
    updateUserHandler,
    uploadCustomEmotes,
    applyForStreamerV2,
    getAllWatchHistory,
    getChannelPlanDetails,
    getAllEmotesForAStreamer,
};

import crypto from "crypto";

import { env } from "@pkgs/zod-client";
import { Server } from "socket.io";
import { eq, sql } from "drizzle-orm";
import { Cashfree } from "cashfree-pg";
import { getRazorpayInstance } from "../services/payments.service";
import { ChatMessage, Order, Subsciptions, User } from "@pkgs/drizzle-client";
import {
    logger,
    ApiError,
    ApiResponse,
    asyncHandler,
    SocketEventEnum,
} from "@pkgs/lib";
// import { getPayoutChannel } from "../services/queue.service"; // uncomment if you wanna use queue system

Cashfree.XClientId = env.CF_PAYMENT_CLIENT_ID;
Cashfree.XClientSecret = env.CF_PAYMENT_CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

const handleVerifyCfOrder = asyncHandler(async (req, res) => {
    const payload = req.body;
    try {
        // const verified = Cashfree.PGVerifyWebhookSignature(String(req.headers["x-webhook-signature"]), JSON.stringify(req.body), String(req.headers["x-webhook-timestamp"]))
        if (payload.type == "WEBHOOK")
            return res.status(200).json(new ApiResponse(200, "Success"));

        if (payload.type != "PAYMENT_SUCCESS_WEBHOOK")
            throw new ApiError(404, "Not found!");
    } catch (error: any) {
        logger.error(
            `Error during verifiying Signature: ${error.message} \n`,
            error
        );
        throw new ApiError(401, "Access Denied!");
    }
    const order = await Cashfree.PGFetchOrder(
        env.CF_PAYMENT_XAPI_VERSION,
        payload["data"]["order"]["order_id"]
    );

    const [orderUpdate] = await db
        .update(Order)
        .set({
            orderAmount: order.data.order_amount,
            orderStatus: order.data.order_status,
        })
        .where(eq(Order.cfOrderId, String(order.data.order_id)))
        .returning()
        .execute();

    if (order.data.order_status === "PAID") {
        const [preChatMessage] = await db
            .select({ paymentStatus: ChatMessage.paymentStatus })
            .from(ChatMessage)
            .where(eq(ChatMessage.cfOrderId, orderUpdate.cfOrderId))
            .execute();

        if (preChatMessage.paymentStatus === "PAID")
            return res
                .status(200)
                .json(new ApiResponse(200, "Webhook success"));

        const [chatMessage] = await db
            .update(ChatMessage)
            .set({ paymentStatus: "PAID" })
            .where(eq(ChatMessage.cfOrderId, orderUpdate.cfOrderId))
            .returning()
            .execute();

        const [user] = await db
            .select({
                fullName: sql`${User.firstName} || ' ' || ${User.lastName}`,
                username: User.username,
                profilePicture: User.profilePicture,
            })
            .from(User)
            .groupBy(
                User.firstName,
                User.lastName,
                User.username,
                User.profilePicture
            )
            .where(eq(User.id, chatMessage.userId))
            .execute();

        if (!chatMessage || !user)
            throw new ApiError(400, "Failed to get user or chatMessage");

        if (chatMessage.streamUid) {
            const io = global.io as Server;
            io.to(chatMessage.streamUid).emit(
                SocketEventEnum.PAYMENT_CHAT_CREATE_EVENT,
                {
                    message: chatMessage.message,
                    id: String(chatMessage.id),
                    markRead: false,
                    upVotes: 0,
                    downVotes: 0,
                    user: { ...user, role: "viewer" },
                    pinned: false,
                    orderId: orderUpdate.cfOrderId,
                    paymentAmount: orderUpdate.orderAmount,
                }
            );
        }
    }

    if (!orderUpdate) throw new ApiError(400, "Failed to update order");
    res.status(200).json(new ApiResponse(200, "Webhook success"));
});

/**
 * Razorpay Verfiy Order
 */
const handleVerfiyRazorpayOrder = asyncHandler(async (req, res) => {
    const razorpaySignature = req.headers["x-razorpay-signature"];
    const body = req.body;

    // create a signature using the razorpay webhook secret and the payload
    // data and match with the header signature to make sure to accept only
    // requests from razorpay side
    const generatedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest("hex");

    // ...
    if (generatedSignature !== razorpaySignature) {
        throw new ApiError(401, "Invalid signature");
    }

    const event = body;

    // logging event data for debugging
    logger.debug(`Event payload: ${JSON.stringify(event)}`);

    /**
     * Only if you want to use queue system to send payouts
     */
    // const payoutChannel = await getPayoutChannel()

    if (event.event === "order.paid") {
        // get razorpay instance
        const instance = getRazorpayInstance();

        // getting the order if from the payload data
        const orderId = event["payload"]["order"]["entity"]["id"] as string;

        // Refetching order data from razorpay to double check unless you can use the payload data for this
        const order = await instance.orders.fetch(orderId);

        // update the order status
        const [orderUpdate] = await db
            .update(Order)
            .set({ orderAmount: order.amount_paid, orderStatus: order.status })
            .where(eq(Order.cfOrderId, String(orderId)))
            .returning()
            .execute();

        /**
         * const payload = JSON.stringify({
         * orderId
         * })
         * payoutChannel.sendToQueue(RMQ_PAYOUT_QUEUE, Buffer.from(payload));
         */

        // ...
        if (order.status == "paid") {
            const [preChatMessage] = await db
                .select({ paymentStatus: ChatMessage.paymentStatus })
                .from(ChatMessage)
                .where(eq(ChatMessage.cfOrderId, orderUpdate.cfOrderId))
                .execute();

            // if it is already settled to paid don't need to proceed further
            if (preChatMessage.paymentStatus === "paid") {
                logger.info(
                    `Payment is already send through sockets., ${preChatMessage.paymentStatus}`
                );
                return res
                    .status(200)
                    .json(new ApiResponse(200, "Webhook success"));
            }

            // update the chat message status to make sure it will be shown in the chat box
            const [chatMessage] = await db
                .update(ChatMessage)
                .set({ paymentStatus: "paid" })
                .where(eq(ChatMessage.cfOrderId, orderUpdate.cfOrderId))
                .returning()
                .execute();

            // ...
            const [user] = await db
                .select({
                    fullName: sql`${User.firstName} || ' ' || ${User.lastName}`,
                    username: User.username,
                    profilePicture: User.profilePicture,
                })
                .from(User)
                .groupBy(
                    User.firstName,
                    User.lastName,
                    User.username,
                    User.profilePicture
                )
                .where(eq(User.id, chatMessage.userId))
                .execute();

            if (!chatMessage || !user)
                throw new ApiError(400, "Failed to get user or chatMessage");

            if (chatMessage.streamUid) {
                // send the message to the sockets if not send
                const io = global.io as Server;
                io.to(chatMessage.streamUid).emit(
                    SocketEventEnum.PAYMENT_CHAT_CREATE_EVENT,
                    {
                        message: chatMessage.message,
                        id: String(chatMessage.id),
                        markRead: false,
                        upVotes: 0,
                        downVotes: 0,
                        user: { ...user, role: "viewer" },
                        pinned: false,
                        orderId: orderUpdate.cfOrderId,
                        paymentAmount: orderUpdate.orderAmount,
                    }
                );
            }
        }
    } else {
        throw new ApiError(404, "Event not found.");
    }
    return res.status(200).json(new ApiResponse(200, "Sucess"));
});

const handleUpdateSubscriptionStatus = asyncHandler(async (req, res) => {
    const razorpaySignature = req.headers["x-razorpay-signature"];
    const body = req.body;

    // create a signature using the razorpay webhook secret and the payload
    // data and match with the header signature to make sure to accept only
    // requests from razorpay side
    const generatedSignature = crypto
        .createHmac("sha256", env.SUBSCRIPTION_WEBHOOK_KEY)
        .update(JSON.stringify(body))
        .digest("hex");

    // ...
    if (generatedSignature !== razorpaySignature) {
        throw new ApiError(401, "Invalid signature");
    }

    const event = body;

    // logging event data for debugging
    logger.debug(`subscription event payload: ${JSON.stringify(event)}`);

    db.transaction(async (tx) => {
        try {
            if (event.event == "subscription.activated") {
                const subscriptionEntity = event.payload.subscription.entity;
                const orderEntity = event.payload.payment.entity;
                const [updatedSubscription] = await tx
                    .update(Subsciptions)
                    .set({ status: subscriptionEntity.status })
                    .where(
                        eq(
                            Subsciptions.razorpaySubscriptionId,
                            subscriptionEntity.id
                        )
                    )
                    .returning();
                if (!updatedSubscription)
                    throw new ApiError(
                        400,
                        "Failed to update subscription status"
                    );
                await tx
                    .insert(Order)
                    .values({
                        cfOrderId: orderEntity.order_id,
                        orderAmount: orderEntity.amount,
                        orderExpiryTime: new Date().toLocaleDateString(),
                        userId: 3,
                        orderStatus: orderEntity.status,
                        orderCurrency: orderEntity.currency,
                        orderNote: JSON.stringify({
                            invoiceId: orderEntity.invoice_id,
                        }),
                    })
                    .execute();
            } else {
                throw new ApiError(400, "Failed to call webhook");
            }
        } catch (error) {
            logger.error(
                `Error during calling webhook updateSubscriptionData: `
            );
            logger.error(error);
            tx.rollback();
            throw new ApiError(400, "Failed to call webhook");
        }
    });

    res.status(200).json(new ApiResponse(200, null));
});

export {
    handleVerifyCfOrder,
    handleVerfiyRazorpayOrder,
    handleUpdateSubscriptionStatus,
};

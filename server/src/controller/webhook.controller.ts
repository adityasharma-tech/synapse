import crypto from "crypto";
import establishDbConnection from "../db";
import Razorpay from "razorpay";

import { User } from "../schemas/user.sql";
import { Order } from "../schemas/order.sql";
import { logger } from "../lib/logger";
import { Server } from "socket.io";
import { eq, sql } from "drizzle-orm";
import { Cashfree } from "cashfree-pg";
import { ApiError } from "../lib/ApiError";
import { ChatMessage } from "../schemas/chats.sql";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { SocketEventEnum } from "../lib/constants";
import { getRazorpayInstance } from "../services/payments.service";

Cashfree.XClientId = process.env.CF_PAYMENT_CLIENT_ID!;
Cashfree.XClientSecret = process.env.CF_PAYMENT_CLIENT_SECRET!;
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
    process.env.CF_PAYMENT_XAPI_VERSION!,
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
      return res.status(200).json(new ApiResponse(200, "Webhook success"));

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

const handleVerfiyRazorpayOrder = asyncHandler(async (req, res) => {
  const razorpaySignature = req.headers["x-razorpay-signature"];
  const body = req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(JSON.stringify(body))
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new ApiError(401, "Invalid signature");
  }

  const event = body;

  console.log("event", event);

  if (event.event === "order.paid") {
    const instance = getRazorpayInstance();
    const orderId = event["payload"]["order"]["entity"]["id"] as string;
    const order = await instance.orders.fetch(orderId);
    const [orderUpdate] = await db
      .update(Order)
      .set({ orderAmount: order.amount_paid, orderStatus: order.status })
      .where(eq(Order.cfOrderId, String(orderId)))
      .returning()
      .execute();

    if (order.status === "paid") {
      const [preChatMessage] = await db
        .select({ paymentStatus: ChatMessage.paymentStatus })
        .from(ChatMessage)
        .where(eq(ChatMessage.cfOrderId, orderUpdate.cfOrderId))
        .execute();

      if (preChatMessage.paymentStatus === "paid")
        return res.status(200).json(new ApiResponse(200, "Webhook success"));

      const [chatMessage] = await db
        .update(ChatMessage)
        .set({ paymentStatus: "paid" })
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
  } else {
    throw new ApiError(404, "Event not found.");
  }
  return res.status(200).json(new ApiResponse(200, "Sucess"));
});

export { handleVerifyCfOrder, handleVerfiyRazorpayOrder };

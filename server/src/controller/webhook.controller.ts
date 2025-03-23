import establishDbConnection from "../db";

import { eq } from "drizzle-orm";
import { Order } from "../schemas/order.sql";
import { Cashfree } from "cashfree-pg";
import { ApiError } from "../lib/ApiError";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";


Cashfree.XClientId = process.env.CF_PAYMENT_CLIENT_ID!;
Cashfree.XClientSecret = process.env.CF_PAYMENT_CLIENT_SECRET!;
Cashfree.XEnvironment = process.env.CF_PAYMENT_MODE == "sandbox" ? Cashfree.Environment.SANDBOX : Cashfree.Environment.PRODUCTION;

const handleVerifyCfOrder = asyncHandler(async (req, res) => {
  const payload = req.body;
  const headers = req.headers;
  let xWebhookSignature = headers["x-webhook-signature"];
  let xWebhookTimestamp = headers["x-webhook-timestamp"];
  let verified;
  try {
    verified = Cashfree.PGVerifyWebhookSignature(
      String(xWebhookSignature),
      payload,
      String(xWebhookTimestamp)
    );

    if (verified.type != "PAYMENT_SUCCESS_WEBHOOK")
      throw new ApiError(404, "Not found!");
  } catch (error) {
    throw new ApiError(401, "Access Denied!");
  }
  const order = await Cashfree.PGFetchOrder(
    process.env.CF_PAYMENT_XAPI_VERSION!,
    payload["data"]["order"]["order_id"]
  );

  const db = establishDbConnection();
  const [orderUpdate] = await db
    .update(Order)
    .set({
      orderAmount: order.data.order_amount,
      orderStatus: order.data.order_status,
    })
    .where(eq(Order.cfOrderId, String(order.data.order_id)))
    .returning()
    .execute();

  if (!orderUpdate) throw new ApiError(400, "Failed to update order");
  res.status(200).json(new ApiResponse(200, "Webhook success"));
});

export { handleVerifyCfOrder };
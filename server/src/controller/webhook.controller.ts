import establishDbConnection from "../db";

import { eq } from "drizzle-orm";
import { Order } from "../schemas/order.sql";
import { logger } from "../lib/logger";
import { Cashfree } from "cashfree-pg";
import { ApiError } from "../lib/ApiError";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { Server } from "socket.io"

Cashfree.XClientId = process.env.CF_PAYMENT_CLIENT_ID!;
Cashfree.XClientSecret = process.env.CF_PAYMENT_CLIENT_SECRET!;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX


const handleVerifyCfOrder = asyncHandler(async (req, res) => {
  const payload = req.body;
  try {
    // verified = Cashfree.PGVerifyWebhookSignature(String(req.headers["x-webhook-signature"]), JSON.stringify(req.body), String(req.headers["x-webhook-timestamp"]))
    if (payload.type == "WEBHOOK")
      return res.status(200).json(new ApiResponse(200, "Success"));

    if (payload.type != "PAYMENT_SUCCESS_WEBHOOK")
      throw new ApiError(406, "Not found!");
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

  if(order.data.order_status === "PAID") {
        
  }

  if (!orderUpdate) throw new ApiError(400, "Failed to update order");
  res.status(200).json(new ApiResponse(200, "Webhook success"));
});

export { handleVerifyCfOrder };

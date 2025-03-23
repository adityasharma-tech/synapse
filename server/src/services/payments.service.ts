import { ApiError } from "../lib/ApiError";
import { logger } from "../lib/logger";
import crypto from "crypto";
import { signStreamerVerficationToken } from "../lib/utils";
import { MiddlewareUserT } from "../lib/types";
import { v4 as uuidv4 } from "uuid";
import { Cashfree, CreateOrderRequest } from "cashfree-pg";
import establishDbConnection from "../db";
import { Order } from "../schemas/order.sql";
import { eq } from "drizzle-orm";

const cashfreeClientHeaders = new Headers();
cashfreeClientHeaders.set("x-api-version", process.env.CF_XAPI_VERSION!);
cashfreeClientHeaders.set("x-client-id", process.env.CF_CLIENT_ID!);
cashfreeClientHeaders.set("x-client-secret", process.env.CF_CLIENT_SECRET!);
cashfreeClientHeaders.set("Content-Type", "application/json");

Cashfree.XClientId = process.env.CF_CLIENT_ID!;
Cashfree.XClientSecret = process.env.CF_CLIENT_SECRET!;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

interface CreateBeneficiaryPropT {
  userId: string;
  name: string;
  vpa: string;
  bankAccountNumber: string;
  bankIfsc: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
}

interface CreateOrderPropT {
  orderAmount: number;
  user: MiddlewareUserT;
}

const createBeneficiary: (p: CreateBeneficiaryPropT) => Promise<string> =
  function (props) {
    const payload = {
      beneficiary_id: crypto.randomBytes(24).toString("hex"),
      beneficiary_name: props.name,
      beneficiary_instrument_details: {
        vpa: props.vpa, // upi id
        bank_account_number: props.bankAccountNumber,
        bank_ifsc: props.bankIfsc,
      },
      beneficiary_contact_details: {
        beneficiary_email: props.email,
        beneficiary_phone: props.phoneNumber,
        beneficiary_country_code: props.countryCode,
        beneficiary_address: props.streetAddress,
        beneficiary_city: props.city,
        beneficiary_state: props.state,
        beneficiary_postal_code: props.postalCode,
      },
    };
    const options = {
      method: "POST",
      headers: cashfreeClientHeaders,
      body: JSON.stringify(payload),
    };

    return new Promise(async (resolve, reject) => {
      try {
        const result = await fetch(
          "https://sandbox.cashfree.com/payout/beneficiary",
          options
        );
        const response = await result.json();
        console.log("response,. ", response);
        if (response["beneficiary_status"] != "VERIFIED")
          throw new ApiError(400, "Failed to create new beneficiary.");

        const streamerToken = signStreamerVerficationToken({
          beneficiaryId: response["beneficiary_id"],
          userId: props.userId,
          addedAt: response["added_on"],
        });

        resolve(streamerToken);
      } catch (error: any) {
        console.error(`Erorr:`, error);
        logger.error(`Error during creating new beneficiary: ${error.message}`);
        reject(error);
      }
    });
  };

// {"type":"invalid_request_error","code":"beneficiary_contact_details.beneficiary_country_code_invalid","message":"beneficiary_contact_details.beneficiary_country_code : invalid value provided. Value received: in"}
// {"beneficiary_id":"test_beneficiary","beneficiary_name":"Aditya Sharma","beneficiary_instrument_details":{"bank_account_number":"0112345678","bank_ifsc":"INDB0000007","vpa":"s2t@upi"},"beneficiary_contact_details":{"beneficiary_phone":"1234567890","beneficiary_country_code":"+91","beneficiary_email":"aditya@adityasharma.live","beneficiary_address":"Some street address","beneficiary_city":"Some city","beneficiary_state":"Bihar","beneficiary_postal_code":"822121"},"beneficiary_status":"VERIFIED","added_on":"2025-03-16T16:34:10"}

const createCfOrder: (p: CreateOrderPropT) => Promise<string | undefined> =
  async function (props) {
    const user = props.user;
    const orderId = uuidv4().toString();

    const payload: CreateOrderRequest = {
      order_id: orderId,
      customer_details: {
        customer_id: String(user.id),
        customer_phone: user.phoneNumber ?? "",
        customer_email: user.email,
        customer_name: `${user.firstName} ${user.lastName}`,
      },
      order_amount: props.orderAmount,
      order_currency: "INR",
      order_meta: {
        return_url: `https://test.cashfree.com/pgappsdemos/return.php?order_id=${orderId}`,
      },
      order_expiry_time: new Date(1000 * 60 * 20).toISOString(),
      order_note: "",
    };
    const db = establishDbConnection();
    const [dbOrder] = await db
      .insert(Order)
      .values({
        cfOrderId: orderId,
        orderAmount: payload.order_amount,
        orderExpiryTime: String(payload.order_expiry_time),
        userId: Number(props.user.id),
        orderCurrency: "INR",
        orderStatus: "PENDING",
        paymentSessionId: "",
        orderNote: "",
      })
      .returning()
      .execute();

    if (!dbOrder) throw new ApiError(400, "Failed to create order;");
    const order = await Cashfree.PGCreateOrder(
      process.env.CF_XAPI_VERSION!,
      payload
    );
    const paymentSessionId = order.data.payment_session_id;

    await db
      .update(Order)
      .set({
        orderStatus: order.data.order_status ?? "PENDING",
        paymentSessionId,
      })
      .where(eq(Order.id, dbOrder.id))
      .execute();

    return paymentSessionId;
  };

export { createBeneficiary, createCfOrder };

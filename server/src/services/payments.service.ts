import crypto from "crypto";
import axios, { AxiosHeaders } from "axios";
import base64 from "base-64"
import { eq } from "drizzle-orm";
import { Order } from "../schemas/order.sql";
import { logger } from "../lib/logger";
import { ApiError } from "../lib/ApiError";
import { MiddlewareUserT } from "../lib/types";
import { Cashfree, CreateOrderRequest } from "cashfree-pg";
import { signStreamerVerficationToken } from "../lib/utils";
import "dotenv/config";
import OrderId from "order-id";
import Razorpay from "razorpay";
import { Orders } from "razorpay/dist/types/orders";
import { Accounts } from "razorpay/dist/types/accounts";
import StreamerRequest from "../schemas/streamerRequest.sql";

const cashfreeClientHeaders = new Headers();
cashfreeClientHeaders.set("x-api-version", process.env.CF_PAYOUT_XAPI_VERSION!);
cashfreeClientHeaders.set("x-client-id", process.env.CF_PAYOUT_CLIENT_ID!);
cashfreeClientHeaders.set(
  "x-client-secret",
  process.env.CF_PAYOUT_CLIENT_SECRET!
);
cashfreeClientHeaders.set("Content-Type", "application/json");

// specifically for cashfree-pg
Cashfree.XClientId = process.env.CF_PAYMENT_CLIENT_ID!;
Cashfree.XClientSecret = process.env.CF_PAYMENT_CLIENT_SECRET!;
Cashfree.XEnvironment =
  process.env.CF_PAYMENT_MODE == "sandbox"
    ? Cashfree.Environment.SANDBOX
    : Cashfree.Environment.PRODUCTION;

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

const getRazorpayInstance = function () {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_SECRET_KEY!,
  });
};

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

/**
 * this function inserts a new order first in the db and then make
 * a new order in the cashfree to get the paymentSessionId in return which will be required in the frontend
 * to start a payment session by cashfree to make premium chats
 * @param {CreateOrderPropT} props
 * @returns {Promise<string | undefined>} - a promise which will return a paymentSessionId as a result
 */
const createCfOrder: (
  p: CreateOrderPropT
) => Promise<
  | { orderId: string; paymentStatus: string; paymentSessionId: string }
  | undefined
> = async function (props) {
  const user = props.user;
  const orderId = OrderId().generate().replace("-", "");

  // configuration for the cashfree to create a new payment gateway session id
  const payload: CreateOrderRequest = {
    order_id: orderId,
    customer_details: {
      customer_id: String(user.id),
      customer_phone: user.phoneNumber ?? "1234567890",
      customer_email: user.email,
      customer_name: `${user.firstName} ${user.lastName}`,
    },
    order_amount: props.orderAmount,
    order_currency: "INR",
    order_meta: {
      return_url: `https://test.cashfree.com/pgappsdemos/return.php?order_id=${orderId}`,
      // notify_url: `https://synapse-api-local.adityasharma.live/api/v1/webhook/notify`
    },
    order_note: "",
  };

  // creates an order in the Order table of postgress db using drizzle-orm
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
  let order;
  try {
    // using cashfree-pg this will make an api request to create an order on cashfree service for paymentSessionId
    order = await Cashfree.PGCreateOrder(
      process.env.CF_PAYMENT_XAPI_VERSION!, // x-api-version: cashfree api version
      payload
    );
  } catch (err) {
    // For now deleting previous order may be fine.
    await db.delete(Order).where(eq(Order.id, dbOrder.id)).execute();
    throw new ApiError(400, "Something went wrong with cf order creation.");
  }
  const paymentSessionId = order.data.payment_session_id;

  // updating the order table row
  await db
    .update(Order)
    .set({
      orderStatus: order.data.order_status ?? "PENDING",
      paymentSessionId,
    })
    .where(eq(Order.id, dbOrder.id))
    .execute();

  return {
    orderId,
    paymentSessionId: String(paymentSessionId),
    paymentStatus: String(order.data.order_status),
  };
};

const createRazorpayOrder: (
  p: CreateOrderPropT
) => Promise<
  | {
      orderId: string;
      paymentStatus: "created" | "attempted" | "paid";
      paymentSessionId: string;
    }
  | undefined
> = async function (props) {
  const user = props.user;

  const orderOptions: Orders.RazorpayOrderCreateRequestBody = {
    amount: props.orderAmount * 100, // because we are taking from frontend in ruppes
    currency: "INR",
    receipt: `reciept#${Date.now()}`,
    customer_details: {
      contact: String(user.phoneNumber),
      email: user.email,
      billing_address: {
        contact: String(user.phoneNumber),
        country: "IN",
        name: String(user.firstName + " " + user.lastName),
      },
      name: `${user.firstName} ${user.lastName}`,
      shipping_address: {},
    },
  };

  try {
    // using razorpay, this will make an api request to create an order on razorpay payment service for paymentSessionId
    const instance = getRazorpayInstance();

    const order = await instance.orders.create(orderOptions);

    // updating the order table row
    const [dbOrder] = await db
      .insert(Order)
      .values({
        cfOrderId: order.id,
        orderAmount: +order.amount,
        orderExpiryTime: new Date(1000 * 14 * 60).toUTCString(),
        userId: user.id,
        orderCurrency: order.currency,
        orderStatus: order.status,
        paymentSessionId: null,
      })
      .returning()
      .execute();

    return {
      orderId: String(dbOrder.cfOrderId),
      paymentSessionId: "",
      paymentStatus: order.status,
    };
  } catch (err) {
    console.error(err);
    throw new ApiError(400, "Something went wrong with cf order creation.");
  }
};

const createLinkedAccount = async function (
  requestStatus:
    | "pending"
    | "account_created"
    | "stakeholder_created"
    | "tnc_accepted"
    | "account_added"
    | "done",
  options: Accounts.RazorpayAccountCreateRequestBody,
  accountData: {
    accountId: string | null;
    productConfigurationId: string | null;
    accountNumber: string;
    ifscCode: string;
    beneficiaryName: string;
  }
) {
  const instance = getRazorpayInstance();
  let accountCreateResult: Accounts.RazorpayAccount;

  if (requestStatus == "pending") {
    // if (!options.legal_info?.pan)
    //   throw new ApiError(400, "You have to provide pan card.");
    console.log(JSON.stringify(options));
    accountCreateResult = await instance.accounts.create(options);

    await db
      .update(StreamerRequest)
      .set({ razorpayAccountId: accountCreateResult.id, requestStatus: "account_created", updatedAt: new Date() })
      .where(eq(StreamerRequest.accountEmail, options.email))
      .execute();

    requestStatus = "account_created";
    accountData.accountId = accountCreateResult.id

    logger.info(
      `Account creation result: ${JSON.stringify(accountCreateResult)}`
    );
  }
  if (requestStatus == "account_created") {
    const address = options.profile.addresses
      ?.registered as Accounts.ProfileAddresses;
    logger.info(`Primary phone number: ${JSON.stringify(options.phone)}`);

    const stakeholderResult = await instance.stakeholders.create(
      accountData.accountId!,
      {
        name: options.contact_name,
        email: options.email,
        kyc: { pan: options.legal_info?.pan ?? "AAAPA1234A" },
        addresses: {
          residential: {
            city: address.city,
            country: address.country,
            postal_code: address.postal_code,
            state: address.state,
            street: address.street1,
          },
        },
        phone: {
          primary: options.phone
            ? options.phone.toString().replace("+91", "")
            : "1234567890",
        },
      }
    );

    await db
      .update(StreamerRequest)
      .set({ requestStatus: "stakeholder_created" })
      .where(eq(StreamerRequest.accountEmail, options.email))
      .execute();

    requestStatus = "stakeholder_created"

    logger.info(
      `Stakeholder creation result: ${JSON.stringify(stakeholderResult)}`
    );
  }

  if (requestStatus == "stakeholder_created") {
    const productConfiguration =
      await instance.products.requestProductConfiguration(
        accountData.accountId!,
        { product_name: "route", tnc_accepted: true }
      );

    await db
      .update(StreamerRequest)
      .set({ productConfigurationId: productConfiguration.id, requestStatus: "tnc_accepted", updatedAt: new Date() })
      .where(eq(StreamerRequest.accountEmail, options.email))
      .execute();
    
    accountData.productConfigurationId = productConfiguration.id
    
    requestStatus = "tnc_accepted"

    logger.info(
      `product configuration result: ${JSON.stringify(productConfiguration)}`
    );
  }
  if (requestStatus == "tnc_accepted") {

    const url = (`https://api.razorpay.com/v2/accounts/${accountData.accountId}/products/${accountData.productConfigurationId}`)
    const authorizationToken = `Basic ${base64.encode(process.env.RAZORPAY_KEY_ID! + ":" + process.env.RAZORPAY_SECRET_KEY!)}`

    const payload = {
      settlements: {
        account_number: accountData.accountNumber,
        ifsc_code: accountData.ifscCode.toUpperCase(),
        beneficiary_name: accountData.beneficiaryName
      },
      tnc_accepted: true
    };

    const request = await axios.patch(url, JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json",
        "Authorization": authorizationToken
      }
    })
    const response = request.data

    logger.info(`acount id add: ${JSON.stringify(response)}`);

    if (!response.id)
      throw new ApiError(400, "Failed to create linked account.");

    await db
      .update(StreamerRequest)
      .set({ requestStatus: "account_added", updatedAt: new Date() })
      .where(eq(StreamerRequest.accountEmail, options.email))
      .execute();

    return accountData.accountId;
  }
  if((requestStatus == "account_added") || (requestStatus == "done")){
    return accountData.accountId
  }
  return null;
};

export {
  createBeneficiary,
  createCfOrder,
  createRazorpayOrder,
  getRazorpayInstance,
  createLinkedAccount,
};

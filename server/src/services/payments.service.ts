import "dotenv/config";
import axios from "axios";
import crypto from "crypto";
import base64 from "base-64";
import OrderId from "order-id";
import Razorpay from "razorpay";
import StreamerRequest from "../schemas/streamerRequest.sql";

import { eq } from "drizzle-orm";
import { Order } from "../schemas/order.sql";
import { logger } from "../lib/logger";
import { Orders } from "razorpay/dist/types/orders";
import { ApiError } from "../lib/ApiError";
import { Accounts } from "razorpay/dist/types/accounts";
import { ReadStream } from "fs";
import { Stakeholders } from "razorpay/dist/types/stakeholders";
import { MiddlewareUserT } from "../lib/types";
import { Cashfree, CreateOrderRequest } from "cashfree-pg";
import { signStreamerVerficationToken } from "../lib/utils";

/**
 * Cashfree configuration
 */
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

/**
 * Cashfree configuration end
 */

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

/**
 * Creates a new razorpay order and save your data to database and updates payment status
 * @param {CreateOrderPropT} // Order creation props
 * @returns {Promise< | { orderId: string; paymentStatus: "created" | "attempted" | "paid"; paymentSessionId: string; } | undefined >}
 */
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

/**
 * Create a linked account as a partner account on razorpay
 * @param {Accounts.RazorpayAccountCreateRequestBody}
 * @returns {account_id: string} Returns a account_id of razorpay
 */
const createAccount = async function (
  options: Accounts.RazorpayAccountCreateRequestBody
) {
  const instance = getRazorpayInstance();
  const result = await instance.accounts.create(options);

  await db
    .update(StreamerRequest)
    .set({
      razorpayAccountId: result.id,
      requestStatus: "account_created",
      updatedAt: new Date(),
    })
    .where(eq(StreamerRequest.accountEmail, options.email))
    .execute();

  logger.info(`Razorpay account created: ${result.id}`);

  return result.id;
};

/**
 * Create stakeholder account & link with the razorpay patner account id.
 * @param accountId Razorpay account id
 * @param {Stakeholders.RazorpayStakeholderCreateRequestBody}
 */
const createStakeholderAccount = async function (
  accountId: string,
  options: Stakeholders.RazorpayStakeholderCreateRequestBody
) {
  const instance = getRazorpayInstance();
  const stakeholderResult = await instance.stakeholders.create(
    accountId,
    options
  );

  await db
    .update(StreamerRequest)
    .set({
      stakeholderId: stakeholderResult.id,
      requestStatus: "stakeholder_created",
      updatedAt: new Date(),
    })
    .where(eq(StreamerRequest.accountEmail, options.email))
    .execute();

  logger.info(`Create stakeholder account: ${stakeholderResult.id}`);
};

/**
 * Accept Terms & Conditions for razorpay route integration
 * @param accountId Razorpay account id of patner account (linked account)
 * @param email Account email of razorpay linked account
 */
const requestPrdConfig = async function (accountId: string, email: string) {
  const instance = getRazorpayInstance();
  const productConfiguration =
    await instance.products.requestProductConfiguration(accountId, {
      product_name: "route",
      tnc_accepted: true,
    });

  await db
    .update(StreamerRequest)
    .set({
      productConfigurationId: productConfiguration.id,
      requestStatus: "tnc_accepted",
      updatedAt: new Date(),
    })
    .where(eq(StreamerRequest.accountEmail, email))
    .execute();

  logger.info(
    `Terms & Conditions accepted: ${productConfiguration.tnc_accepted}, status:${productConfiguration.activation_status}, active_config:${productConfiguration.active_configuration}`
  );
};

/**
 * Add legal bank details to Razorpay linked account where the payments should be transfered
 * @param accountId Razorpay account id of patner account (linked account)
 * @param options Bank details of linked account partner (accountNumber, ifscCode, beneficiaryName)
 */
const updateBankAccountData = async function (
  accountId: string,
  options: { accountNumber: string; ifscCode: string; beneficiaryName: string }
) {
  const [accountRequest] = await db
    .select({
      productConfigId: StreamerRequest.productConfigurationId,
      accountEmail: StreamerRequest.accountEmail,
    })
    .from(StreamerRequest)
    .where(eq(StreamerRequest.razorpayAccountId, accountId))
    .execute();

  if (!accountRequest) throw new ApiError(400, "Account request not found!");

  const url = `https://api.razorpay.com/v2/accounts/${accountId}/products/${accountRequest.productConfigId}`;
  const authorizationToken = `Basic ${base64.encode(process.env.RAZORPAY_KEY_ID! + ":" + process.env.RAZORPAY_SECRET_KEY!)}`;

  const payload = {
    settlements: {
      account_number: options.accountNumber,
      ifsc_code: options.ifscCode.toUpperCase(),
      beneficiary_name: options.beneficiaryName,
    },
    tnc_accepted: true,
  };

  const request = await axios.patch(url, JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      Authorization: authorizationToken,
    },
  });
  const response = request.data;
  if (!response.id) throw new ApiError(400, "Failed to create linked account.");

  await db
    .update(StreamerRequest)
    .set({ requestStatus: "account_added", updatedAt: new Date() })
    .where(eq(StreamerRequest.accountEmail, accountRequest.accountEmail))
    .execute();

  logger.info(`Bank account details updated: ${JSON.stringify(response)}`)
};

/**
 * Documents upload of PAN, AADHAR or other proof for KYC verification on razorpay partner account
 * @param accountId Razorpay account id of patner account (linked account)
 * @param documentFile // Still TODO
 */
const uploadStakeholderDocuments = async function (accountId: string) {
  const instance = getRazorpayInstance();

  const [accountRequest] = await db
    .select({
      stakeholderId: StreamerRequest.stakeholderId,
      documentUrl: StreamerRequest.kycDocumentUrl,
    })
    .from(StreamerRequest)
    .where(eq(StreamerRequest.razorpayAccountId, accountId))
    .execute();

  if (
    !accountRequest ||
    !accountRequest.stakeholderId ||
    !accountRequest.documentUrl
  )
    throw new ApiError(
      400,
      "Failed to get account request in document uploader"
    );

  const req = await fetch(accountRequest.documentUrl);

  const readStream = new ReadStream({ read: req.body?.getReader });

  const documentUploadResult = await instance.stakeholders.uploadStakeholderDoc(
    accountId,
    accountRequest.stakeholderId,
    {
      document_type: "aadhar_front",
      file: {
        value: readStream,
        options: {
          filename: `${accountRequest.stakeholderId}-kyc.png`,
          contentType: null,
        },
      },
    }
  );

  await db
    .update(StreamerRequest)
    .set({ requestStatus: "done", updatedAt: new Date() })
    .where(eq(StreamerRequest.razorpayAccountId, accountId))
    .execute();

  logger.info(`Stakeholder documents uploaded: ${JSON.stringify(documentUploadResult.individual_proof_of_address)}`)
};

/**
 *
 * @param requestStatus Current razorpay linked account creation status
 * @param options First linked account creation options for razorpay
 * @param accountData Bank details
 * @returns {Promise<string>}
 */
const setupRazorpayAccount = async function (
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
  // create new linked account
  if (requestStatus == "pending") {
    accountData.accountId = await createAccount(options);
    requestStatus = "account_created";
  }
  // check if account id is available
  if (!accountData.accountId) throw new ApiError(400, "Can't get account_id!");

  // create stakeholder account linked to razorpay account
  if (requestStatus == "account_created") {
    const address = options.profile.addresses
      ?.registered as Accounts.ProfileAddresses;

    await createStakeholderAccount(accountData.accountId, {
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
    });
    requestStatus = "stakeholder_created";
  }

  // accept terms & conditions of razorpay
  if (requestStatus == "stakeholder_created") {
    await requestPrdConfig(accountData.accountId, options.email);
    requestStatus = "tnc_accepted";
  }

  // add bank account data ex: account_number, ifsc & beneficiary id
  if (requestStatus == "tnc_accepted") {
    await updateBankAccountData(accountData.accountId, {
      accountNumber: accountData.accountNumber,
      beneficiaryName: accountData.beneficiaryName,
      ifscCode: accountData.ifscCode,
    });
    requestStatus = "account_added";
  }

  // upload required kyc document to razorpay to clear your 'need_clarification' status
  if (requestStatus == "account_added") {
    await uploadStakeholderDocuments(accountData.accountId);
    requestStatus = "done";
  }

  // if everything is done return the account id as result
  if (requestStatus == "done") {
    return accountData.accountId;
  }
  return null;
};

export {
  createBeneficiary,
  createCfOrder,
  createRazorpayOrder,
  getRazorpayInstance,
  setupRazorpayAccount,
};

import { ApiError } from "../lib/ApiError";
import { logger } from "../lib/logger";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const cashfreeClientHeaders = new Headers();
cashfreeClientHeaders.set("x-api-version", process.env.CF_XAPI_VERSION!);
cashfreeClientHeaders.set("x-client-id", process.env.CF_CLIENT_ID!);
cashfreeClientHeaders.set("x-client-secret", process.env.CF_CLIENT_SECRET!);
cashfreeClientHeaders.set("Content-Type", "application/json");

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

        const streamerToken = jwt.sign(
          {
            beneficiaryId: response["beneficiary_id"],
            userId: props.userId,
            addedAt: response["added_on"],
          },
          process.env.STREAMER_SECRET_KEY!,
          { expiresIn: "180d" }
        );
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

export { createBeneficiary };

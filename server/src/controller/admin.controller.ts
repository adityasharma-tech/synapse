import fs from "fs/promises";
import StreamerRequest from "../schemas/streamerRequest.sql";
import crpto from "crypto";

import { eq } from "drizzle-orm";
import { ApiError } from "../lib/ApiError";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { createLinkedAccount } from "../services/payments.service";
import { TokenTable } from "../schemas/tokenTable.sql";
import { signStreamerVerficationToken } from "../lib/utils";
import { User } from "../schemas/user.sql";

const getAllStreamApplications = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.role != "admin") throw new ApiError(401, "Unautorized");

  const applications = await db
    .select({
      userId: StreamerRequest.userId,
      accountName: StreamerRequest.accountName,
      accountEmail: StreamerRequest.accountEmail,
      dashboardAccess: StreamerRequest.dashboardAccess,
      customerRefunds: StreamerRequest.customerRefunds,
      requestStatus: StreamerRequest.requestStatus,
      businessName: StreamerRequest.businessName,
    })
    .from(StreamerRequest)
    .execute();

  res.status(200).json(new ApiResponse(200, { applications }));
});

const downloadStreamAsCsv = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.role != "admin") throw new ApiError(401, "Unautorized");

  const applications = await db
    .select()
    .from(StreamerRequest)
    .where(eq(StreamerRequest.requestStatus, "pending"))
    .execute();

  const csvFormatDataJson = applications.map((application) => ({
    account_name: application.accountName,
    account_email: application.accountEmail,
    dashboard_access: application.dashboardAccess,
    customer_refunds: application.customerRefunds,
    business_name: application.businessName,
    business_type: application.businessType,
    ifsc_code: application.bankIfscCode,
    account_number: application.bankAccountNumber,
    beneficiary_name: application.accountName,
  }));

  const csvFormatDataArray = csvFormatDataJson
    .map((application) => Object.values(application).join(","))
    .join("\n");
  const filepath = "logs/" + `${Date.now()}.csv`;

  await fs.writeFile(filepath, csvFormatDataArray, { encoding: "utf-8" });

  res.download(filepath);
});

const acceptFormData = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.role != "admin") throw new ApiError(401, "Unautorized");

  const { email } = req.body;

  if (!email) throw new ApiError(400, "Failed to get applications");

  const [application] = await db
    .select()
    .from(StreamerRequest)
    .where(eq(StreamerRequest.accountEmail, email))
    .execute();

  if (!application)
    throw new ApiError(400, "Failed to get application details.");

  try {
    const referenceId = Math.floor(Math.random()*1000000000);
    console.log(JSON.stringify(application));

    const result = await createLinkedAccount(application.requestStatus,
      {
        business_type: application.businessType,
        type: "route",
        contact_name: application.accountName,
        email: application.accountEmail,
        legal_business_name: application.businessName,
        phone: application.phoneNumber,
        profile: {
          category: "social",
          subcategory: "messaging",
          addresses: {
            registered: {
              city: application.city,
              country: "IN",
              postal_code: application.postalCode,
              state: application.state,
              street1: application.streetAddress,
              street2: application.streetAddress,
            },
          },
        },
        legal_info: { pan: application.panCard.trim() == "" ? undefined : application.panCard },
        reference_id: String(referenceId),
      },
      {
        accountId: application.razorpayAccountId,
        accountNumber: application.bankAccountNumber,
        beneficiaryName: application.accountName,
        ifscCode: application.bankIfscCode,
        productConfigurationId: application.productConfigurationId
      }
    );
    if (!result) throw new ApiError(400, "Failed to create linked account.");

    await db
      .update(StreamerRequest)
      .set({
        requestStatus: "account_added",
        updatedAt: new Date()
      })
      .where(eq(StreamerRequest.accountEmail, application.accountEmail))
      .execute()

    await db
      .update(TokenTable)
      .set({
        streamerVerificationToken: signStreamerVerficationToken({
          beneficiaryId: String(application.razorpayAccountId),
          userId: String(application.userId),
          addedAt: new Date().toISOString()
        }),
        updatedAt: new Date()
      })
      .where(eq(TokenTable.userId, application.userId))
      .execute()

    await db
      .update(User)
      .set({
        role: "streamer",
        refrenceId: String(referenceId),
        updatedAt: new Date()
      })
      .where(eq(User.id, application.userId))

    res.status(200).json(new ApiResponse(200, "Success"));
  } catch (err) {
    console.error(err);
    throw new ApiError(400, "Failed to create linked account.");
  }
});

export { getAllStreamApplications, downloadStreamAsCsv, acceptFormData };

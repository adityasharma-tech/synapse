import fs from "fs/promises";

import { eq } from "drizzle-orm";
import { setupRazorpayAccount } from "../services/payments.service";
import { signStreamerVerficationToken } from "../lib/utils";
import { ApiError, ApiResponse, asyncHandler } from "@pkgs/lib";
import { TokenTable, User, StreamerRequest } from "@pkgs/drizzle-client";

/**
 * Controller to get all stream applications and send all required data to the admin dashboard
 * so that admin can approve or disapprove
 */
const getAllStreamApplications = asyncHandler(async (req, res) => {
  const user = req.user;

  // checking if it is admin or not, while this is already done in the middeware
  // but to make sure I added one more
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

/**
 * A controller to download all application who applied for streamer including their
 * bank and pan details
 * TODO: Some modifications so that even admin can't download user bank/pan details
 */
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

  // converting the json data to csv format as razorpay accepts on their dashbaord
  const csvFormatDataArray = csvFormatDataJson
    .map((application) => Object.values(application).join(","))
    .join("\n");
  const filepath = "logs/" + `${Date.now()}.csv`;

  await fs.writeFile(filepath, csvFormatDataArray, { encoding: "utf-8" });

  res.download(filepath);
});

/**
 * @description VERY IMPORTANT!
 * Controller function to accept the application by making few
 * razorpay Calls by sending their details through razorpay api
 */
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
    // the id passed to razorpay account data to find that user in my db; TODO: left
    const referenceId = Math.floor(Math.random() * 1000000000);

    // please checkout this function to get more details
    const result = await setupRazorpayAccount(
      application.requestStatus,
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
        legal_info: {
          pan:
            application.panCard.trim() == "" ? undefined : application.panCard,
        },
        reference_id: String(referenceId),
      },
      {
        accountId: application.razorpayAccountId,
        accountNumber: application.bankAccountNumber,
        beneficiaryName: application.accountName,
        ifscCode: application.bankIfscCode,
        productConfigurationId: application.productConfigurationId,
      }
    );
    if (!result) throw new ApiError(400, "Failed to create linked account.");

    // update the status of the application
    await db
      .update(StreamerRequest)
      .set({ requestStatus: "account_added", updatedAt: new Date() })
      .where(eq(StreamerRequest.accountEmail, application.accountEmail))
      .execute();

    // sign a token for each streamer to verify each time.
    // TODO: I don't think this is required but I will fix it later
    await db
      .update(TokenTable)
      .set({
        streamerVerificationToken: signStreamerVerficationToken({
          beneficiaryId: String(application.razorpayAccountId),
          userId: String(application.userId),
          addedAt: new Date().toISOString(),
        }),
        updatedAt: new Date(),
      })
      .where(eq(TokenTable.userId, application.userId))
      .execute();

    // update the user role to streamer
    await db
      .update(User)
      .set({
        role: "streamer",
        refrenceId: String(referenceId),
        updatedAt: new Date(),
      })
      .where(eq(User.id, application.userId));

    res.status(200).json(new ApiResponse(200, "Success"));
  } catch (err) {
    console.error(err);
    throw new ApiError(400, "Failed to create linked account.");
  }
});

export { getAllStreamApplications, downloadStreamAsCsv, acceptFormData };

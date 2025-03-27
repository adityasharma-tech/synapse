import fs from "fs/promises";
import { eq } from "drizzle-orm";
import { ApiError } from "../lib/ApiError";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import StreamerRequest from "../schemas/streamerRequest.sql";
import { createLinkedAccount } from "../services/payments.service";

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
      businessName: StreamerRequest.businessName,
    })
    .from(StreamerRequest)
    .where(eq(StreamerRequest.requestStatus, "pending"))
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

  const result = await createLinkedAccount(
    {
      business_type: application.businessType,
      contact_name: application.accountName,
      email: application.accountEmail,
      legal_business_name: application.businessName,
      phone: application.phoneNumber,
      profile: {
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
      legal_info: { pan: application.panCard },
      reference_id: String(application.userId),
    },
    {
      accountNumber: application.bankAccountNumber,
      beneficiaryName: application.accountName,
      ifscCode: application.bankIfscCode,
    }
  );

  if (!result) throw new ApiError(400, "Failed to create linked account.");

  res.status(200).json(new ApiResponse(200, "Success"));
});

export { getAllStreamApplications, downloadStreamAsCsv, acceptFormData };

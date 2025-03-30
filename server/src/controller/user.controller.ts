import { eq } from "drizzle-orm";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { User } from "../schemas/user.sql";
import { ApiError, ErrCodes } from "../lib/ApiError";
import { createBeneficiary } from "../services/payments.service";
import { TokenTable } from "../schemas/tokenTable.sql";
import StreamerRequest from "../schemas/streamerRequest.sql";
import { msg91AuthKey } from "../lib/constants";
import { uploadDocumentOnCloudinary } from "../lib/cloudinary";

const logoutHandler = asyncHandler(async (_, res) => {
  res.cookie("accessToken", "", {
    maxAge: 0,
    sameSite: "none",
    httpOnly: true,
    secure: true,
  });
  res.cookie("refreshToken", "", {
    maxAge: 0,
    sameSite: "none",
    httpOnly: true,
    secure: true,
  });

  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.status(200).json(new ApiResponse(200, null, "Logout success."));
});

const getUserHandler = asyncHandler(async (req, res) => {
  const user = req.user;
  res.status(200).json(new ApiResponse(200, { user }));
});

const updateUserHandler = asyncHandler(async (req, res) => {
  const user = req.user;

  const updateData = req.body;

  const [dbUser] = await db
    .select()
    .from(User)
    .where(eq(User.id, user?.id))
    .execute();

  if (!dbUser)
    throw new ApiError(400, "User not found.", ErrCodes.DB_ROW_NOT_FOUND);

  await db
    .update(User)
    .set({
      firstName: updateData.firstName ?? dbUser.firstName,
      lastName: updateData.lastName ?? dbUser.lastName,
      username: updateData.username ?? dbUser.username,
    })
    .where(eq(User.id, user?.id))
    .execute();

  res.status(200).json(new ApiResponse(200, null, "User updated success."));
});

const applyForStreamer = asyncHandler(async (req, res) => {
  const user = req.user;
  const {
    bankAccountNumber,
    vpa,
    bankIfsc,
    phoneNumber,
    countryCode,
    streetAddress,
    city,
    state,
    postalCode,
  } = req.body;

  if (!user)
    throw new ApiError(
      400,
      "Please provide required fields.",
      ErrCodes.VALIDATION_ERR
    );

  const tokens = await db
    .select()
    .from(TokenTable)
    .where(eq(TokenTable.userId, user.id))
    .execute();

  if (!tokens || tokens.length <= 0)
    throw new ApiError(500, "some error occured.");

  const usrToken = tokens[0];

  if (usrToken.streamerVerificationToken)
    throw new ApiError(400, "You may be already a streamer.");

  const streamerToken = await createBeneficiary({
    bankAccountNumber,
    vpa,
    bankIfsc,
    email: user.email,
    phoneNumber,
    countryCode,
    streetAddress,
    city,
    state,
    postalCode,
    userId: String(user.id),
    name: `${user.firstName} ${user.lastName}`,
  });

  await db
    .update(User)
    .set({ role: "streamer", updatedAt: new Date() })
    .where(eq(User.id, user.id))
    .execute();

  const result = await db
    .update(TokenTable)
    .set({ streamerVerificationToken: streamerToken, updatedAt: new Date() })
    .where(eq(TokenTable.userId, user.id))
    .execute();

  if (!result)
    throw new ApiError(
      400,
      "Failed to update streamer token.",
      ErrCodes.DB_UPDATE_ERR
    );
  res.status(201).json(new ApiResponse(201, null));
});

const applyForStreamerV2 = asyncHandler(async (req, res) => {
  const user = req.user;

  console.log(`Form Data: `, req.body);
  const {
    bankAccountNumber,
    bankIfsc,
    phoneNumber,
    streetAddress,
    city,
    state,
    postalCode,
    youtubeChannelName,
    authToken,
    panNumber
  } = req.body;

  const documentFilePath = req.file?.path;

  if(!documentFilePath) throw new ApiError(400, "required document not attached yet.");

  if (
    [
      bankAccountNumber,
      bankIfsc,
      phoneNumber,
      streetAddress,
      city,
      state,
      postalCode,
      youtubeChannelName,
      authToken,
      panNumber
    ].some((value) => (value ? value.trim() == "" : true))
  ) {
    throw new ApiError(400, "Validation error", ErrCodes.VALIDATION_ERR);
  }

  const url = new URL(
    "https://control.msg91.com/api/v5/widget/verifyAccessToken"
  );
  let headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  let body = { authkey: msg91AuthKey, "access-token": authToken };
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });
  const result = await response.json();

  console.log(result);

  const [preRequest] = await db
    .select({
      requestStatus: StreamerRequest.requestStatus,
      userId: StreamerRequest.userId,
    })
    .from(StreamerRequest)
    .where(eq(StreamerRequest.userId, user.id))
    .execute();

  if (preRequest && preRequest.requestStatus == "done")
    throw new ApiError(400, "You application is already fulfilled.");

  if (preRequest)
    throw new ApiError(400, "You already applied for streamer request.");

  const docUploadResult = await uploadDocumentOnCloudinary(documentFilePath);  
  if(!docUploadResult) throw new ApiError(400, "Failed to upload document to cloudinary resources.");

  const [request] = await db
    .insert(StreamerRequest)
    .values({
      accountEmail: user.email,
      accountName: `${user.firstName} ${user.lastName}`,
      businessName: youtubeChannelName,
      userId: user.id,
      bankAccountNumber,
      bankIfscCode: bankIfsc,
      city,
      phoneNumber,
      postalCode,
      state,
      streetAddress,
      panCard: panNumber.toUpperCase().trim(),
      kycDocumentUrl: docUploadResult
    })
    .returning()
    .execute();

  if (!request) throw new ApiError(400, "Failed to submit your application");

  res
    .status(201)
    .json(new ApiResponse(201, "Your application is submitted succesfully."));
});

export {
  logoutHandler,
  getUserHandler,
  updateUserHandler,
  applyForStreamer,
  applyForStreamerV2,
};

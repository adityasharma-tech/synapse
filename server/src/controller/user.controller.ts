import { eq } from "drizzle-orm";
import establishDbConnection from "../db";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { User } from "../schemas/user.sql";
import { ApiError, ErrCodes } from "../lib/ApiError";
import { createBeneficiary } from "../services/payments.service";
import { TokenTable } from "../schemas/tokenTable.sql";

const logoutHandler = asyncHandler(async (_, res) => {
  res.cookie("accessToken", "", { maxAge: 0 });

  res.cookie("refreshToken", "", { maxAge: 0 });

  res.status(200).json(new ApiResponse(200, null, "Logout success."));
});

const getUserHandler = asyncHandler(async (req, res) => {
  const user = req.user;
  res.status(200).json(new ApiResponse(200, { user }));
});

const updateUserHandler = asyncHandler(async (req, res) => {
  const user = req.user;

  const updateData = req.body;

  const db = establishDbConnection();

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

  const db = establishDbConnection();

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

export { logoutHandler, getUserHandler, updateUserHandler, applyForStreamer };

import { User } from "../schemas/user.sql";
import { eq, or } from "drizzle-orm";
import { logger } from "../lib/logger";
import { TokenTable } from "../schemas/tokenTable.sql";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { ApiError, ErrCodes } from "../lib/ApiError";
import { emailVerificationTokenExpiry } from "../lib/constants";
import { generateUsername, getSigningTokens } from "../lib/utils";
import {
  sendConfirmationMail,
  sendResetPasswordMail,
} from "../services/mail.service";

import crpyto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const loginHandler = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email) || !password || password.trim() == "")
    throw new ApiError(
      400,
      "Please provide required fields.",
      ErrCodes.VALIDATION_ERR
    );

  const users = await db
    .select()
    .from(User)
    .where(
      or(
        eq(User.email, email ? email.trim().toLowerCase() : ""),
        eq(User.username, username ? username.trim().toLowerCase() : "")
      )
    )
    .limit(1)
    .execute();

  logger.info(`loginHandler.users: ${JSON.stringify(users)}`);

  if (!users || users.length <= 0)
    throw new ApiError(400, "Invalid credentials.", ErrCodes.INVALID_CREDS);

  const user = users[0];

  const err = new ApiError(
    401,
    "Please verify your email to login.",
    ErrCodes.EMAIL_NOT_VERIFIED
  );

  logger.error(`Email after ${JSON.stringify(err)}`);

  if (!user.emailVerified) throw err;

  const isPasswordCorrect = await bcrypt.compare(
    password.trim(),
    user.passwordHash
  );

  logger.info(
    `isPasswordCorrect: ${isPasswordCorrect}, user: ${JSON.stringify(user)}`
  );

  const { accessToken, refreshToken, cookieOptions } = getSigningTokens({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role ?? "viewer",
    username: user.username,
    profilePicture: user.profilePicture ?? "",
    emailVerified: user.emailVerified
   });

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials!", ErrCodes.INVALID_CREDS);
  }

  await db
    .update(TokenTable)
    .set({ userRefreshToken: refreshToken, updatedAt: new Date() })
    .where(eq(TokenTable.userId, user.id))
    .execute();

  const headers = new Headers();
  headers.append("accessToken", accessToken);
  headers.append("refreshToken", refreshToken);

  res.setHeaders(headers);

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  res
    .status(200)
    .json(new ApiResponse(200, { user }, "User logged in successfully"));
});

const registerHandler = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  if (
    [firstName, lastName, email, phoneNumber, password].some((value) =>
      value ? value.trim() == "" : true
    )
  )
    throw new ApiError(
      400,
      "All fields are required.",
      ErrCodes.VALIDATION_ERR
    );

  const users = await db
    .select()
    .from(User)
    .where(eq(User.email, email.trim().toLowerCase()))
    .execute();

  if (users.length > 0)
    throw new ApiError(
      400,
      "user already exists with same username or email",
      ErrCodes.USER_EXISTS
    );

  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(password, salt);

  const emailVerificationToken = crpyto.randomBytes(20).toString("hex");

  const username = `${firstName.trim().toLowerCase()}-${generateUsername()}`;

  const result = await db
    .insert(User)
    .values({
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      passwordHash: hashedPassword,
      emailVerified: false,
      updatedAt: new Date(),
    })
    .returning()
    .execute();

  if (!result || result.length <= 0) {
    throw new ApiError(
      400,
      "Failed to create new user",
      ErrCodes.DB_INSERT_ERR
    );
  }

  const tokenTableResult = await db
    .select()
    .from(TokenTable)
    .where(eq(TokenTable.userId, result[0].id))
    .execute();

  if (!tokenTableResult || tokenTableResult.length <= 0) {
    const tokenInsertResults = await db
      .insert(TokenTable)
      .values({
        userId: result[0].id,
        emailVerificationToken,
        emailVerificationTokenExpiry, // 6hr expiry
        updatedAt: new Date(),
      })
      .returning()
      .execute();
    if (!tokenInsertResults || tokenInsertResults.length <= 0)
      throw new ApiError(
        400,
        "Failed to insert token in token table",
        ErrCodes.DB_INSERT_ERR
      );
  } else {
    const tokenUpdateResults = await db
      .update(TokenTable)
      .set({ emailVerificationToken, emailVerificationTokenExpiry })
      .where(eq(TokenTable.userId, result[0].id))
      .execute();
    if (!tokenUpdateResults || tokenTableResult.length <= 0)
      throw new ApiError(
        400,
        "Failed to update token in token table",
        ErrCodes.DB_UPDATE_ERR
      );
  }

  const emailResult = await sendConfirmationMail(
    email.trim(),
    emailVerificationToken
  );

  if (!emailResult.accepted) {
    throw new ApiError(
      400,
      "Failed to send verification email.",
      ErrCodes.EMAIL_SEND_ERR
    );
  }

  res
    .status(201)
    .json(
      new ApiResponse(201, { user: result[0] }, "Email send successfully.")
    );
});

const verifyEmailHandler = asyncHandler(async (req, res) => {
  const { verificationToken } = req.query;
  if (!verificationToken)
    throw new ApiError(
      400,
      "verification token is a required parameter.",
      ErrCodes.VALIDATION_ERR
    );

  const users = await db
    .select()
    .from(User)
    .innerJoin(TokenTable, eq(User.id, TokenTable.userId))
    .where(eq(TokenTable.emailVerificationToken, verificationToken.toString()))
    .limit(1)
    .execute();

  const user = users[0];

  if (
    !user ||
    !user.token_table ||
    !user.users ||
    !user.token_table.emailVerificationTokenExpiry
  )
    throw new ApiError(
      400,
      "Failed to get user or user already verified.",
      ErrCodes.DEFAULT_RES
    );

  if (user.users.emailVerified)
    throw new ApiError(400, "User already verified.", ErrCodes.DEFAULT_RES);

  if (user.token_table.emailVerificationTokenExpiry > new Date())
    throw new ApiError(
      400,
      "Token expired successfully. 😁 Please request for new."
    );

  const userUpdateResult = await db
    .update(User)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(User.id, user.users.id))
    .execute();
  if (!userUpdateResult)
    throw new ApiError(400, "Failed to update user.", ErrCodes.DB_UPDATE_ERR);

  const tokenTableUpdateResult = await db
    .update(TokenTable)
    .set({
      emailVerificationToken: null,
      emailVerificationTokenExpiry: null,
      updatedAt: new Date(),
    })
    .where(eq(TokenTable.userId, user.users.id))
    .execute();

  if (!tokenTableUpdateResult)
    throw new ApiError(400, "Failed to update tokens.", ErrCodes.DB_UPDATE_ERR);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified successfully."));
});

const resendEmailHandler = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || email.trim() == "")
    throw new ApiError(
      400,
      "Please provide your email.",
      ErrCodes.VALIDATION_ERR
    );

  const emailVerificationToken = crpyto.randomBytes(20).toString("hex");

  const users = await db
    .select()
    .from(User)
    .where(or(eq(User.email, email.trim())))
    .execute();

  if (users.length <= 0)
    throw new ApiError(400, "Failed to get user.", ErrCodes.DB_ROW_NOT_FOUND);

  const user = users[0];

  if (user.emailVerified) throw new ApiError(400, "User alreaday verified.");

  await db
    .update(TokenTable)
    .set({ emailVerificationToken, updatedAt: new Date() })
    .where(eq(TokenTable.id, user.id))
    .execute();

  const result = await sendConfirmationMail(
    email.trim(),
    emailVerificationToken
  );

  if (!result.accepted)
    throw new ApiError(
      400,
      "Failed to resend email verification link.",
      ErrCodes.EMAIL_SEND_ERR
    );

  res
    .status(200)
    .json(new ApiResponse(200, null, "Email verification send successfully."));
});

const refreshTokenHandler = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  const refreshToken = cookies?.refreshToken || req.headers?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized", ErrCodes.VALIDATION_ERR);
  }

  try {
    jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY!);
  } catch (error: any) {
    throw new ApiError(
      401,
      "Unauthorized: Refresh token already expired.",
      ErrCodes.REFRESH_TOKEN_EXPIRED
    );
  }

  const users = await db
    .select()
    .from(User)
    .innerJoin(TokenTable, eq(User.id, TokenTable.userId))
    .where(eq(TokenTable.userRefreshToken, refreshToken))
    .limit(1)
    .execute();

  if (!users || users.length <= 0)
    throw new ApiError(400, "User not found with provided refreshToken.");

  const user = users[0];

  const {
    refreshToken: newRefreshToken,
    accessToken: newAccessToken,
    cookieOptions,
  } = getSigningTokens({
    id: user.users.id,
    firstName: user.users.firstName,
    lastName: user.users.lastName,
    email: user.users.email,
    role: user.users.role ?? "viewer",
    username: user.users.username,
    profilePicture: user.users.profilePicture ?? "",
    emailVerified: user.users.emailVerified
   });

  await db
    .update(TokenTable)
    .set({ userRefreshToken: newRefreshToken, updatedAt: new Date() })
    .where(eq(TokenTable.userId, user.users.id))
    .execute();

  res.cookie("refreshToken", newRefreshToken, cookieOptions);
  res.cookie("accessToken", newAccessToken, cookieOptions);

  res.status(200).json(new ApiResponse(200, { user }));
});

const resetPasswordEmailHandler = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email)
    throw new ApiError(400, "Please provide email!", ErrCodes.VALIDATION_ERR);

  const verificationToken = crpyto.randomBytes(10).toString("hex");

  const result = await sendResetPasswordMail(email, verificationToken);

  if (!result.accepted)
    throw new ApiError(400, "Err in sending email.", ErrCodes.EMAIL_SEND_ERR);

  res.status(200).json(new ApiResponse(200, null));
});

const resetPasswordHandler = asyncHandler(async (req, res) => {
  const { verificationToken } = req.query;
  const { password } = req.body;

  if (!verificationToken || !password)
    throw new ApiError(
      400,
      "Verification token not found",
      ErrCodes.VALIDATION_ERR
    );

  const users = await db
    .select()
    .from(User)
    .innerJoin(TokenTable, eq(User.id, TokenTable.userId))
    .where(eq(TokenTable.resetPasswordToken, verificationToken.toString()))
    .limit(1)
    .execute();

  const user = users[0];

  if (
    !user ||
    !user.token_table ||
    !user.users ||
    !user.token_table.resetPasswordTokenExpiry
  )
    throw new ApiError(
      400,
      "Failed to get user or user already verified.",
      ErrCodes.DEFAULT_RES
    );

  if (user.users.emailVerified)
    throw new ApiError(400, "User already verified.", ErrCodes.DEFAULT_RES);

  if (user.token_table.resetPasswordTokenExpiry > new Date())
    throw new ApiError(
      400,
      "Token expired successfully. 😁 Please request for a brand new."
    );

  const passwordHash = await bcrypt.hash(password, 10);

  const userUpdateResult = await db
    .update(User)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(User.id, user.users.id))
    .execute();
  if (!userUpdateResult)
    throw new ApiError(400, "Failed to update user.", ErrCodes.DB_UPDATE_ERR);

  const tokenTableUpdateResult = await db
    .update(TokenTable)
    .set({ userRefreshToken: null, updatedAt: new Date() })
    .where(eq(TokenTable.userId, user.users.id))
    .execute();

  if (!tokenTableUpdateResult)
    throw new ApiError(400, "Failed to update tokens.", ErrCodes.DB_UPDATE_ERR);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified successfully."));
});

export {
  loginHandler,
  registerHandler,
  verifyEmailHandler,
  resendEmailHandler,
  refreshTokenHandler,
  resetPasswordEmailHandler,
  resetPasswordHandler,
};

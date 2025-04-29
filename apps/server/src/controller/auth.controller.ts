import { env } from "@pkgs/zod-client";
import { eq, or } from "drizzle-orm";
import { TokenTable, User } from "@pkgs/drizzle-client";
import { emailVerificationTokenExpiry } from "../lib/constants";
import { generateUsername, getSigningTokens } from "../lib/utils";
import {
  logger,
  ApiError,
  ApiResponse,
  asyncHandler,
  ErrCodes,
} from "@pkgs/lib";

import jwt from "jsonwebtoken";
import jose from "node-jose";
import axios from "axios";
import crpyto from "crypto";
import bcrypt from "bcryptjs";
import * as grpc from "@grpc/grpc-js";
import { MailClient } from "@pkgs/lib/proto";

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
    emailVerified: user.emailVerified,
  });

  if (!isPasswordCorrect) {
    if (user.lastLoginMethod != "email-password")
      throw new ApiError(400, "Try sso login.", ErrCodes.INVALID_CREDS);

    throw new ApiError(401, "Invalid credentials!", ErrCodes.INVALID_CREDS);
  }

  await db
    .update(User)
    .set({ lastLoginMethod: "email-password" })
    .where(eq(User.id, user.id))
    .execute();

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

  const username = `${firstName.trim().toLowerCase().replace(" ", "")}-${generateUsername()}`;

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

  const client = new MailClient(
    env.MAIL_GRPC_ADDRESS,
    grpc.credentials.createInsecure()
  );

  client.sendSignupConfirmMail(
    { email: email.trim(), token: emailVerificationToken },
    (err, response) => {
      if (err)
        return logger.error(
          `Error while sending confirmation mail: ${err.message}`
        );

      logger.info(`GRPC response: ${JSON.stringify(response)}`);

      if (!response.success)
        throw new ApiError(
          400,
          "Failed to send verification email.",
          ErrCodes.EMAIL_SEND_ERR
        );
    }
  );

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

  const client = new MailClient(
    env.MAIL_GRPC_ADDRESS,
    grpc.credentials.createInsecure()
  );

  client.sendSignupConfirmMail(
    { email: email.trim(), token: emailVerificationToken },
    (err, response) => {
      if (err)
        return logger.error(
          `Error while sending confirmation mail: ${err.message}`
        );

      logger.info(`GRPC response: ${JSON.stringify(response)}`);

      if (!response.success)
        throw new ApiError(
          400,
          "Failed to send verification email.",
          ErrCodes.EMAIL_SEND_ERR
        );
    }
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
    jwt.verify(refreshToken, env.REFRESH_SECRET_KEY);
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
    emailVerified: user.users.emailVerified,
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

  const client = new MailClient(
    env.MAIL_GRPC_ADDRESS,
    grpc.credentials.createInsecure()
  );

  client.sendResetPasswordMail(
    { email: email.trim(), token: verificationToken },
    (err, response) => {
      if (err)
        return logger.error(
          `Error while sending confirmation mail: ${err.message}`
        );

      logger.info(`GRPC response: ${JSON.stringify(response)}`);

      if (!response.success)
        throw new ApiError(
          400,
          "Failed to send reset password mail email.",
          ErrCodes.EMAIL_SEND_ERR
        );
    }
  );

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

const googleSignupHandler = asyncHandler(async (req, res) => {
  const reqBody = req.body as {
    credential: string;
    clientId: string;
    select_by: string;
  };

  logger.debug(`Req body: ${JSON.stringify(reqBody)}`);

  const { data } = await axios.get(
    "https://www.googleapis.com/oauth2/v3/certs"
  );
  if (!data) throw new ApiError(500, `Internal Server Error`);

  logger.debug(`Google public key request: ${JSON.stringify(data)}`);

  const publicKey = await jose.JWK.asKeyStore(data);

  logger.debug(`Google pub key: ${publicKey}`);

  const result = await jose.JWS.createVerify(publicKey).verify(
    reqBody.credential
  );
  const payload = JSON.parse(result.payload.toString("utf-8")) as {
    aud: string;
    email: string;
    picture: string;
    given_name: string;
    family_name: string;
    exp: number;
  };

  if (payload.exp * 1000 < Date.now())
    throw new ApiError(
      401,
      "You are late. Token already expired.",
      ErrCodes.ACCESS_TOKEN_EXPIRED
    );

  if (payload.aud != env.GOOGLE_CLIENT_ID)
    throw new ApiError(401, "Failed to authorize!");

  const [usr] = await db
    .select()
    .from(User)
    .where(eq(User.email, payload.email))
    .execute();

  if (usr)
    throw new ApiError(
      400,
      "User already exists. Please login.",
      ErrCodes.USER_EXISTS
    );

  const username = `${payload.given_name.trim().replace(" ", "").toLowerCase()}-${generateUsername()}`;

  const [newUsr] = await db
    .insert(User)
    .values({
      firstName: payload.given_name,
      lastName: payload.family_name,
      username,
      email: payload.email,
      phoneNumber: "",
      passwordHash: "",
      profilePicture: payload.picture,
      emailVerified: true,
      lastLoginMethod: "sso/google",
      updatedAt: new Date(),
    })
    .returning()
    .execute();

  if (!newUsr) throw new ApiError(401, "Failed to create new user");

  const { accessToken, refreshToken, cookieOptions } = getSigningTokens({
    id: newUsr.id,
    firstName: newUsr.firstName,
    lastName: newUsr.lastName,
    email: newUsr.email,
    role: newUsr.role ?? "viewer",
    username: newUsr.username,
    profilePicture: newUsr.profilePicture ?? "",
    emailVerified: newUsr.emailVerified,
  });

  await db
    .update(TokenTable)
    .set({ userRefreshToken: refreshToken, updatedAt: new Date() })
    .where(eq(TokenTable.userId, newUsr.id))
    .execute();

  const headers = new Headers();
  headers.append("accessToken", accessToken);
  headers.append("refreshToken", refreshToken);

  res.setHeaders(headers);

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  res
    .status(200)
    .json(
      new ApiResponse(200, { user: newUsr }, "User logged in successfully")
    );
});

const googleLoginHandler = asyncHandler(async (req, res) => {
  const reqBody = req.body as {
    credential: string;
    clientId: string;
    select_by: string;
  };

  if (!reqBody.credential || !reqBody.clientId || !reqBody.select_by)
    throw new ApiError(400, "Validation Error", ErrCodes.VALIDATION_ERR);

  logger.debug(`Req body: ${JSON.stringify(reqBody)}`);

  const { data } = await axios.get(
    "https://www.googleapis.com/oauth2/v3/certs"
  );
  if (!data) throw new ApiError(500, `Internal Server Error`);

  logger.debug(`Google public key request: ${JSON.stringify(data)}`);

  const publicKey = await jose.JWK.asKeyStore(data);

  logger.debug(`Google pub key: ${publicKey}`);

  const result = await jose.JWS.createVerify(publicKey).verify(
    reqBody.credential
  );
  const payload = JSON.parse(result.payload.toString("utf-8")) as {
    aud: string;
    email: string;
    picture: string;
    given_name: string;
    family_name: string;
    exp: number;
  };

  if (payload.exp * 1000 < Date.now())
    throw new ApiError(
      401,
      "You are late. Token already expired.",
      ErrCodes.ACCESS_TOKEN_EXPIRED
    );

  if (payload.aud != env.GOOGLE_CLIENT_ID)
    throw new ApiError(401, "Failed to authorize!");

  const [usr] = await db
    .select()
    .from(User)
    .where(eq(User.email, payload.email))
    .execute();

  if (!usr)
    throw new ApiError(
      400,
      "User not found. Please signup first.",
      ErrCodes.DB_ROW_NOT_FOUND
    );

  await db
    .update(User)
    .set({ lastLoginMethod: "sso/google" })
    .where(eq(User.id, usr.id))
    .execute();

  const { accessToken, refreshToken, cookieOptions } = getSigningTokens({
    id: usr.id,
    firstName: usr.firstName,
    lastName: usr.lastName,
    email: usr.email,
    role: usr.role ?? "viewer",
    username: usr.username,
    profilePicture: usr.profilePicture ?? "",
    emailVerified: usr.emailVerified,
  });

  await db
    .update(TokenTable)
    .set({ userRefreshToken: refreshToken, updatedAt: new Date() })
    .where(eq(TokenTable.userId, usr.id))
    .execute();

  const headers = new Headers();
  headers.append("accessToken", accessToken);
  headers.append("refreshToken", refreshToken);

  res.setHeaders(headers);

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  res
    .status(200)
    .json(new ApiResponse(200, { user: usr }, "User logged in successfully"));
});

export {
  loginHandler,
  registerHandler,
  verifyEmailHandler,
  resendEmailHandler,
  refreshTokenHandler,
  resetPasswordEmailHandler,
  resetPasswordHandler,
  googleSignupHandler,
  googleLoginHandler,
};

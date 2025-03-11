import { eq, or } from "drizzle-orm";
import { logger } from "../lib/configs";
import { User } from "../schemas/user.sql";
import { ApiError } from "../lib/ApiError";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";

import crpyto from "crypto"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { CookieOptions } from "express";
import establishDbConnection from "../db";
import { sendConfirmationMail } from "../services/mail.service";
import { TokenTable } from "../schemas/tokenTable.sql";
import { emailVerificationTokenExpiry } from "../lib/constants";


const loginHandler = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!(username || email) || !password || password.trim() == "")
        throw new ApiError(400, "Please provide required fields.");

    const db = establishDbConnection();

    const users = await db
        .select()
        .from(User)
        .where(
            or(
                eq(User.email, email ? email.trim().toLowerCase() : ""),
                eq(User.username, username ? username.trim().toLowerCase() : "")
            )
        )

    logger.info(`loginHandler.users: ${JSON.stringify(users)}`);

    if (!users || users.length <= 0) throw new ApiError(400, "Invalid credentials.");

    const user = users[0];

    if (!user.emailVerified) throw new ApiError(401, "Please verify your email to login.");

    const isPasswordCorrect = bcrypt.compareSync(password.trim(), user.passwordHash);

    logger.info(`isPasswordCorrect: ${isPasswordCorrect}, user: ${JSON.stringify(user)}`);

    const accessToken = jwt.sign({
        userId: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
    }, process.env.ACCESS_SECRET_KEY!, {
        expiresIn: "7d",
    })

    const refreshToken = jwt.sign({
        userId: user.id
    }, process.env.REFRESH_SECRET_KEY!, {
        expiresIn: "12h"
    })

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials!");
    }
    const headers = new Headers()
    headers.append("accessToken", accessToken);
    headers.append("refreshToken", refreshToken);

    res.setHeaders(headers);

    const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 12,
        expires: new Date(Date.now() + 60 * 60 * 12)
    }

    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7, expires: new Date(Date.now() + 60 * 60 * 24 * 7) });
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json(new ApiResponse(200, {
        user,
        accessToken,
        refreshToken
    }, "User logged in successfully"))
})

const registerHandler = asyncHandler(async (req, res) => {
    const { firstName, lastName, username, email, phoneNumber, password } = req.body;

    if ([firstName, lastName, username, email, phoneNumber, password].some((value) => value ? value.trim() == "" : true))
        throw new ApiError(400, "All fields are required.");


    const db = establishDbConnection();

    const users = await db
        .select()
        .from(User)
        .where(
            or(
                eq(User.username, username.trim().toLowerCase()),
                eq(User.email, email.trim().toLowerCase())
            )
        ).execute();

    if (users.length > 0) throw new ApiError(400, "user already exists with same username or email");

    const salt = await bcrypt.genSalt(10)

    const hashedPassword = await bcrypt.hash(password, salt)

    const emailVerificationToken = crpyto.randomBytes(20).toString("hex");

    const result = await db
        .insert(User)
        .values({
            firstName,
            lastName,
            username: username.trim().toLowerCase(),
            email: email.trim().toLowerCase(),
            phoneNumber,
            passwordHash: hashedPassword,
            emailVerified: false,
            updatedAt: new Date()
        }).returning().execute();

    if (!result || result.length <= 0) {
        throw new ApiError(400, "Failed to create new user");
    }

    const tokenTableResult = await db
        .select()
        .from(TokenTable)
        .where(eq(TokenTable.userId, result[0].id)).execute()


    if (!tokenTableResult || tokenTableResult.length <= 0) {
        const tokenInsertResults = await db
            .insert(TokenTable)
            .values({
                userId: result[0].id,
                emailVerificationToken,
                emailVerificationTokenExpiry, // 6hr expiry
                updatedAt: new Date()
            }).returning().execute();
        if (!tokenInsertResults || tokenInsertResults.length <= 0) throw new ApiError(400, "Failed to insert token in token table");
    } else {
        const tokenUpdateResults = await db
            .update(TokenTable)
            .set({
                emailVerificationToken,
                emailVerificationTokenExpiry
            }).where(eq(TokenTable.userId, result[0].id)).execute()
        if (!tokenUpdateResults || tokenTableResult.length <= 0) throw new ApiError(400, "Failed to update token in token table");
    }

    const emailResult = await sendConfirmationMail(email.trim(), emailVerificationToken)

    if (!emailResult.accepted) {
        throw new ApiError(400, "Failed to send verification email.");
    }

    res.status(201).json(new ApiResponse(201, {
        user: result[0]
    }, "Email send successfully."));
})

const verifyEmailHandler = asyncHandler(async (req, res) => {
    const { verificationToken } = req.query;
    if (!verificationToken || verificationToken.toString().trim() == "") throw new ApiError(400, "verification token is a required parameter.");

    const db = establishDbConnection();

    const tokenTables = await db
        .select()
        .from(TokenTable)
        .where(
            eq(TokenTable.emailVerificationToken, verificationToken.toString().trim())
        ).execute();
    if (tokenTables.length <= 0) throw new ApiError(400, "Failed to get user or user already verified.");

    const userToken = tokenTables[0];

    const users = await db
        .select()
        .from(User)
        .where(
            eq(
                User.id, userToken.userId
            )
        ).execute()

    if (users[0].emailVerified) throw new ApiError(400, "User alreaday verified.");

    const userUpdateResult = await db
        .update(User)
        .set({
            emailVerified: true,
            updatedAt: new Date()
        }).where(eq(User.id, users[0].id)).execute();
    if (!userUpdateResult) throw new ApiError(400, "Failed to update user.");

    const tokenTableUpdateResult = await db
        .update(TokenTable)
        .set({
            emailVerificationToken: null,
            emailVerificationTokenExpiry: null,
            updatedAt: new Date()
        })
        .where(eq(
            TokenTable.userId, users[0].id
        ))
        .execute()

    if (!tokenTableUpdateResult) throw new ApiError(400, "Failed to update tokens.");

    res.status(400).json(new ApiResponse(200, null, "Email verified successfully."))
})

const resendEmailHandler = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email || email.trim() == "") throw new ApiError(400, "Please provide your email.")

    const emailVerificationToken = crpyto.randomBytes(20).toString("hex");

    const db = establishDbConnection();

    const users = await db
        .select()
        .from(User)
        .where(
            or(
                eq(User.email, email.trim()),
            )
        ).execute();
    if (users.length <= 0) throw new ApiError(400, "Failed to get user.")

    const user = users[0];

    if (user.emailVerified) throw new ApiError(400, "User alreaday verified.");

    await db.update(TokenTable).set({ emailVerificationToken, updatedAt: new Date() }).where(eq(TokenTable.id, user.id)).execute();

    const result = await sendConfirmationMail(email.trim(), emailVerificationToken);

    if (!result.accepted) throw new ApiError(400, "Failed to resend email verification link.");

    res.status(200).json(
        new ApiResponse(200, null, "Email verification send successfully.")
    )
})

export {
    registerHandler,
    loginHandler,
    verifyEmailHandler,
    resendEmailHandler
}
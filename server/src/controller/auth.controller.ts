import { eq, or } from "drizzle-orm";
import { logger } from "../lib/configs";
import { ApiError } from "../lib/ApiError";
import { User } from "../schemas/user.sql";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";

import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import crpyto from "crypto"
import establishDbConnection from "../db";
import { sendConfirmationMail } from "../services/mail.service";


const loginHandler = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!password || password.trim() == "" || !(username || email || username.trim() == "" || email.trim() == ""))
        throw new ApiError(400, "Please provide required fields.");

    const db = establishDbConnection();

    const users = await db
        .select()
        .from(User)
        .where(
            or(
                eq(User.email, email.trim()),
                eq(User.username, username.trim())
            )
        )

    logger.info(`loginHandler.users: ${JSON.stringify(users)}`);
    
    if(!users || users.length <= 0) throw new ApiError(400, "Invalid credentials.");

    const user = users[0];

    if(!user.emailVerified) throw new ApiError(401, "Invalid credentials."); 

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

    if(isPasswordCorrect){
        const headers = new Headers()
        headers.append("accessToken", accessToken);
        headers.append("refreshToken", refreshToken);

        res.setHeaders(headers);

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 12
        }

        res.cookie("accessToken", accessToken, cookieOptions);
        res.cookie("refreshToken", refreshToken, cookieOptions);

        res.status(200).json(new ApiResponse(200, {
            user
        }, "User logged in successfully"))
    }

    throw new ApiError(401, "Unauthorized");
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
                eq(User.username, username.trim()),
                eq(User.email, email.trim())
            )
        )
    if (users.length > 0) throw new ApiError(400, "user already exists with same username or email");

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(20))

    const emailVerificationToken = crpyto.randomBytes(20).toString("hex");

    const result = await db.insert(User).values({
        firstName,
        lastName,
        username,
        email,
        phoneNumber,
        passwordHash: hashedPassword,
        emailVerified: false,
        emailVerificationToken,
        updatedAt: new Date()
    }).returning().execute();

    if (!result || result.length <= 0) {
        throw new ApiError(400, "Failed to create new user");
    }

    const emailResult = await sendConfirmationMail(email.trim(), emailVerificationToken)

    if(!emailResult.accepted){
        throw new ApiError(400, "Failed to send verification email.");
    }

    res.status(201).json(new ApiResponse(201, {
        user: result[0]
    }, "Email send successfully."));
})

const verifyEmailHandler = asyncHandler(async (req, res)=>{
    const {  } = req.body;
})

const resendEmailHandler = asyncHandler(async (req, res)=>{
    const { email } = req.body;
    if(!email || email.trim() == "") throw new ApiError(400, "Please provide your email.")
    
    const emailVerificationToken = crpyto.randomBytes(20).toString("hex");

    const db = establishDbConnection();

    await db.update(User).set({ emailVerificationToken, updatedAt: new Date() });
    
    const result = await sendConfirmationMail(email.trim(), emailVerificationToken);

    if(!result.accepted) throw new ApiError(400, "Failed to resend email verification link.");

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
import { eq, or } from "drizzle-orm";
import { logger } from "../lib/configs";
import { ApiError } from "../lib/ApiError";
import { User } from "../schemas/user.sql";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";

import bcrypt from "bcryptjs"
import establishDbConnection from "../db";
import jwt from "jsonwebtoken";


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

    const isPasswordCorrect = bcrypt.compareSync(password.trim(), user.passwordHash);

    logger.info(`isPasswordCorrect: ${isPasswordCorrect}, user: ${JSON.stringify(user)}`);

    const accessToken = jwt.sign({
        userId: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        
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

        res.cookie("accessToken", accessToken);
        res.cookie("refreshToken", refreshToken);

        res.status(200).json(new ApiResponse(200, {
            user
        }, "User logged in successfully"))
    }

    throw new ApiError(401, "Unauthorized");
})


const registerHandler = asyncHandler(async (req, res) => {
    const { firstName, lastName, username, email, phoneNumber, password, profilePicture } = req.body;

    if (![firstName, lastName, username, email, phoneNumber, password, profilePicture].some((value) => value.trim() == ""))
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

    const result = await db.insert(User).values({
        firstName,
        lastName,
        username,
        email,
        phoneNumber,
        passwordHash: hashedPassword
    }).returning().execute();

    if (!result || result.length <= 0) {
        throw new ApiError(400, "Failed to create new user");
    }

    res.status(201).json(new ApiResponse(201, {
        user: result[0]
    }, "User created successfully"));
})

export {
    registerHandler,
    loginHandler
}
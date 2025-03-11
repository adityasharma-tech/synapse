import { eq } from "drizzle-orm";
import establishDbConnection from "../db";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { User } from "../schemas/user.sql";
import { ApiError } from "../lib/ApiError";

const logoutHandler = asyncHandler(async (_, res)=>{

    res.cookie("accessToken", "", {
        maxAge: 0
    })

    res.cookie("refreshToken", "", {
        maxAge: 0
    })
    
    res.status(200).json(
        new ApiResponse(200, null, "Logout success.")
    )
})

const getUserHandler = asyncHandler(async (req, res)=>{
    const user = req.user;

    res.status(200).json(new ApiResponse(200, {user}));
})

const updateUserHandler = asyncHandler(async (req, res)=>{
    const user = req.user;

    const updateData = req.body;

    const db = establishDbConnection()

    const [dbUser] = await db
    .select()
    .from(User)
    .where(eq(User.id, user.userId))
    .execute()

    if(!dbUser) throw new ApiError(400, "User not found.");

    await db
    .update(User)
    .set({
        firstName: updateData.firstName ?? dbUser.firstName,
        lastName: updateData.lastName ?? dbUser.lastName,
        username: updateData.username ?? dbUser.username
    })
    res.status(200).json(new ApiResponse(200, null, "User updated success."))
})

export {
    logoutHandler,
    getUserHandler,
    updateUserHandler
}
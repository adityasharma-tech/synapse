import establishDbConnection from "../db";
import { ApiError, ErrCodes } from "../lib/ApiError";
import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { Stream } from "../schemas/stream.sql";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const createNewStream = asyncHandler(async (req, res)=>{
    const { title } = req.body;
    const user = req.user;

    if(!title || !user) throw new ApiError(400, 'Title is required field.', ErrCodes.VALIDATION_ERR);

    const db = establishDbConnection()

    const streamingToken = jwt.sign({ streamerId: user.id }, process.env.STREAMER_SECRET_KEY!, {
        expiresIn: '6hr'
    })

    const streams = await db
    .insert(Stream)
    .values({
        streamTitle: title,
        streamingUid: uuidv4().toString(),
        streamerId: user.id,
        streamingToken,
        updatedAt: new Date(),
    })
    .returning()
    .execute()
    
    
    if(!streams || streams.length <= 0) throw new ApiError(400, "Failed to create new stream.");

    const stream = streams[0];

    res.status(201).json(new ApiResponse(201, {
        stream: {
            ...stream,
            streamingToken: undefined
        }
    }))
})

export {
    createNewStream
}
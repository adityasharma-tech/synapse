import { asyncHandler } from "../lib/asyncHandler"
import { ApiResponse } from "../lib/ApiResponse"

const healthCheck = asyncHandler((_, res)=>{
    res.status(200).json(
        new ApiResponse(200, null, "Server is healthy.")
    )
})

export {
    healthCheck
}
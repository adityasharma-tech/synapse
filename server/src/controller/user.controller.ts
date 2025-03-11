import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";

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

export {
    logoutHandler
}
import { ApiError } from "../lib/ApiError";
import { asyncHandler } from "../lib/asyncHandler";
import jwt from "jsonwebtoken"

const authMiddleware = asyncHandler((req, res, next)=>{
   
    const cookies = req.cookies
    if(!cookies?.accessToken){
        throw new ApiError(401, "Unauthorized");
    }
    let user;
    try {
        user = jwt.verify(cookies.accessToken, process.env.ACCESS_TOKEN_SECRET!)
    } catch (error) {
        throw new ApiError(401, "Unauthorized");
    }

    

    
    next()
})

export {
    authMiddleware
}
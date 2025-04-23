import rateLimit from "express-rate-limit";
import { ApiResponse } from "../lib/ApiResponse";

// limit the no of requests per ip for the email service only
const emailVerificationLimiter = rateLimit({
  windowMs: 1000 * 60,
  limit: 4,
  message: new ApiResponse(429, null, "Too many requests"),
  standardHeaders: true,
  legacyHeaders: false,
});

export { emailVerificationLimiter };

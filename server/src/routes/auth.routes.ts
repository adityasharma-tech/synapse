import { Router } from "express";
import { authRouteValidators } from "../middleware/validator.middleware";
import { loginHandler, registerHandler, resendEmailHandler, verifyEmailHandler } from "../controller/auth.controller";
import { emailVerificationLimiter } from "../middleware/limiters.middleware";
import { refreshTokenHandler } from "../controller/auth.controller";

const router = Router()

router.route("/verify")
    .get(
        authRouteValidators.verifyEmailRoute,
        verifyEmailHandler
    )

router.route("/login")
    .post(
        authRouteValidators.loginRoute,
        loginHandler
    )


router.route("/refresh-token")
    .post(
        refreshTokenHandler
    )


router.route("/register")
    .post(
        authRouteValidators.registerRoute,
        registerHandler
    )

router.route("/resend-email")
    .post(
        emailVerificationLimiter,
        authRouteValidators.resendEmailRoute,
        resendEmailHandler
    )

export default router;
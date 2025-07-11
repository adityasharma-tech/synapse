import { Router } from "express";
import {
    getAllSessions,
    googleLoginHandler,
    googleSignupHandler,
    logoutAll,
    logoutBySessionId,
    logoutHandler,
    refreshTokenHandler,
    resetPasswordEmailHandler,
    resetPasswordHandler,
} from "../controller/auth.controller";
import { authRouteValidators } from "../middleware/validator.middleware";
import { emailVerificationLimiter } from "../middleware/limiters.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import {
    loginHandler,
    registerHandler,
    resendEmailHandler,
    verifyEmailHandler,
} from "../controller/auth.controller";

const router = Router();

// authenticated routes
router.route("/logout").get(authMiddleware, logoutHandler);
router.route("/logout/:id").post(authMiddleware, logoutBySessionId);
router.route("/sessions").get(authMiddleware, getAllSessions);
router.route("/logout-all").get(authMiddleware, logoutAll);

// ...
router.route("/refresh-token").post(refreshTokenHandler);

router
    .route("/verify")
    .get(authRouteValidators.verifyEmailRoute, verifyEmailHandler);

router.route("/login").post(authRouteValidators.loginRoute, loginHandler);

router
    .route("/register")
    .post(authRouteValidators.registerRoute, registerHandler);

router
    .route("/resend-email")
    .post(
        emailVerificationLimiter,
        authRouteValidators.resendEmailRoute,
        resendEmailHandler
    );

router
    .route("/reset-pass-mail")
    .post(
        emailVerificationLimiter,
        authRouteValidators.resetPasswordMailRoute,
        resetPasswordEmailHandler
    );

router
    .route("/reset-password")
    .post(authRouteValidators.resetPasswordRoute, resetPasswordHandler);

// sso router
const ssoRouter = Router();

router.use("/sso", ssoRouter);

ssoRouter.route("/google/login").post(googleLoginHandler);

ssoRouter.route("/google/register").post(googleSignupHandler);

export default router;

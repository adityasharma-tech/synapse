import { Router } from "express";
import {
  refreshTokenHandler,
  resetPasswordEmailHandler,
  resetPasswordHandler,
} from "../controller/auth.controller";
import { authRouteValidators } from "../middleware/validator.middleware";
import { emailVerificationLimiter } from "../middleware/limiters.middleware";
import {
  loginHandler,
  registerHandler,
  resendEmailHandler,
  verifyEmailHandler,
} from "../controller/auth.controller";

const router = Router();

// unauthenticated routes
router.route("/refresh-token").post(refreshTokenHandler);

// authenticated routes
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

export default router;

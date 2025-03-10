import { Router } from "express";
import { loginHandler, registerHandler, resendEmailHandler, verifyEmailHandler } from "../controller/auth.controller";

const router = Router()

router.route("/verify").post(verifyEmailHandler)
router.route("/login").post(loginHandler)
router.route("/register").post(registerHandler)
router.route("/resend-email").post(resendEmailHandler)

export default router;
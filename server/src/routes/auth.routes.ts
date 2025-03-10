import { Router } from "express";

const router = Router()

router.route("/verify")
router.route("/login")
router.route("/register")
router.route("/resend-email")

export default router;
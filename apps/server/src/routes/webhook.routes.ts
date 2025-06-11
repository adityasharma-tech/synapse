import { Router } from "express";
import {
    handleVerfiyRazorpayOrder,
    handleVerifyCfOrder,
    handleUpdateSubscriptionStatus,
} from "../controller/webhook.controller";

const router = Router();

router.use((_, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

router.route("/cf").post(handleVerifyCfOrder);

// webhook to verify razorpay orders
router.route("/razorpay/orders").post(handleVerfiyRazorpayOrder);

router.route("/razorpay/subscription").post(handleUpdateSubscriptionStatus);

export default router;

import { Router } from "express";
import { handleVerfiyRazorpayOrder, handleVerifyCfOrder } from "../controller/webhook.controller";

const router = Router();

router.use((_, res, next)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    next()
})

router.route("/cf").post(handleVerifyCfOrder);
router.route('/razorpay').post(handleVerfiyRazorpayOrder)

export default router;
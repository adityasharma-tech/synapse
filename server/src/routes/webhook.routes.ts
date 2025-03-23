import { Router } from "express";
import { handleVerifyCfOrder } from "../controller/webhook.controller";

const router = Router();

router.use((_, res, next)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next()
})

router.route("/cf").post(handleVerifyCfOrder);

export default router;
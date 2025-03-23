import { Router } from "express";
import { handleVerifyCfOrder } from "../controller/webhook.controller";

const router = Router();

router.route("/cf").post(handleVerifyCfOrder);

export default router;
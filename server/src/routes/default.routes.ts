import { Router } from "express";
import { healthCheck } from "../controller/default.controller";

const router = Router();

router.route("/healthCheck").get(healthCheck);

export default router;

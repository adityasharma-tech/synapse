import { Router } from "express";
import { logoutHandler } from "../controller/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.route("/logout").get(authMiddleware,logoutHandler);

export default router;
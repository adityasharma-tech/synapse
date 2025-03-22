import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { userRouteValidators } from "../middleware/validator.middleware";
import {
  applyForStreamer,
  getUserHandler,
  logoutHandler,
  updateUserHandler,
} from "../controller/user.controller";

const router = Router();

router.use(authMiddleware);

router.route("/logout").get(logoutHandler);

router
  .route("/")
  .get(getUserHandler)
  .put(userRouteValidators.updateUserRoute, updateUserHandler);

router
  .route("/apply-streamer")
  .post(userRouteValidators.applyForStreamerRoute, applyForStreamer);

export default router;

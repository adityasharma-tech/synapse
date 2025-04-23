import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { userRouteValidators } from "../middleware/validator.middleware";
import {
  applyForStreamerV2,
  getUserHandler,
  logoutHandler,
  updateUserHandler,
} from "../controller/user.controller";
import { upload } from "../middleware/multer.middeware";

const router = Router();

router.use(authMiddleware);

router.route("/logout").get(logoutHandler);

router
  .route("/")
  .get(getUserHandler)
  .put(userRouteValidators.updateUserRoute, updateUserHandler);

router
  .route("/apply-streamer")
  .post(upload.single("document"), applyForStreamerV2);

export default router;

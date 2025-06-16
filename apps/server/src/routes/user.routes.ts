import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { userRouteValidators } from "../middleware/validator.middleware";
import {
    applyForStreamerV2,
    createPaymentPlan,
    deleteEmoteByCode,
    getAllEmotesForAStreamer,
    getUserHandler,
    logoutHandler,
    updateUserHandler,
    uploadCustomEmotes,
} from "../controller/user.controller";
import { upload } from "../middleware/multer.middeware";
import { createSubscription } from "../controller/stream.controller";

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

router.route("/create-plan").post(createPaymentPlan);

router.route("/subscribe").post(createSubscription);

router.route("/emotes").post(upload.single("emoji"), uploadCustomEmotes);

router.route("/emotes/:streamerId").get(getAllEmotesForAStreamer);

router.route("/emote/:id").delete(deleteEmoteByCode);

export default router;

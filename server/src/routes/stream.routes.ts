import { Router } from "express";
import {
  createNewStream,
  getAllChatsByStreamingId,
  getAllStreams,
  getStreamById,
  makePremiumChat,
} from "../controller/stream.controller";
import {
  authMiddleware,
  streamerAuthMiddeware,
} from "../middleware/auth.middleware";
import { streamRouteValidators } from "../middleware/validator.middleware";

const router = Router();

router.use(authMiddleware);

router
  .route("/")
  .post(
    streamerAuthMiddeware,
    streamRouteValidators.createStreamRoute,
    createNewStream
  )
  .get(streamerAuthMiddeware, getAllStreams);

router.route("/:id").get(getStreamById);

router.route("/:streamId/chats").get(getAllChatsByStreamingId);

router.route("/:streamId/premium-chat").post(makePremiumChat);

export default router;

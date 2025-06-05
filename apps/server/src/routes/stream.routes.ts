import { Router } from "express";
import {
    createNewStream,
    fetchYoutubeData,
    getAllChatsByStreamingId,
    getAllStreams,
    getStreamById,
    makePremiumChat,
} from "../controller/stream.controller";
import {
    authMiddleware,
    streamerAuthMiddeware,
} from "../middleware/auth.middleware";
import { upload } from "../middleware/multer.middeware";

const router = Router();

router.use(authMiddleware);

router
    .route("/")
    .post(
        streamerAuthMiddeware,
        upload.single("thumbnailImage"),
        createNewStream
    )
    .get(streamerAuthMiddeware, getAllStreams);

router.route("/fetchYoutubeData").post(fetchYoutubeData);

router.route("/:id").get(getStreamById);

router.route("/:streamId/chats").get(getAllChatsByStreamingId);

router.route("/:streamId/premium-chat").post(makePremiumChat);

export default router;

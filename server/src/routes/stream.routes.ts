import { Router } from "express";
import { createNewStream, getAllStreams, getStreamById } from "../controller/stream.controller";
import { authMiddleware, streamerAuthMiddeware } from "../middleware/auth.middleware";
import { streamRouteValidators } from "../middleware/validator.middleware";

const router = Router()

router.use(authMiddleware)
router.use(streamerAuthMiddeware)

router.route('/')
    .post(
        streamRouteValidators.createStreamRoute,
        createNewStream
    )
    .get(
        getAllStreams
    )

router.route('/:id')
    .get(
        getStreamById
    )

export default router;
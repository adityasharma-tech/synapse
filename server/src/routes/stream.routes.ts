import { Router } from "express";
import { createNewStream } from "../controller/stream.controller";
import { authMiddleware, streamerAuthMiddeware } from "../middleware/auth.middleware";
import { streamRouteValidators } from "../middleware/validator.middleware";

const router = Router()

router.use(authMiddleware)

router.route('/')
    .post(
        streamRouteValidators.createStreamRoute,
        streamerAuthMiddeware,
        createNewStream
    )

export default router;
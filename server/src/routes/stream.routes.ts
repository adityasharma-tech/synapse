import { Router } from "express";
import { createNewStream } from "../controller/stream.controller";

const router = Router()

router.route('/create')
    .post(createNewStream)

export default router;
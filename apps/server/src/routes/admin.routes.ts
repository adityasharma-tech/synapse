import { Router } from "express";
import {
    acceptFormData,
    downloadStreamAsCsv,
    getAllStreamApplications,
} from "../controller/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.route("/streamer-applications").get(getAllStreamApplications);

router.route("/applications-csv").get(downloadStreamAsCsv);

router.route("/accept-application").post(acceptFormData);

export default router;

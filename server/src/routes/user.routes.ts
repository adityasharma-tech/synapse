import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { userRouteValidators } from "../middleware/validator.middleware";
import { getUserHandler, logoutHandler, updateUserHandler } from "../controller/user.controller";

const router = Router();

router.use(authMiddleware)

router.route("/logout")
    .get(logoutHandler);

router.route("/")
    .get(
        getUserHandler
    )
    .put(
        userRouteValidators.updateUserRoute,
        updateUserHandler
    )

export default router;
import { SafeParseReturnType } from "zod";
import { ApiError, ErrCodes } from "@pkgs/lib";

export const handleZodError = <T>(
    result: SafeParseReturnType<unknown, T>
): T => {
    if (!result.success) {
        const firstIssue = result.error.issues[0];
        const path = firstIssue.path.join(".");

        if (
            firstIssue.code === "invalid_type" &&
            firstIssue.received === "undefined"
        ) {
            throw new ApiError(
                403,
                path ? `Missing '${path}' field` : "Missing required fields",
                ErrCodes.VALIDATION_ERR
            );
        }

        const message = path ? firstIssue.message : firstIssue.message;

        throw new ApiError(403, message, ErrCodes.VALIDATION_ERR);
    }

    return result.data;
};

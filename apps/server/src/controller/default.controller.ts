import { asyncHandler, ApiResponse } from "@pkgs/lib";

const healthCheck = asyncHandler((_, res) => {
    // removing the default cors policy so that anyone can make request to /heathCheck path
    res.append("Access-Control-Allow-Origin", "*");

    res.status(200).json(new ApiResponse(200, null, "Server is healthy."));
});

export { healthCheck };

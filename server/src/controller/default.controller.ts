import { asyncHandler } from "../lib/asyncHandler";
import { ApiResponse } from "../lib/ApiResponse";

const healthCheck = asyncHandler((_, res) => {
  const headers = new Headers();

  // removing the default cors policy so that anyone can make request to /heathCheck path 
  headers.set("Access-Control-Allow-Origin", "*");
  res.setHeaders(headers);

  res.status(200).json(new ApiResponse(200, null, "Server is healthy."));
});

export { healthCheck };

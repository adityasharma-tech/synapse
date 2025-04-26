import { z } from "zod";

const zodEnv = z.object({
    VITE_BACKEND_HOST: z.string().url("Invalid backend hostname"),

    // config of msg91 otp service
    VITE_WIDGET_ID: z.string(),
    VITE_TOKEN_AUTH: z.string(),

    // backend socket uri
    VITE_SOCKET_URI: z.string().optional(),

    // razorpay key id
    VITE_RAZORPAY_KEY_ID: z.string(),

    VITE_GOOGLE_CLIENT_ID: z.string(),
});

export { zodEnv as clientEnv };

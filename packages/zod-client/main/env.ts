import { z } from "zod";
import dotenv from "dotenv";
dotenv.config({
    path: "../../.env",
});

const zodEnv = z.object({
    MAIL_GRPC_ADDRESS: z.string(),
    PERMIT_GRPC_ADDRESS: z.string(),

    // backend host url
    HOST_URL: z.string().url("Invalid Hostname"),
    PORT: z.coerce.number().optional().default(5174),
    FRONTEND_URL: z.string().url(),

    CORS_URLS: z.string(),

    // Database configuration
    DB_NAME: z.string(),
    DB_HOST: z.string(),
    DB_PORT: z.coerce.number(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_SSL_MODE: z
        .enum([
            "require",
            "disable",
            "allow",
            "prefer",
            "verify-ca",
            "verify-full",
        ])
        .default("disable"),
    DB_SSL_CA: z.string(),

    // Mail configuration
    MAIL_API_KEY: z.string().optional(),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number(),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),

    // secret services token
    ACCESS_SECRET_KEY: z.string().nonempty(),
    REFRESH_SECRET_KEY: z.string().nonempty(),
    STREAMER_SECRET_KEY: z.string().nonempty(),

    // msg91 keys
    MSG91_AUTH_KEY: z.string(),

    // payout configs
    PAYOUT_PROVIDER: z.enum(["razorpay", "cashfree"]).default("razorpay"),

    // cashfree payout api keys
    CF_PAYOUT_XAPI_VERSION: z.string(),
    CF_PAYOUT_CLIENT_ID: z.string(),
    CF_PAYOUT_CLIENT_SECRET: z.string(),

    // cashfree payment api keys
    CF_PAYMENT_XAPI_VERSION: z.string(),
    CF_PAYMENT_CLIENT_ID: z.string(),
    CF_PAYMENT_CLIENT_SECRET: z.string(),
    CF_PAYMENT_MODE: z.enum(["production", "sandbox"]).default("sandbox"),

    // razorpay payment api keys
    RAZORPAY_KEY_ID: z.string(),
    RAZORPAY_SECRET_KEY: z.string(),
    RAZORPAY_WEBHOOK_SECRET: z.string(),

    // redis service
    REDIS_CONNECT_URI: z.string(),

    // google api services
    GOOGLE_API_KEY: z.string(),
    GOOGLE_CLIENT_ID: z.string(),

    // Cloudinary configuration
    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),

    // RabbitMQ Configuration
    RABBITMQ_URI: z.string().optional(),

    // Streamer Payout Cut in percentage
    STREAMER_PAYOUT_CUT: z.coerce.number().default(0.9), // Example: 0.9 -> 90% of amount paid,

    // // FGA Credentials
    // FGA_API_TOKEN_ISSUER: z.string(),
    // FGA_API_AUDIENCE: z.string(),
    // FGA_CLIENT_ID: z.string(),
    // FGA_CLIENT_SECRET: z.string(),
    // FGA_API_URL: z.string(),
    // FGA_MODEL_ID: z.string().optional(),
    // FGA_STORE_ID: z.string().optional(),

    SUBSCRIPTION_WEBHOOK_KEY: z.string(),
});

const env = zodEnv.parse(process.env);

export { env };

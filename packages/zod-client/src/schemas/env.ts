import { z } from "zod";
import dotenv from "dotenv";
dotenv.config({
    // path: __dirname
})

console.log(__dirname);

const serverEnvObj = z.object({
  // backend host url
  HOST_URL: z.string(),

  // Database configuration
  DB_NAME: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_SSL_MODE: z
    .enum(["require", "disable", "allow", "prefer", "verify-ca", "verify-full"])
    .default("disable"),
  DB_SSL_CA: z.string(),

  // Mail configuration
  MAIL_API_KEY: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),

  // secret services token
  ACCESS_SECRET_KEY: z.string(),
  REFRESH_SECRET_KEY: z.string(),
  STREAMER_SECRET_KEY: z.string(),
  STREAM_SECRET_KEY: z.string(),

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
  EDIS_CONNECT_URI: z.string(),

  // google api services
  GOOGLE_API_KEY: z.string(),

  // Cloudinary configuration
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  // RabbitMQ Configuration
  RABBITMQ_URI: z.string().optional(),

  // Streamer Payout Cut in percentage
  STREAMER_PAYOUT_CUT: z.string().default("0.9"), // Example: 0.9 -> 90% of amount paid
});

const webEnvObj = z.object({
  VITE_BACKEND_HOST: z.string(),

  // config of msg91 otp service
  VITE_WIDGET_ID: z.string(),
  VITE_TOKEN_AUTH: z.string(),

  // backend socket uri
  VITE_SOCKET_URI: z.string().optional(),

  // razorpay key id
  VITE_RAZORPAY_KEY_ID: z.string(),
});

const serverEnv = serverEnvObj.safeParse(process.env);
const webEnv = webEnvObj.safeParse(process.env);

export { serverEnv, webEnv };

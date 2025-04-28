import { env } from "@pkgs/zod-client";

const emailVerificationTokenExpiry = new Date(Date.now() + 6 * 60 * 60); // 6 hr

const msg91AuthKey = env.MSG91_AUTH_KEY;

export { emailVerificationTokenExpiry, msg91AuthKey };

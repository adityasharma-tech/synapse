import 'dotenv/config'

const emailVerificationTokenExpiry = new Date(Date.now() + 6 * 60 * 60) // 6 hr

const msg91AuthKey = process.env.MSG91_AUTH_KEY!;

const corsOrigins = [
    String(process.env.FRONTEND_URL!),
    'https://synapse-local.adityasharma.live'
]

export {
    emailVerificationTokenExpiry,
    msg91AuthKey,
    corsOrigins
}
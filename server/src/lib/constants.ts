import 'dotenv/config'

const emailVerificationTokenExpiry = 6 * 60 * 60 // 6 hr

export const corsOrigins = [
    String(process.env.FRONTEND_URL!)
]

export {
    emailVerificationTokenExpiry
}
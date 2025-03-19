import SMTPTransport from "nodemailer/lib/smtp-transport"
import { logger } from "../lib/logger"
import nodemailer, { SendMailOptions } from "nodemailer"

const transportOptions: SMTPTransport.Options = {
    host: process.env.SMTP_HOST!,
    port: +process.env.SMTP_PORT!,
    secure: false,
    auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!
    }
}
const transporter = nodemailer.createTransport(transportOptions)


const sendConfirmationMail = async function (email: string, verificationToken: string) {
    try {
        const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify/?verificationToken=${verificationToken}`

        const mailOptions: SendMailOptions = {
            from: "synapse@mail.adityasharma.live",
            to: email.trim(),
            subject: "Welcome to Synapse!",
            text: "Verify your email address to start using Synapse.",
            html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Email Verification</title><style>body {font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;}.header {background: rgb(131,58,180);background: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%);}.button {padding: 8px 20px;background-color: #222222;color: #ffff; text-decoration: none;}</style></head><body><div style="height: 100%; background-color: #efefef; padding: 50px 5px;"><div class="header" style="display: flex; align-items: center; padding: 10px 20px;"><span style="color: #fff; font-size: 40px;">Synapse</span></div><div style="padding: 0px 20px; padding-top: 30px; font-weight: 600;"><div>Verify your email address to start using Synapse</div><div style="padding-top: 30px;"><a href='${verificationUrl}' class="button">Verify Email</a></div></div></div></body></html>`
        }
        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error: any) {
        logger.error(`Failed to send email: ${email}, error: ${error?.message}`);
        throw new Error(`Failed to send email: ${email}`)
    }
}


const sendResetPasswordMail = async function (email: string, verificationToken: string) {
    try {
        const verificationUrl = `${process.env.FRONTEND_URL}/auth/reset-password/?verificationToken=${verificationToken}`

        const mailOptions: SendMailOptions = {
            from: "synapse@mail.adityasharma.live",
            to: email.trim(),
            subject: "Reset your password",
            text: "You're receiving this email because someone requested your password to be reset. \nThe password reset link will expire in 24 hours. If you don't want to reset your password, you can ignore this email.",
            html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Reset your password</title><style>body {font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;}.header {background: rgb(131, 58, 180);background: linear-gradient(90deg, rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 100%);}.button {padding: 8px 20px;background-color: #222222;color: #ffff;}</style></head><body><div style="height: 100%; background-color: #efefef; padding: 50px 5px;"><div class="header" style="display: flex; align-items: center; padding: 10px 20px;"><spanstyle="color: #fff; font-size: 40px;">Synapse</span></div><div style="padding: 0px 20px; padding-top: 30px; font-weight: 600;"><h1>Reset your password</h1><div style="font-weight: 400;">You're receiving this email because someone requested your password to be reset.</div><div style="margin-top: 10px; font-weight: 400;">The password reset link will expire in 24 hours. If you don't want to reset your password, you can ignore this email.</div><div style="padding-top: 30px; text-decoration: none; cursor: pointer;"><a href='${verificationUrl}' class="button">Verify Email</a></div></div></div></body></html>`
        }
        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error: any) {
        logger.error(`Failed to send email: ${email}, error: ${error?.message}`);
        throw new Error(`Failed to send email: ${email}`)
    }
}

export {
    sendConfirmationMail,
    sendResetPasswordMail
}
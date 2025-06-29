import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

import { env } from "@pkgs/zod-client";
import { logger } from "@pkgs/lib";
import { SendMailOptions } from "nodemailer";
import Mailgen from "mailgen";

// transport configuration of the smtp server which handles the mail transportation
const transportOptions: SMTPTransport.Options = {
    host: env.SMTP_HOST,
    port: +env.SMTP_PORT,
    secure: false,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
};
const transporter = nodemailer.createTransport(transportOptions);

const mailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "Synapse",
        link: "https://synapse.aditya.agency",
    },
});

/**
 * confirmation mail sending handler to send confirmation mail to the specified email with the verificationToken
 * @param {string} email - email where you have to send the confirmation link
 * @param {string} verificationToken
 * @returns the result obtained from nodemailer transporter after successfully making the mail request
 */
const sendConfirmationMail = async function (
    email: string,
    verificationToken: string
) {
    try {
        const verificationUrl = `${env.FRONTEND_URL}/auth/verify/?verificationToken=${verificationToken}`;

        const mailOptions: SendMailOptions = {
            from: "synapse@mail.adityasharma.live",
            to: email.trim(),
            subject: "Welcome to Synapse!",
            text: "Verify your email address to start using Synapse.",
            html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Email Verification</title><style>body {font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;}.header {background: rgb(131,58,180);background: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%);}.button {padding: 8px 20px;background-color: #222222;color: #ffff; text-decoration: none;}</style></head><body><div style="height: 100%; background-color: #efefef; padding: 50px 5px;"><div class="header" style="display: flex; align-items: center; padding: 10px 20px;"><span style="color: #fff; font-size: 40px;">Synapse</span></div><div style="padding: 0px 20px; padding-top: 30px; font-weight: 600;"><div>Verify your email address to start using Synapse</div><div style="padding-top: 30px;"><a href='${verificationUrl}' class="button">Verify Email</a></div></div></div></body></html>`,
        };
        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error: any) {
        logger.error(
            `Failed to send email: ${email}, error: ${error?.message}`
        );
        throw new Error(`Failed to send email: ${email}`);
    }
};

/**
 * reset password mail sending handler, which send mail to the specified email with the verificationToken
 * @param email - email where you have to send the reset password link
 * @param verificationToken - email where you have to send the reset password link
 * @returns the result obtained from nodemailer transporter after successfully making the mail request
 */
const sendResetPasswordMail = async function (
    email: string,
    verificationToken: string
) {
    try {
        const verificationUrl = `${env.FRONTEND_URL}/auth/reset-password/?verificationToken=${verificationToken}`;

        const mailOptions: SendMailOptions = {
            from: "synapse@mail.adityasharma.live",
            to: email.trim(),
            subject: "Reset your password",
            text: "You're receiving this email because someone requested your password to be reset. \nThe password reset link will expire in 24 hours. If you don't want to reset your password, you can ignore this email.",
            html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Reset your password</title><style>body {font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;}.header {background: rgb(131, 58, 180);background: linear-gradient(90deg, rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 100%);}.button {padding: 8px 20px;background-color: #222222;color: #ffff;}</style></head><body><div style="height: 100%; background-color: #efefef; padding: 50px 5px;"><div class="header" style="display: flex; align-items: center; padding: 10px 20px;"><spanstyle="color: #fff; font-size: 40px;">Synapse</span></div><div style="padding: 0px 20px; padding-top: 30px; font-weight: 600;"><h1>Reset your password</h1><div style="font-weight: 400;">You're receiving this email because someone requested your password to be reset.</div><div style="margin-top: 10px; font-weight: 400;">The password reset link will expire in 24 hours. If you don't want to reset your password, you can ignore this email.</div><div style="padding-top: 30px; text-decoration: none; cursor: pointer;"><a href='${verificationUrl}' class="button">Verify Email</a></div></div></div></body></html>`,
        };
        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error: any) {
        logger.error(
            `Failed to send email: ${email}, error: ${error?.message}`
        );
        throw new Error(`Failed to send email: ${email}`);
    }
};

const sendWelcomeEmail = async function ({
    name,
    email,
}: {
    name: string;
    email: string;
}) {
    const welcomeMail: Mailgen.Content = {
        body: {
            name,
            intro: "Welcome to Synapse! We\'re very excited to have you on board.",
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
            title: "Synapse",
        },
    };

    return await transporter.sendMail({
        from: "synapse@aditya.agency",
        to: email.toLowerCase().trim(),
        subject: "Welcome to Synapse",
        html: mailGenerator.generate(welcomeMail),
        text: mailGenerator.generatePlaintext(welcomeMail),
    });
};

const gotStreamerApplicationEmail = async function ({
    name,
    email,
}: {
    name: string;
    email: string;
}) {
    const mail: Mailgen.Content = {
        body: {
            name,
            intro: "We have received your application for streamer request on our Synapse platform. We are currently reviewing your application and will notify you once the review process is complete.",
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
            title: "Synapse - Application",
        },
    };

    return await transporter.sendMail({
        from: "synapse@aditya.agency",
        to: email.toLowerCase().trim(),
        subject: "Application recieved",
        html: mailGenerator.generate(mail),
        text: mailGenerator.generatePlaintext(mail),
    });
};

const applicationRejectedEmail = async function ({
    name,
    email,
}: {
    name: string;
    email: string;
}) {
    const mail: Mailgen.Content = {
        body: {
            name,
            intro: "We regret to inform you that your application for becoming a streamer on Synapse has been rejected. Unfortunately, your application did not meet our current requirements.",
            outro: "If you have any questions about this decision or would like to apply again in the future, please feel free to contact us.",
            title: "Synapse - Application Status",
        },
    };

    return await transporter.sendMail({
        from: "synapse@aditya.agency",
        to: email.toLowerCase().trim(),
        subject: "Synapse - Application Status",
        html: mailGenerator.generate(mail),
        text: mailGenerator.generatePlaintext(mail),
    });
};

const applicationAcceptedEmail = async function ({
    name,
    email,
}: {
    name: string;
    email: string;
}) {
    const mail: Mailgen.Content = {
        body: {
            name,
            intro: "Congratulations! Your application for becoming a streamer on Synapse has been approved. You can now start streaming on our platform.",
            outro: "If you have any questions or need assistance getting started, please don't hesitate to contact us.",
            title: "Synapse - Application Approved",
        },
    };

    return await transporter.sendMail({
        from: "synapse@aditya.agency",
        to: email.toLowerCase().trim(),
        subject: "Synapse - Application Approved",
        html: mailGenerator.generate(mail),
        text: mailGenerator.generatePlaintext(mail),
    });
};

const streamerStartStreamingEmail = async function ({
    name,
    email,
    streamerName,
    streamingLink,
}: {
    name: string;
    email: string;
    streamerName: string;
    streamingLink: string;
}) {
    const mail: Mailgen.Content = {
        body: {
            name,
            intro: `${streamerName} just went live! Click the link below to join the stream.`,
            action: {
                instructions: "Click the button below to join the stream:",
                button: {
                    color: "#222222",
                    text: "Join Stream",
                    link: streamingLink,
                },
            },
            outro: "Don't miss out on the action!",
            title: `${streamerName} is Live!`,
        },
    };

    return await transporter.sendMail({
        from: "synapse@aditya.agency",
        to: email.toLowerCase().trim(),
        subject: `${streamerName} started streaming, Join in`,
        html: mailGenerator.generate(mail),
        text: mailGenerator.generatePlaintext(mail),
    });
};

/// ...
export {
    sendConfirmationMail,
    sendResetPasswordMail,
    sendWelcomeEmail,
    gotStreamerApplicationEmail,
    applicationAcceptedEmail,
    applicationRejectedEmail,
    streamerStartStreamingEmail,
};

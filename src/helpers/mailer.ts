/**
 * mailer.ts
 *
 * Password reset emails are now handled by Supabase Auth automatically.
 * This file is kept for any future custom email needs (e.g., notifications).
 *
 * If you need to send custom emails, configure:
 *   NODEMAILER_HOST, NODEMAILER_PORT, NODEMAILER_AUTH_USER, NODEMAILER_AUTH_PASS
 * in your .env file.
 */

import nodemailer from "nodemailer";

interface SendEmailProps {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailProps) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.NODEMAILER_HOST,
            port: Number(process.env.NODEMAILER_PORT),
            auth: {
                user: process.env.NODEMAILER_AUTH_USER,
                pass: process.env.NODEMAILER_AUTH_PASS,
            },
        });

        const mailOptions = {
            from: process.env.NODEMAILER_AUTH_USER || "noreply@example.com",
            to,
            subject,
            html,
        };

        const mailResponse = await transporter.sendMail(mailOptions);
        return mailResponse;

    } catch (error: any) {
        throw new Error(error.message);
    }
};
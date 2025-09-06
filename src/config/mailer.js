"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = (process.env.SMTP_SECURE || '').toLowerCase() === 'true';
let transporter = null;
if (smtpHost && smtpPort && smtpUser && smtpPass) {
    transporter = nodemailer_1.default.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
    });
}
async function sendEmail(options) {
    const fromAddress = options.from || process.env.EMAIL_FROM || 'no-reply@example.com';
    if (!transporter) {
        // Fallback: log the email for development environments
        const payload = { ...options, from: fromAddress };
        // eslint-disable-next-line no-console
        console.log('[DEV EMAIL LOG]', JSON.stringify(payload));
        return { delivered: false };
    }
    const info = await transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    });
    return { delivered: true, info };
}
//# sourceMappingURL=mailer.js.map
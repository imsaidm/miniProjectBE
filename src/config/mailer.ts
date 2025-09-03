import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = (process.env.SMTP_SECURE || '').toLowerCase() === 'true';

let transporter: nodemailer.Transporter | null = null;

if (smtpHost && smtpPort && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ delivered: boolean; info?: any }>{
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



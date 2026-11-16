import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import { readMailConfig, type MailConfig } from './config';

let transport: { key: string; t: Transporter } | null = null;

function getTransport(cfg: MailConfig): Transporter {
  const key = `${cfg.host}:${cfg.port}:${cfg.user}`;
  if (!transport || transport.key !== key) {
    transport = {
      key,
      t: nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure,
        auth: { user: cfg.user, pass: cfg.pass },
        connectionTimeout: 8000,
        socketTimeout: 10000,
      }),
    };
  }
  return transport.t;
}

export type SendResult =
  | { sent: true }
  | { sent: false; reason: 'not-configured' | 'failed'; error?: string };

/**
 * Sends one notification. Never throws: the lead is already saved, and a mail-server problem must
 * not turn a successful submission into an error for the visitor.
 */
export async function sendNotification(mail: {
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const cfg = readMailConfig();
  if (!cfg) {
    console.warn('[mail] SMTP_HOST / SMTP_USER / SMTP_PASS / LEADS_TO_EMAIL not set: lead saved, no email sent');
    return { sent: false, reason: 'not-configured', error: 'SMTP_HOST, SMTP_USER, SMTP_PASS or LEADS_TO_EMAIL is not set' };
  }
  try {
    // await getTransport(cfg).sendMail({ from: cfg.from, to: cfg.to, ...mail });
    await getTransport(cfg).sendMail({ from: cfg.from, to: cfg.to, cc: cfg.cc, bcc: cfg.bcc, ...mail });
    return { sent: true };
  } catch (err) {
    console.error('[mail] could not send lead notification', err);
    return { sent: false, reason: 'failed', error: (err instanceof Error ? err.message : String(err)).slice(0, 500) };
  }
}

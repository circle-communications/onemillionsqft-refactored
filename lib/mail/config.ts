/**
 * SMTP configuration comes from the environment (see .env.example). Any SMTP provider works:
 * Gmail (app password), Resend, Brevo, SES, Zoho …
 */
export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  /** Where lead notifications go (comma separated list allowed). */
  to: string;
  /** Optional copies (comma separated lists allowed). */
  cc?: string;
  bcc?: string;
}

export function readMailConfig(env: Record<string, string | undefined> = process.env): MailConfig | null {
  const host = env.SMTP_HOST?.trim();
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASS?.replace(/\s+/g, '') ?? ''; // Gmail shows app passwords with spaces
  const to = env.LEADS_TO_EMAIL?.trim();
  if (!host || !user || !pass || !to) return null;
  const port = Number(env.SMTP_PORT) || 465;
  return {
    host,
    port,
    secure: port === 465,
    user,
    pass,
    from: env.MAIL_FROM?.trim() || `OneMillionSqFt <${user}>`,
    to,
    cc: env.LEADS_CC_EMAIL?.trim() || undefined,
    bcc: env.LEADS_BCC_EMAIL?.trim() || undefined,
  };
}

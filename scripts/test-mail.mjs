/**
 * npm run test:mail
 * Sends one test email using the SMTP settings in .env.local and prints the exact server answer,
 * so a wrong password / blocked login / missing setting is obvious.
 */
import fs from 'node:fs';
import nodemailer from 'nodemailer';

const env = { ...process.env };
for (const file of ['.env.local', '.env']) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const need = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'LEADS_TO_EMAIL'];
const missing = need.filter((k) => !env[k]?.trim());
if (missing.length) {
  console.error(`✗ Missing in .env.local: ${missing.join(', ')}`);
  console.error('  (the file must be in the project root, next to package.json; restart npm run dev after editing it)');
  process.exit(1);
}

const port = Number(env.SMTP_PORT) || 465;
const transport = nodemailer.createTransport({
  host: env.SMTP_HOST.trim(),
  port,
  secure: port === 465,
  auth: { user: env.SMTP_USER.trim(), pass: env.SMTP_PASS.replace(/\s+/g, '') },
  connectionTimeout: 8000,
});

try {
  await transport.verify();
  console.log('✓ Logged in to', env.SMTP_HOST);
  const info = await transport.sendMail({
    from: env.MAIL_FROM?.trim() || `OneMillionSqFt <${env.SMTP_USER.trim()}>`,
    to: env.LEADS_TO_EMAIL.trim(),
    subject: '[OneMillionSqFt] Test email',
    text: 'If you can read this, lead notifications will reach this inbox.',
  });
  console.log('✓ Sent to', env.LEADS_TO_EMAIL, '-', info.response);
  console.log('  Check the inbox and the Spam folder.');
} catch (err) {
  console.error('✗ Failed:', err.message);
  if (err.responseCode === 535 || /Invalid login|Username and Password/i.test(err.message))
    console.error('  Gmail rejected the login: SMTP_PASS must be a 16-character App Password (not your Gmail password).\n  Create one at https://myaccount.google.com/apppasswords (2-step verification must be on).');
  process.exit(1);
}

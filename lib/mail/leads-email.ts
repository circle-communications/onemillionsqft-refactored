/**
 * Turns a stored lead into the notification email: one designed template per kind of form.
 *
 *   enquiry        "Interested in <property>" (listing page), "Call-back requested" (sticky phone bar),
 *                  or a general enquiry (header / post-property help button)
 *   contact        message from the Contact page
 *   post-property  request to list a property
 *   newsletter     footer / blog signup
 *
 * Pure (no I/O) so it is unit-tested; `lib/mail/send.ts` does the sending. Email clients ignore
 * most CSS, so the markup is table based with inline styles and a plain-text twin.
 */
import { CATEGORY_BY_SLUG, type CategorySlug } from '@/lib/constants/property';
import { formatPrice } from '@/lib/format';
import type { LeadInput, LeadKind } from '@/lib/leads/schema';

export interface MailProperty {
  title: string;
  slug: string;
  locality?: string | null;
  city?: string | null;
  /** Starting price in ₹ */
  price?: number | null;
  builder?: string | null;
  image?: string | null;
  category?: string | null;
}

export interface LeadMailContext {
  /** Absolute site origin, no trailing slash. */
  siteUrl: string;
  /** The listing the lead is about, when the lead carries one that still exists. */
  property?: MailProperty | null;
  receivedAt?: Date;
  /** Database id of the saved lead, shown as a short reference. */
  leadId?: string | null;
}

export interface RenderedMail {
  subject: string;
  text: string;
  html: string;
  /** Visitor's address, so "Reply" in the inbox answers them. */
  replyTo?: string;
}

/* ───────────────────────── helpers ───────────────────────── */

export const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Header-safe: a visitor must not be able to inject line breaks into the subject. */
const oneLine = (s: string): string => s.replace(/[\r\n]+/g, ' ').trim();

/** Only http(s) URLs become links or images; anything else (javascript:, data:) is dropped. */
const safeUrl = (u: string | null | undefined): string | null => {
  if (!u) return null;
  try {
    const url = new URL(u);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
};

const formatPhone = (p: string): string => (/^\d{10}$/.test(p) ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : p);

const humanize = (key: string): string => {
  const spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
};

const INTENT_LABEL: Record<string, string> = {
  flat: 'Flat / Apartment',
  villa: 'Independent Villa',
  plot: 'Residential Plot',
  commercial: 'Commercial Space',
};

const BRAND = '#bc1f1a';
const BRAND_DARK = '#7f1612';
const INK = '#1f2937';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';

/* ───────────────────────── content model ───────────────────────── */

type Block =
  | { t: 'property'; p: MailProperty; siteUrl: string }
  | { t: 'facts'; title?: string; rows: [string, string][] }
  | { t: 'contact'; name: string | null; phone: string | null; email: string | null }
  | { t: 'note'; label: string; text: string }
  | { t: 'highlight'; label: string; value: string };

interface Layout {
  eyebrow: string;
  title: string;
  /** Short line shown in the inbox list next to the subject. */
  preheader: string;
  blocks: Block[];
}

const KIND_LABEL: Record<LeadKind, string> = {
  contact: 'Contact message',
  enquiry: 'Enquiry',
  'post-property': 'Post property request',
  newsletter: 'Newsletter signup',
};

const take = (payload: Record<string, string>, ...keys: string[]) => {
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = payload[k] ?? '';
  return out;
};

const leftover = (payload: Record<string, string>, used: string[]): [string, string][] =>
  Object.entries(payload)
    .filter(([k]) => !used.includes(k))
    .map(([k, v]) => [humanize(k), v]);

function propertyLine(p: MailProperty): string {
  return [p.locality, p.city].filter(Boolean).join(', ');
}

function layoutFor(lead: LeadInput, ctx: LeadMailContext): Layout {
  const prop = ctx.property ?? null;
  const contact: Block = { t: 'contact', name: lead.name, phone: lead.phone, email: lead.email };

  switch (lead.kind) {
    case 'enquiry': {
      const callback = lead.payload.source === 'callback-bar';
      const extra = leftover(lead.payload, ['source']);
      const blocks: Block[] = [];
      if (prop) blocks.push({ t: 'property', p: prop, siteUrl: ctx.siteUrl });
      blocks.push(contact);
      if (lead.message) blocks.push({ t: 'note', label: 'Their message', text: lead.message });
      if (extra.length) blocks.push({ t: 'facts', title: 'More details', rows: extra });
      return {
        eyebrow: callback ? 'Call-back request' : prop ? 'Property enquiry' : 'New enquiry',
        title: callback
          ? 'A visitor wants a call back'
          : prop
            ? `Someone is interested in ${prop.title}`
            : 'New enquiry from the website',
        preheader: `${lead.name ?? (lead.phone ? formatPhone(lead.phone) : 'A visitor')} is waiting to hear from you.`,
        blocks,
      };
    }

    case 'contact': {
      const rawIntent = lead.payload.intent ?? '';
      const intent = INTENT_LABEL[rawIntent] ?? rawIntent;
      const rows: [string, string][] = [];
      if (intent) rows.push(['Looking for', intent]);
      if (lead.payload.area) rows.push(['Preferred area', lead.payload.area]);
      rows.push(...leftover(lead.payload, ['intent', 'area']));
      const blocks: Block[] = [contact];
      if (rows.length) blocks.push({ t: 'facts', title: 'What they are looking for', rows });
      if (lead.message) blocks.push({ t: 'note', label: 'Their message', text: lead.message });
      return {
        eyebrow: 'Contact form',
        title: `New message from ${lead.name ?? 'a visitor'}`,
        preheader: lead.message ? lead.message.slice(0, 110) : 'Sent from the Contact page.',
        blocks,
      };
    }

    case 'post-property': {
      const f = take(lead.payload, 'propertyType', 'bhk', 'location', 'price', 'userType', 'projectName', 'area', 'possession', 'reraNumber');
      const typeLabel = CATEGORY_BY_SLUG[f.propertyType as CategorySlug]?.singular ?? f.propertyType;
      const rows: [string, string][] = [];
      const add = (label: string, v: string) => v && rows.push([label, v]);
      add('Property type', typeLabel);
      add('Project / society', f.projectName);
      add('Location', f.location);
      add('Bedrooms', f.bhk ? `${f.bhk} BHK` : '');
      add('Area', f.area ? `${f.area} sq.ft` : '');
      add('Expected price', f.price);
      add('Possession', f.possession);
      add('RERA number', f.reraNumber);
      add('Listing as', f.userType);
      rows.push(...leftover(lead.payload, ['propertyType', 'bhk', 'location', 'price', 'userType', 'projectName', 'area', 'possession', 'reraNumber', 'description']));
      const blocks: Block[] = [];
      if (f.projectName || typeLabel)
        blocks.push({ t: 'highlight', label: typeLabel || 'Property', value: [f.projectName, f.location].filter(Boolean).join(' · ') });
      blocks.push({ t: 'facts', title: 'Property details', rows });
      if (lead.message) blocks.push({ t: 'note', label: 'Description', text: lead.message });
      blocks.push(contact);
      return {
        eyebrow: 'Post property',
        title: 'New property listing request',
        preheader: `${lead.name ?? 'A seller'} wants to list ${f.projectName || typeLabel || 'a property'}${f.location ? ` in ${f.location}` : ''}.`,
        blocks,
      };
    }

    case 'newsletter':
      return {
        eyebrow: 'Newsletter',
        title: 'New newsletter subscriber',
        preheader: `${lead.email ?? 'Someone'} subscribed to your updates.`,
        blocks: [
          { t: 'highlight', label: 'Subscriber', value: lead.email ?? '' },
          ...(leftover(lead.payload, []).length ? [{ t: 'facts', rows: leftover(lead.payload, []) } as Block] : []),
        ],
      };
  }
}

function subjectFor(lead: LeadInput, ctx: LeadMailContext): string {
  const who = lead.name ?? (lead.phone ? formatPhone(lead.phone) : lead.email ?? 'visitor');
  const prop = ctx.property;
  switch (lead.kind) {
    case 'enquiry':
      return lead.payload.source === 'callback-bar'
        ? `Call-back request: ${who}${prop ? ` – ${prop.title}` : ''}`
        : prop
          ? `Property enquiry: ${prop.title} – ${who}`
          : `New enquiry: ${who}`;
    case 'contact':
      return `Contact form: ${who}`;
    case 'post-property': {
      const p = lead.payload.projectName || lead.payload.propertyType || 'property';
      return `Post property request: ${p} – ${who}`;
    }
    case 'newsletter':
      return `Newsletter signup: ${lead.email}`;
  }
}

/* ───────────────────────── HTML rendering ───────────────────────── */

const font = "font-family:'Segoe UI',Helvetica,Arial,sans-serif";

function button(label: string, href: string, primary: boolean): string {
  const style = primary
    ? `background:${BRAND};color:#ffffff;border:1px solid ${BRAND}`
    : `background:#ffffff;color:${BRAND};border:1px solid ${BRAND}`;
  return `<a href="${escapeHtml(href)}" style="${font};display:inline-block;padding:10px 18px;margin:0 8px 8px 0;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;${style}">${escapeHtml(label)}</a>`;
}

function cardOpen(title?: string): string {
  return (
    `<tr><td style="padding:0 32px 20px 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};border-radius:12px"><tr><td style="padding:18px 20px">` +
    (title
      ? `<div style="${font};font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:${MUTED};font-weight:700;margin-bottom:12px">${escapeHtml(title)}</div>`
      : '')
  );
}
const cardClose = `</td></tr></table></td></tr>`;

function renderBlockHtml(b: Block): string {
  switch (b.t) {
    case 'highlight':
      return (
        `<tr><td style="padding:0 32px 20px 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:12px"><tr><td style="padding:18px 20px;border-left:4px solid ${BRAND}">` +
        `<div style="${font};font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:${BRAND};font-weight:700">${escapeHtml(b.label)}</div>` +
        `<div style="${font};font-size:20px;font-weight:700;color:${INK};margin-top:4px;word-break:break-word">${escapeHtml(b.value)}</div>` +
        `</td></tr></table></td></tr>`
      );

    case 'property': {
      const { p, siteUrl } = b;
      const img = safeUrl(p.image);
      const link = `${siteUrl}/property/${encodeURIComponent(p.slug)}`;
      const facts = [propertyLine(p), p.builder ? `by ${p.builder}` : ''].filter(Boolean).join(' · ');
      return (
        cardOpen('Property they are interested in') +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>` +
        (img
          ? `<td width="112" valign="top" style="padding-right:16px"><img src="${escapeHtml(img)}" width="112" height="84" alt="" style="display:block;width:112px;height:84px;object-fit:cover;border-radius:8px;border:0"></td>`
          : '') +
        `<td valign="top"><div style="${font};font-size:17px;font-weight:700;color:${INK}">${escapeHtml(p.title)}</div>` +
        (facts ? `<div style="${font};font-size:13px;color:${MUTED};margin-top:3px">${escapeHtml(facts)}</div>` : '') +
        (p.price ? `<div style="${font};font-size:15px;font-weight:700;color:${BRAND};margin-top:6px">From ${escapeHtml(formatPrice(p.price))}</div>` : '') +
        `<div style="margin-top:10px"><a href="${escapeHtml(link)}" style="${font};font-size:13px;font-weight:600;color:${BRAND};text-decoration:none">View listing &rarr;</a></div>` +
        `</td></tr></table>` +
        cardClose
      );
    }

    case 'facts':
      return (
        cardOpen(b.title) +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">` +
        b.rows
          .map(
            ([k, v], i) =>
              `<tr><td style="${font};padding:9px 12px 9px 0;width:38%;font-size:13px;color:${MUTED};vertical-align:top;${i ? `border-top:1px solid ${LINE}` : ''}">${escapeHtml(k)}</td>` +
              `<td style="${font};padding:9px 0;font-size:14px;color:${INK};font-weight:600;vertical-align:top;word-break:break-word;${i ? `border-top:1px solid ${LINE}` : ''}">${escapeHtml(v)}</td></tr>`,
          )
          .join('') +
        `</table>` +
        cardClose
      );

    case 'contact': {
      const rows: string[] = [];
      const line = (label: string, valueHtml: string) =>
        rows.push(
          `<tr><td style="${font};padding:5px 12px 5px 0;width:90px;font-size:13px;color:${MUTED};vertical-align:top">${label}</td><td style="${font};padding:5px 0;font-size:15px;color:${INK};font-weight:600;word-break:break-word">${valueHtml}</td></tr>`,
        );
      if (b.name) line('Name', escapeHtml(b.name));
      if (b.phone) line('Phone', `<a href="tel:${escapeHtml(telNumber(b.phone))}" style="color:${INK};text-decoration:none">${escapeHtml(formatPhone(b.phone))}</a>`);
      if (b.email) line('Email', `<a href="mailto:${escapeHtml(b.email)}" style="color:${INK};text-decoration:none">${escapeHtml(b.email)}</a>`);
      const buttons = [
        b.phone ? button('Call now', `tel:${telNumber(b.phone)}`, true) : '',
        b.phone && /^\d{10}$/.test(b.phone) ? button('WhatsApp', `https://wa.me/91${b.phone}`, false) : '',
        b.email ? button('Reply by email', `mailto:${b.email}`, !b.phone) : '',
      ].join('');
      return (
        cardOpen('Contact details') +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join('')}</table>` +
        (buttons ? `<div style="margin-top:14px">${buttons}</div>` : '') +
        cardClose
      );
    }

    case 'note':
      return (
        cardOpen(b.label) +
        `<div style="${font};font-size:15px;line-height:1.6;color:${INK};white-space:pre-wrap;word-break:break-word">${escapeHtml(b.text)}</div>` +
        cardClose
      );
  }
}

const telNumber = (p: string): string => (/^\d{10}$/.test(p) ? `+91${p}` : p);

const when = (d: Date): string =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d) + ' IST';

function renderHtml(layout: Layout, lead: LeadInput, ctx: LeadMailContext, received: Date): string {
  const ref = ctx.leadId ? `Ref ${ctx.leadId.slice(0, 8).toUpperCase()}` : '';
  const source = safeUrl(lead.sourceUrl);
  const meta = [`Received ${when(received)}`, ref, KIND_LABEL[lead.kind]].filter(Boolean).join(' · ');

  return (
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<meta name="color-scheme" content="light"><title>${escapeHtml(layout.title)}</title></head>` +
    `<body style="margin:0;padding:0;background:#f3f4f6">` +
    // hidden preheader: the grey text next to the subject in the inbox list
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(layout.preheader)}</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6"><tr><td align="center" style="padding:24px 12px">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">` +
    // header band
    `<tr><td style="background:${BRAND};background-image:linear-gradient(135deg,${BRAND} 0%,${BRAND_DARK} 100%);padding:26px 32px">` +
    `<div style="${font};font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#fecdcd">OneMillionSqFt</div>` +
    `<div style="${font};display:inline-block;margin-top:14px;padding:4px 12px;border-radius:999px;background:rgba(255,255,255,.18);color:#ffffff;font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase">${escapeHtml(layout.eyebrow)}</div>` +
    `<div style="${font};font-size:24px;line-height:1.3;font-weight:700;color:#ffffff;margin-top:10px;word-break:break-word">${escapeHtml(layout.title)}</div>` +
    `</td></tr>` +
    `<tr><td style="height:24px;line-height:24px;font-size:0">&nbsp;</td></tr>` +
    layout.blocks.map(renderBlockHtml).join('') +
    // footer
    `<tr><td style="padding:8px 32px 28px 32px;border-top:1px solid ${LINE}">` +
    `<div style="${font};font-size:12px;color:${MUTED};line-height:1.6;padding-top:16px">${escapeHtml(meta)}` +
    (source ? `<br>Sent from <a href="${escapeHtml(source)}" style="color:${MUTED}">${escapeHtml(source)}</a>` : '') +
    `<br>Replying to this email writes directly to the visitor${lead.email ? '' : ' (they did not leave an email, so call or WhatsApp instead)'}.</div>` +
    `</td></tr></table></td></tr></table></body></html>`
  );
}

/* ───────────────────────── plain text ───────────────────────── */

function renderBlockText(b: Block): string {
  switch (b.t) {
    case 'highlight':
      return `${b.label.toUpperCase()}: ${b.value}`;
    case 'property': {
      const lines = [`PROPERTY: ${b.p.title}`];
      const place = propertyLine(b.p);
      if (place) lines.push(`Location: ${place}`);
      if (b.p.builder) lines.push(`Builder: ${b.p.builder}`);
      if (b.p.price) lines.push(`From: ${formatPrice(b.p.price)}`);
      lines.push(`Listing: ${b.siteUrl}/property/${b.p.slug}`);
      return lines.join('\n');
    }
    case 'facts':
      return [b.title ? b.title.toUpperCase() : '', ...b.rows.map(([k, v]) => `${k}: ${v}`)].filter(Boolean).join('\n');
    case 'contact':
      return [
        'CONTACT',
        b.name && `Name: ${b.name}`,
        b.phone && `Phone: ${formatPhone(b.phone)}`,
        b.email && `Email: ${b.email}`,
      ]
        .filter(Boolean)
        .join('\n');
    case 'note':
      return `${b.label.toUpperCase()}\n${b.text}`;
  }
}

/* ───────────────────────── entry point ───────────────────────── */

export function renderLeadEmail(lead: LeadInput, ctx: LeadMailContext): RenderedMail {
  const received = ctx.receivedAt ?? new Date();
  const layout = layoutFor(lead, ctx);
  const ref = ctx.leadId ? ` (Ref ${ctx.leadId.slice(0, 8).toUpperCase()})` : '';
  const text =
    `${layout.title}\n${'='.repeat(Math.min(layout.title.length, 60))}\n\n` +
    layout.blocks.map(renderBlockText).join('\n\n') +
    `\n\n--\nReceived ${when(received)}${ref}` +
    (lead.sourceUrl ? `\nSent from ${lead.sourceUrl}` : '');

  return {
    subject: oneLine(`[OneMillionSqFt] ${subjectFor(lead, ctx)}`).slice(0, 200),
    text,
    html: renderHtml(layout, lead, ctx, received),
    replyTo: lead.email ?? undefined,
  };
}

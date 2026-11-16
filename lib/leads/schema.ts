/**
 * Lead validation shared by the API routes (authoritative) and, if wanted, the forms.
 * Dependency-free on purpose: four small shapes do not justify a schema library.
 */

export const LEAD_KINDS = ['contact', 'enquiry', 'post-property', 'newsletter'] as const;
export type LeadKind = (typeof LEAD_KINDS)[number];

export interface LeadInput {
  kind: LeadKind;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  propertySlug: string | null;
  sourceUrl: string | null;
  /** Everything else the form sent, trimmed and size-capped, stored as jsonb. */
  payload: Record<string, string>;
}

export type LeadResult =
  | { ok: true; value: LeadInput }
  | { ok: false; errors: Record<string, string> };

const MAX_FIELD = 2000;
const MAX_PAYLOAD_KEYS = 25;

const clean = (v: unknown, max = MAX_FIELD): string =>
  typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max) : '';

/** Indian mobile: optional +91 / 91 / 0 prefix, then 10 digits starting 6-9. Returns the 10 digits. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  const local = digits.length > 10 ? digits.replace(/^(91|0)+/, '') : digits;
  return /^[6-9]\d{9}$/.test(local) ? local : null;
}

export const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 254;

const RESERVED = new Set([
  // 'name', 'phone', 'email', 'message', 'hp', 'propertySlug', 'sourceUrl', 'kind',
  'name', 'phone', 'email', 'message', 'ft', 'propertySlug', 'sourceUrl', 'kind',
]);

export function validateLead(kind: LeadKind, body: unknown): LeadResult {
  const src = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const name = clean(src.name, 120);
  const phoneRaw = clean(src.phone, 32);
  const email = clean(src.email, 254).toLowerCase();
  const message = clean(src.message ?? src.description, MAX_FIELD);

  let phone: string | null = null;
  if (phoneRaw) {
    phone = normalizePhone(phoneRaw);
    if (!phone) errors.phone = 'Enter a valid 10-digit mobile number';
  }
  if (email && !isEmail(email)) errors.email = 'Enter a valid email address';

  switch (kind) {
    case 'newsletter':
      if (!email) errors.email = 'Email is required';
      break;
    case 'enquiry':
      if (!phone && !email) errors.phone = 'Phone number is required';
      break;
    case 'contact':
      if (!name) errors.name = 'Name is required';
      if (!phone && !email) errors.phone = 'Phone number or email is required';
      break;
    case 'post-property':
      if (!name) errors.name = 'Name is required';
      if (!phone) errors.phone = 'A valid 10-digit mobile number is required';
      if (!clean(src.propertyType)) errors.propertyType = 'Property type is required';
      break;
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  const payload: Record<string, string> = {};
  for (const [key, val] of Object.entries(src)) {
    if (RESERVED.has(key) || Object.keys(payload).length >= MAX_PAYLOAD_KEYS) continue;
    const v = clean(val, 500);
    if (v) payload[clean(key, 60)] = v;
  }

  return {
    ok: true,
    value: {
      kind,
      name: name || null,
      phone,
      email: email || null,
      message: message || null,
      propertySlug: clean(src.propertySlug, 120) || null,
      sourceUrl: clean(src.sourceUrl, 500) || null,
      payload,
    },
  };
}

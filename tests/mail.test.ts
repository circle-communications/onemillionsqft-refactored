import { describe, expect, it } from 'vitest';
import { renderLeadEmail, type MailProperty } from '@/lib/mail/leads-email';
import { readMailConfig } from '@/lib/mail/config';
import { validateLead } from '@/lib/leads/schema';

const lead = (kind: Parameters<typeof validateLead>[0], body: Record<string, unknown>) => {
  const r = validateLead(kind, body);
  if (!r.ok) throw new Error(JSON.stringify(r.errors));
  return r.value;
};
const ctx = { siteUrl: 'https://x.in', receivedAt: new Date('2026-11-14T11:42:00Z'), leadId: 'abcdef12-0000' };
const prop: MailProperty = {
  title: 'Ramprasad',
  slug: 'ramprasad',
  locality: 'T Nagar',
  city: 'Chennai',
  price: 12500000,
  builder: 'Harmony Homes',
  image: 'https://img.example/a.jpg',
};

describe('enquiry emails', () => {
  it('property enquiry: property card, listing link, contact buttons, message', () => {
    const m = renderLeadEmail(lead('enquiry', { name: 'Ravi', phone: '98765 43210', email: 'Ravi@Example.com', message: 'Is 3 BHK available?', propertySlug: 'ramprasad' }), { ...ctx, property: prop });
    expect(m.subject).toBe('[OneMillionSqFt] Property enquiry: Ramprasad – Ravi');
    expect(m.replyTo).toBe('ravi@example.com');
    expect(m.html).toContain('https://x.in/property/ramprasad');
    expect(m.html).toContain('tel:+919876543210');
    expect(m.html).toContain('https://wa.me/919876543210');
    expect(m.html).toContain('mailto:ravi@example.com');
    expect(m.html).toContain('₹1.25 Cr');
    expect(m.html).toContain('Is 3 BHK available?');
    expect(m.html).toContain('Ref ABCDEF12');
    expect(m.text).toContain('Phone: +91 98765 43210');
  });
  it('call-back bar (phone only) has its own wording and no email button', () => {
    const m = renderLeadEmail(lead('enquiry', { phone: '9876543210', source: 'callback-bar', propertySlug: 'ramprasad' }), { ...ctx, property: prop });
    expect(m.subject).toContain('Call-back request');
    expect(m.html).toContain('wants a call back');
    expect(m.html).not.toContain('Reply by email');
    expect(m.html).not.toContain('>Source<'); // the internal marker is not shown as a field
    expect(m.replyTo).toBeUndefined();
  });
  it('general enquiry (no property)', () => {
    const m = renderLeadEmail(lead('enquiry', { name: 'Asha', phone: '9876543210' }), ctx);
    expect(m.subject).toBe('[OneMillionSqFt] New enquiry: Asha');
  });
});

describe('other kinds', () => {
  it('contact: maps the intent to a label', () => {
    const m = renderLeadEmail(lead('contact', { name: 'Meena', phone: '9876543210', intent: 'villa', area: 'Pallikaranai', message: 'Call me' }), ctx);
    expect(m.html).toContain('Independent Villa');
    expect(m.html).toContain('Pallikaranai');
    expect(m.subject).toContain('Contact form: Meena');
  });
  it('post-property: every form field appears once, with the category label', () => {
    const m = renderLeadEmail(
      lead('post-property', { name: 'Kumar', phone: '9876543210', propertyType: 'residential-plot', projectName: 'Green Acres', location: 'Medavakkam', area: '1200', price: '60 L', possession: 'Ready to move', reraNumber: 'TN/29/X', userType: 'Owner', description: 'Corner plot' }),
      ctx,
    );
    for (const s of ['Residential Plot', 'Green Acres', 'Medavakkam', '1200 sq.ft', '60 L', 'Ready to move', 'TN/29/X', 'Owner', 'Corner plot']) expect(m.html).toContain(s);
    expect(m.html.match(/Corner plot/g)).toHaveLength(1);
    expect(m.subject).toContain('Post property request: Green Acres');
  });
  it('newsletter', () => {
    const m = renderLeadEmail(lead('newsletter', { email: 'a@b.co' }), ctx);
    expect(m.subject).toBe('[OneMillionSqFt] Newsletter signup: a@b.co');
    expect(m.html).toContain('a@b.co');
  });
});

describe('safety', () => {
  it('escapes HTML, drops non-http image/links, blocks header injection', () => {
    const m = renderLeadEmail(lead('contact', { name: '<b>Ravi</b>', phone: '9876543210', message: 'hi <script>alert(1)</script>' }), {
      ...ctx,
      property: { ...prop, title: 'Amber\r\nBcc: evil@x.com', image: 'javascript:alert(1)' },
    });
    expect(m.html).not.toContain('<script>');
    expect(m.html).toContain('&lt;b&gt;Ravi');
    const m2 = renderLeadEmail(lead('enquiry', { phone: '9876543210', propertySlug: 'amber' }), { ...ctx, property: { ...prop, title: 'Amber\r\nBcc: evil@x.com', image: 'javascript:alert(1)' } });
    expect(m2.subject).not.toMatch(/[\r\n]/);
    expect(m2.html).not.toContain('javascript:');
  });
});

describe('readMailConfig', () => {
  const base = { SMTP_HOST: 'smtp.gmail.com', SMTP_USER: 'a@gmail.com', SMTP_PASS: 'abcd efgh ijkl mnop', LEADS_TO_EMAIL: 'b@x.com' };
  it('is null unless all four settings exist', () => {
    expect(readMailConfig({ ...base, LEADS_TO_EMAIL: '' })).toBeNull();
    expect(readMailConfig({})).toBeNull();
  });
  it('strips spaces from app passwords and defaults port/from', () => {
    const c = readMailConfig(base)!;
    expect(c.pass).toBe('abcdefghijklmnop');
    expect(c.port).toBe(465);
    expect(c.secure).toBe(true);
    expect(c.from).toContain('a@gmail.com');
  });
});

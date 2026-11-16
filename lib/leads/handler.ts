import 'server-only';
import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { MissingEnvError } from '@/lib/supabase/env';
import { validateLead, type LeadKind } from '@/lib/leads/schema';
import { clientIp, hit } from '@/lib/leads/rate-limit';
import { renderLeadEmail, type MailProperty } from '@/lib/mail/leads-email';
import { sendNotification } from '@/lib/mail/send';
import { automationReason } from '@/lib/leads/timing';

const MAX_BODY_BYTES = 20_000;

const json = (body: Record<string, unknown>, status: number, headers?: Record<string, string>) =>
  NextResponse.json(body, { status, headers });

/** One implementation behind /api/contact, /api/enquiry, /api/post-property and /api/newsletter. */
export async function handleLead(kind: LeadKind, req: Request): Promise<NextResponse> {
  const limit = hit(`${kind}:${clientIp(req.headers)}`);
  if (!limit.allowed) {
    return json({ ok: false, error: 'Too many requests. Please try again later.' }, 429, {
      'Retry-After': String(limit.retryAfterSeconds),
    });
  }

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return json({ ok: false, error: 'Request too large.' }, 413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  // Honeypot: a hidden field real visitors never fill. Pretend success so bots learn nothing,
  // but log it so a wrongly dropped enquiry (e.g. a form-filler extension) can be diagnosed.
  // const trap = body && typeof body === 'object' ? (body as Record<string, unknown>).hp : undefined;
  // if (trap) {
  //   console.warn(`[leads] ${kind} discarded: honeypot field was filled`);
  //   return json({ ok: true }, 201);
  // }
  const automated = automationReason(body);
  if (automated) {
    console.warn(`[leads] ${kind} discarded: ${automated}`);
    return json({ ok: true }, 201);
  }

  const result = validateLead(kind, body);
  if (!result.ok) return json({ ok: false, errors: result.errors }, 422);
  const lead = result.value;

  try {
    const db = getAdminClient();

    let propertyId: string | null = null;
    let property: MailProperty | null = null;
    if (lead.propertySlug) {
      const { data } = await db.from('properties').select('id').eq('slug', lead.propertySlug).maybeSingle();
      propertyId = (data as { id: string } | null)?.id ?? null;
      // Display details for the email; only published listings are visible through the view.
      const { data: card } = await db
        .from('property_cards')
        .select('title,slug,locality,city,price,builder,image_url,category')
        .eq('slug', lead.propertySlug)
        .maybeSingle();
      if (card) {
        const c = card as Record<string, unknown>;
        property = {
          title: String(c.title),
          slug: String(c.slug),
          locality: (c.locality as string) ?? null,
          city: (c.city as string) ?? null,
          price: c.price == null ? null : Number(c.price),
          builder: (c.builder as string) ?? null,
          image: (c.image_url as string) ?? null,
          category: (c.category as string) ?? null,
        };
      }
    }

    const { data: saved, error } = await db
      .from('leads')
      .insert({
        kind: lead.kind,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        message: lead.message,
        property_id: propertyId,
        payload: lead.payload,
        source_url: lead.sourceUrl ?? req.headers.get('referer'),
      })
      .select('id')
      .single();
    if (error) throw error;

    // The lead is safe in the database; the email is a best-effort notification on top of it.
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin).replace(/\/$/, '');
    const leadId = (saved as { id: string } | null)?.id ?? null;
    const sent = await sendNotification(renderLeadEmail(lead, { siteUrl, property, leadId }));

    // Record the outcome on the row so a missing email can be diagnosed from the database.
    if (leadId) {
      const { error: markError } = await db
        .from('leads')
        .update({
          email_status: sent.sent ? 'sent' : sent.reason,
          email_error: sent.sent ? null : (sent.error ?? null),
          emailed_at: sent.sent ? new Date().toISOString() : null,
        })
        .eq('id', leadId);
      if (markError) console.error('[leads] could not record email status', markError);
    }

    return json({ ok: true }, 201);
  } catch (err) {
    if (err instanceof MissingEnvError) {
      console.error(`[leads] ${err.message}`);
      return json({ ok: false, error: 'Enquiries are temporarily unavailable. Please call us instead.' }, 503);
    }
    console.error('[leads] insert failed', err);
    return json({ ok: false, error: 'Could not save your request. Please try again.' }, 500);
  }
}

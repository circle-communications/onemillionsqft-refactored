import type { LeadKind } from '@/lib/leads/schema';

export class LeadSubmitError extends Error {
  constructor(message: string, readonly fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'LeadSubmitError';
  }
}

/** Browser helper: POST a form to its lead endpoint; throws LeadSubmitError with a user-facing message. */
export async function submitLead(kind: LeadKind, data: Record<string, unknown>): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`/api/${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined }),
    });
  } catch {
    throw new LeadSubmitError('Network error. Please check your connection and try again.');
  }
  if (res.ok) return;

  let body: { error?: string; errors?: Record<string, string> } = {};
  try {
    body = await res.json();
  } catch {
    /* non-JSON error body */
  }
  const first = body.errors ? Object.values(body.errors)[0] : undefined;
  throw new LeadSubmitError(body.error ?? first ?? 'Something went wrong. Please try again.', body.errors);
}

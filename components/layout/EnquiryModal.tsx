'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { CheckCircle2, Send, X } from 'lucide-react';
import { submitLead, LeadSubmitError } from '@/lib/leads/client';
import { normalizePhone } from '@/lib/leads/schema';
import { Honeypot } from '@/components/layout/Honeypot';

const inputCls =
  'w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20';

function Field({
  id,
  label,
  required,
  optional,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
        {optional && <span className="text-neutral-400"> (optional)</span>}
      </label>
      {children}
    </div>
  );
}

// const EMPTY = { name: '', phone: '', email: '', message: '', hp: '' };
const EMPTY = { name: '', phone: '', email: '', message: '' };

export interface EnquiryModalProps {
  open: boolean;
  onClose: () => void;
  /** Slug of the listing the visitor is asking about; stored with the lead. */
  propertySlug?: string;
  /** Replaces the default "Enquire Now" title (e.g. the project name). */
  heading?: string;
}

/** The one enquiry form of the site. Posts to /api/enquiry (rate limited, validated, stored in `leads`). */
export function EnquiryModal({ open, onClose, propertySlug, heading }: EnquiryModalProps) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Reset shortly after closing so the closing animation does not flash an empty form.
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setForm(EMPTY);
      setSuccess(false);
      setError('');
      setSubmitting(false);
    }, 300);
    return () => clearTimeout(t);
  }, [open]);

  // Escape closes the dialog
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone number are required.');
      return;
    }
    if (!normalizePhone(form.phone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitLead('enquiry', { ...form, propertySlug });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof LeadSubmitError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={heading ?? 'Enquire now'}
        className="relative max-h-[92vh] w-full max-w-md animate-slide-up overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="flex flex-col items-center px-8 py-14 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-neutral-900">Enquiry Submitted!</h3>
            <p className="mb-6 text-sm text-neutral-500">Thank you. Our team will get back to you shortly.</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="px-6 py-8 sm:px-8">
            <div className="mb-6 pr-8">
              <h2 className="text-xl font-semibold text-neutral-900">{heading ?? 'Enquire Now'}</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Fill in your details and we&apos;ll get in touch with you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* <Honeypot value={form.hp} onChange={(v) => setForm((p) => ({ ...p, hp: v }))} /> */}

              <Field id="enq-name" label="Full Name" required>
                <input
                  id="enq-name"
                  name="name"
                  type="text"
                  autoFocus
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={inputCls}
                  required
                />
              </Field>
              <Field id="enq-phone" label="Phone Number" required>
                <input
                  id="enq-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className={inputCls}
                  required
                />
              </Field>
              <Field id="enq-email" label="Email" optional>
                <input
                  id="enq-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </Field>
              <Field id="enq-message" label="What are you looking for?">
                <textarea
                  id="enq-message"
                  name="message"
                  rows={3}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="e.g. 2 BHK in Medavakkam, budget under 80L..."
                  className={`${inputCls} resize-none`}
                />
              </Field>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Enquiry
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

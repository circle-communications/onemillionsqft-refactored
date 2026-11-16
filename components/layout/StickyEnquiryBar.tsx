'use client';

import { useState, useEffect } from 'react';
import { Phone, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { submitLead, LeadSubmitError } from '@/lib/leads/client';
import { Honeypot } from '@/components/layout/Honeypot';

export function StickyEnquiryBar({
    heading = 'Interested in this Property?',
    propertySlug,
}: {
    heading?: string;
    /** Listing the call-back request is about; stored with the lead. */
    propertySlug?: string;
}) {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [sent, setSent] = useState(false);
    const [phone, setPhone] = useState('');
    // const [trap, setTrap] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const show = visible && !dismissed;
    const tab = show ? 0 : -1;

    return (
        <div
            aria-hidden={!show}
            className="pointer-events-none fixed inset-x-0 bottom-6 z-50 hidden justify-center px-6 lg:flex"
        >
            <style>{`
    @keyframes enquiryShimmer {
        0% { transform: translateX(-120%) skewX(-20deg); }
        60%, 100% { transform: translateX(320%) skewX(-20deg); }
    }
    @media (prefers-reduced-motion: reduce) {
        .enquiry-shimmer-bar { animation: none !important; }
    }
`}</style>

            <div
                className={`relative flex w-full max-w-4xl items-center gap-6 overflow-hidden rounded-2xl border border-white/70 bg-white/85 py-3.5 pl-6 pr-4 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${show
                    ? 'pointer-events-auto translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-24 opacity-0'
                    }`}
            >
                {/* top accent line */}
                <span className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent" />

                {/* Message */}
                <div className="flex min-w-0 items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                    </span>
                    <div className="min-w-0">
                        <p className="truncate font-sans text-sm font-medium text-neutral-900 mb-0.5">{heading}</p>
                        <p className="truncate text-xs text-neutral-500">
                            Get pricing, floor plans and site visit details
                        </p>
                    </div>
                </div>

                {/* Form / success */}
                <div className="ml-auto flex items-center gap-3">
                    {sent ? (
                        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Thank you! Our team will call you back.
                        </div>
                    ) : (
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setSubmitting(true);
                                setError('');
                                try {
                                    // await submitLead('enquiry', { phone, propertySlug, source: 'callback-bar', hp: trap });
                                    await submitLead('enquiry', { phone, propertySlug, source: 'callback-bar' });
                                    setSent(true);
                                } catch (err) {
                                    setError(err instanceof LeadSubmitError ? err.message : 'Something went wrong. Please try again.');
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                            className="flex items-center gap-3"
                        >
                            {/* <Honeypot value={trap} onChange={setTrap} /> */}
                            <label className="group relative">
                                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-red-500" />
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    required
                                    tabIndex={tab}
                                    maxLength={10}
                                    pattern="[0-9]{10}"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter 10-digit mobile number"
                                    aria-label="Mobile number"
                                    className="w-64 rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/15"
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={submitting}
                                tabIndex={tab}
                                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 to-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:brightness-105 active:scale-[0.98]"
                            >
                                <span
                                    aria-hidden
                                    className="enquiry-shimmer-bar pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                                    style={{ animation: 'enquiryShimmer 3.8s ease-in-out infinite' }}
                                />
                                {submitting ? 'Sending…' : 'Request Call Back'}
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                            </button>
                            {error && (
                                <p role="alert" className="max-w-[14rem] text-xs text-red-600">
                                    {error}
                                </p>
                            )}
                        </form>
                    )}

                    <button
                        onClick={() => setDismissed(true)}
                        tabIndex={tab}
                        aria-label="Close enquiry bar"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
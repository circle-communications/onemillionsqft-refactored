'use client';

import Link from 'next/link';
import { PATHS } from '@/lib/site';
import { ArrowRight, BadgeCheck, BellRing, Building2, CheckCircle2, KeyRound, Users } from 'lucide-react';

const BENEFITS = ['Free, quick listing', 'Reach verified buyers', 'Track every enquiry'];

const STEPS = [
    {
        icon: Building2,
        title: 'Post your property',
        desc: 'Add photos, price and details in a few minutes.',
    },
    {
        icon: Users,
        title: 'Connect with buyers',
        desc: 'Genuine enquiries come straight to you.',
    },
    {
        icon: KeyRound,
        title: 'Close the deal',
        desc: 'Schedule visits and finalise with confidence.',
    },
];

export function PostCta() {
    return (
        <section className="bg-amber-50 py-12 md:py-16">
            <style>{`
        @keyframes sellRise {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sellFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .sell-rise { animation: sellRise .7s ease both; }
        .sell-float { animation: sellFloat 4s ease-in-out infinite; }
      `}</style>

            <div className="container-x">
                <div className="sell-rise relative overflow-hidden rounded-3xl border border-brand-100 bg-white px-4 md:px-5 py-10 sm:px-10 md:py-12 lg:px-12 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)]">
                    {/* Background decoration */}
                    {/* <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-400/15 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_0)] [background-size:24px_24px]" /> */}

                    <div className="relative grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
                        {/* Left: copy + CTA */}
                        <div className="text-left lg:col-span-6 lg:text-left">
                            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-600">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                For Builders & Developers
                            </span>

                            <h2 className="font-serif text-2xl font-bold leading-tight text-neutral-900 md:text-3xl">
                                Have a {' '}
                                <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                                    property to sell?
                                </span>
                            </h2>

                            <p className="mx-auto mt-4 max-w-xl text-neutral-500 lg:mx-0 text-sm md:text-base">
                                List your property and connect with buyers faster. Get your listing in front of people who
                                are actively searching.
                            </p>

                            {/* <ul className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                                {BENEFITS.map((b) => (
                                    <li key={b} className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" />
                                        {b}
                                    </li>
                                ))}
                            </ul> */}

                            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                                <Link
                                    href={PATHS.postProperty}
                                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-500 sm:w-auto"
                                >
                                    Post your Property
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                                <Link
                                    href={PATHS.contact}
                                    className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-7 py-3.5 text-sm font-semibold text-neutral-900 transition-all duration-300 hover:border-brand-600 hover:text-brand-600 sm:w-auto"
                                >
                                    Talk to our team
                                </Link>
                            </div>
                        </div>

                        {/* Right: how it works */}
                        <div className="relative lg:col-span-6">
                            <div className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-5 shadow-xl shadow-brand-600/5 sm:p-7">
                                <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                                    How it works
                                </p>

                                <ol className="relative">
                                    {/* Connecting line */}
                                    <span className="absolute bottom-6 left-[19px] top-6 w-px bg-gradient-to-b from-brand-400/60 via-brand-400/20 to-transparent" />

                                    {STEPS.map(({ icon: Icon, title, desc }, i) => (
                                        <li key={title} className="relative flex items-start gap-4 pb-6 last:pb-0">
                                            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white ring-4 ring-white">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 pt-0.5">
                                                {/* <span className="mr-2 text-brand-600">{String(i + 1).padStart(2, '0')}</span> */}
                                                <h3 className="font-sans text-sm font-semibold text-neutral-900">
                                                    <span className="mr-2 text-brand-600">{String(i + 1).padStart(2, '0')} —</span>
                                                    {title}
                                                </h3>
                                                <p className="mt-1 text-sm leading-relaxed text-neutral-500">{desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Floating notification chip */}
                            <div className="sell-float hidden absolute -top-6 right-4 items-center gap-2.5 rounded-xl border border-neutral-100 bg-white px-4 py-2.5 shadow-xl shadow-neutral-900/10 sm:flex lg:-right-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                                    <BellRing className="h-4 w-4" />
                                </span>
                                <div className="leading-tight">
                                    <div className="text-xs font-bold text-neutral-900">New enquiry</div>
                                    <div className="text-[11px] text-neutral-500">A buyer is interested</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
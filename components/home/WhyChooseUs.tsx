import Link from 'next/link';
import {
    ArrowRight,
    ArrowUpRight,
    Award,
    BadgeCheck,
    FileCheck2,
    Headset,
    MapPin,
    ShieldCheck,
    TrendingUp,
} from 'lucide-react';
import { cityHref } from '@/lib/search/links';

const FEATURES = [
    {
        icon: ShieldCheck,
        title: 'RERA Verified',
        desc: 'Every listing is RERA registered and legally checked, so you can shortlist with confidence.',
        tag: '100% verified',
    },
    {
        icon: Award,
        title: 'Trusted Builders',
        desc: 'We partner only with reputed developers like Malles Constructions and Harmony Homes, known for quality and timely delivery.',
        tag: 'Curated partners',
    },
    // {
    //     icon: TrendingUp,
    //     title: 'Smart Investments',
    //     desc: 'Prime locations with strong appreciation potential and healthy rental yields.',
    //     tag: 'High growth areas',
    // },
    {
        icon: MapPin,
        title: 'Prime Locations',
        desc: 'Homes and plots in well-connected Chennai neighbourhoods with good infrastructure and amenities.',
        tag: 'Well connected',
    },
    {
        icon: FileCheck2,
        title: 'Transparent Process',
        desc: 'Clear pricing, approvals and documentation up front. No hidden surprises.',
        tag: 'No Brokerage',
    },
    {
        icon: Headset,
        title: 'Guided Support',
        desc: 'Our team helps from first enquiry to site visit and booking, so you are never navigating alone.',
        tag: 'End-to-end help',
    },
];

export function WhyChooseUs() {
    return (
        <section className="relative overflow-hidden bg-white py-20">
            <style>{`
        @keyframes whySlide {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes whyRise {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .why-slide { animation: whySlide .7s ease both; }
        .why-rise { animation: whyRise .7s ease both; }
      `}</style>

            {/* Background decoration */}
            {/* <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-400/10 blur-3xl" /> */}
            {/* <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-brand-400/10 blur-3xl" /> */}
            {/* <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_0)] [background-size:24px_24px]" /> */}

            <div className="container-x relative">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
                    {/* Left: sticky intro */}
                    <div className="why-rise lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
                        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-600">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Why OneMillionSqFt
                        </span>
                        <h2 className="mb-4 font-sans text-3xl font-bold leading-tight text-neutral-900 md:text-4xl">
                            Property finding,{' '}
                            <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                                made simple
                            </span>
                        </h2>
                        <p className="max-w-md text-neutral-500">
                            Verified listings, reputed builders and honest guidance, all in one place.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {['RERA', 'CMDA', 'Trusted Builders'].map((b) => (
                                <span
                                    key={b}
                                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-neutral-600 shadow-sm ring-1 ring-neutral-200"
                                >
                                    <ShieldCheck className="h-3 w-3 text-brand-600" />
                                    {b}
                                </span>
                            ))}
                        </div>

                        <Link
                            href={cityHref('chennai')}
                            className="group/cta mt-8 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-600"
                        >
                            Explore Properties
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                        </Link>
                    </div>

                    {/* Right: numbered rows */}
                    <ol className="lg:col-span-7">
                        {FEATURES.map(({ icon: Icon, title, desc, tag }, i) => (
                            <li
                                key={title}
                                className="why-slide border-t border-neutral-200 last:border-b"
                                style={{ animationDelay: `${i * 80}ms` }}
                            >
                                <div className="flex items-start gap-4 py-6 sm:gap-6">
                                    {/* <span className="w-8 shrink-0 pt-1 font-serif text-lg font-bold text-neutral-300">
                                        {String(i + 1).padStart(2, '0')}
                                    </span> */}

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <h3 className="font-sans text-md md:text-lg font-semibold text-neutral-900 tracking-wide">{title}</h3>
                                            <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                                {tag}
                                            </span>
                                        </div>
                                        <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{desc}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* CTA band */}
                <div className="why-rise relative mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-600 via-neutral-800 to-neutral-700 px-6 py-8 text-center md:px-12 md:py-10 md:text-left">
                    {/* <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/30 blur-3xl" /> */}
                    <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div>
                            <h3 className="font-serif text-xl font-bold text-white md:text-2xl">
                                Ready to find your dream property?
                            </h3>
                            <p className="mt-1 text-sm text-neutral-400">
                                Browse RERA-verified homes and plots from Chennai's trusted builders.
                            </p>
                        </div>
                        <Link
                            href={cityHref('chennai')}
                            className="group/cta inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition-all duration-300 hover:bg-brand-600 hover:text-white"
                        >
                            Explore Properties
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>

        </section>
    );
}
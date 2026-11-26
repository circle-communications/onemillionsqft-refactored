'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowDown, Check, Home, KeyRound, Building2, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';


/* ───────────────────────── Helpers ───────────────────────── */

const pad = (n: number) => String(n).padStart(2, '0');

const gridLines = (rgb: string, alpha: number) =>
    `linear-gradient(to right, rgba(${rgb},${alpha}) 1px, transparent 1px), linear-gradient(to bottom, rgba(${rgb},${alpha}) 1px, transparent 1px)`;

function useInView<T extends Element>(threshold = 0.2) {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    io.disconnect();
                }
            },
            { threshold },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [threshold]);

    return { ref, inView };
}

function Reveal({
    children,
    delay = 0,
    className = '',
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const { ref, inView } = useInView<HTMLDivElement>(0.15);
    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                } ${className}`}
        >
            {children}
        </div>
    );
}

/** Small square = one square foot */
function Eyebrow({
    children,
    center = false,
    className = 'text-neutral-500',
}: {
    children: React.ReactNode;
    center?: boolean;
    className?: string;
}) {
    return (
        <p className={`mb-4 flex items-center gap-2.5 text-sm font-medium ${center ? 'justify-center' : ''} ${className}`}>
            <span aria-hidden className="h-2 w-2 bg-brand-500" />
            {children}
        </p>
    );
}

/** Architectural dimension line: tick, line, tick */
function DimLine({ className = '' }: { className?: string }) {
    return (
        <span aria-hidden className={`flex items-center ${className}`}>
            <span className="h-2.5 w-px bg-current" />
            <span className="h-px flex-1 bg-current" />
            <span className="h-2.5 w-px bg-current" />
        </span>
    );
}

/* ───────────────────────── Data ───────────────────────── */

const PLOT_SQFT = 1_000_000;
const SIZE_PRESETS = [600, 1000, 1500, 3000];

const steps = [
    {
        title: 'Search by what matters',
        text: 'Filter by area, BHK, budget and status. Every result shows its price up front, so you never have to click around to find the number.',
        chips: ['Area', 'BHK', 'Budget'],
    },
    {
        title: 'Get the fine print early',
        text: 'Project details and RERA information sit on the listing itself, so the paperwork questions are answered before the first phone call.',
        chips: ['RERA details', 'Builder', 'Project info'],
    },
    {
        title: 'Talk to a person',
        text: 'Message or email straight from the property listing. Someone on the team answers, not a script.',
        chips: ['Message', 'Email'],
    },
    {
        title: 'Visit, decide, move in',
        text: 'Shortlist, visit, and take your time. Where a listing is brokerage-free, we say so on the listing.',
        chips: ['Shortlist', 'Site visit', 'Keys'],
    },
];

const wontFind = ['Hidden charges', 'Brokerage surprises', 'Half-filled listings', 'Calls that go nowhere'];

const willFind = [
    'Clear pricing on every listing',
    'RERA and project details, up front',
    'Zero-brokerage options, clearly marked',
    'Real people who reply',
];

const areas = [
    'Sholinganallur',
    'Abiramapuram',
    'Govindan Road',
    'Pallikaranai',
    'Medavakkam',
    'Nanmangalam',
    'T Nagar',
    'Egmore',
];

const doors = [
    {
        href: '/properties',
        icon: Home,
        title: 'I’m looking for a home',
        text: 'Search verified listings by area, BHK and budget.',
        cta: 'Explore properties',
    },
    {
        href: '/post-property',
        icon: KeyRound,
        title: 'I have a property',
        text: 'List it for free and reach people who are actually looking.',
        cta: 'Post property, free',
    },
    {
        href: '/post-property',
        icon: Building2,
        title: 'I’m building a project',
        text: 'Put your project in front of buyers, with the details they ask for.',
        cta: 'List your project',
    },
];

/* ───────────────────────── Sections ───────────────────────── */

function Hero() {
    return (
        <section className="relative overflow-hidden bg-white">
            <div
                aria-hidden
                className="absolute inset-0"
                style={{
                    backgroundImage: gridLines('0,0,0', 0.05),
                    backgroundSize: '56px 56px',
                    WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)',
                    maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)',
                }}
            />

            {/* Outlined numerals sitting on the floor of the hero */}
            {/* <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-[28%] select-none text-center font-serif text-[21vw] font-bold leading-none"
                style={{ color: 'transparent', WebkitTextStroke: '1.5px #e5e5e5' }}
            >
                1,000,000
            </div> */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-[25%] select-none text-center font-serif text-[13vw] font-bold leading-none"
                style={{ color: 'transparent', WebkitTextStroke: '1px oklch(57.7% 0.245 27.325)' }}
            >
                OneMillionSqFt
            </div>

            <div className="container-x relative px-4 pb-44 pt-24 sm:pt-32 lg:pb-64 lg:pt-40">
                <Reveal className="mx-auto max-w-4xl text-center">
                    <Eyebrow center>OneMillionSqFt</Eyebrow>
                    <h1 className="font-serif text-3xl font-semibold leading-[1.1] text-neutral-900 sm:text-5xl lg:text-6xl">
                        A million square feet is just a number until{' '}
                        <span className="text-brand-600">someone calls it home.</span>
                    </h1>
                    <p className="mx-auto mt-8 max-w-2xl text-md lg:text-lg leading-relaxed text-neutral-600">
                        We help people discover, buy properties with transparent pricing, verified information, and personalised support.
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
                        {/* <Link
                            href="/properties"
                            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                        >
                            Explore properties
                            <ArrowRight className="h-4 w-4" />
                        </Link> */}
                        <a
                            href="#walkthrough"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 transition-colors hover:text-brand-600 border border-neutral-600 px-7 py-3.5 rounded-full"
                        >
                            See how it works
                            <ArrowDown className="h-4 w-4" />
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/** Interactive: how many homes fit in one million sq ft? */
function MillionPlot() {
    const [size, setSize] = useState(1200);

    const homes = Math.floor(PLOT_SQFT / size);
    // A home of `size` sq ft is a square of side sqrt(size) ft; the plot is 1,000 ft wide.
    const cell = Math.sqrt(size) / 10;

    return (
        <section className="bg-neutral-950 py-20 text-white sm:py-28">
            <div className="container-x px-4">
                <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
                    <Reveal>
                        <Eyebrow className="text-neutral-400">The name</Eyebrow>
                        <h2 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                            How many homes fit in a million square feet?
                        </h2>
                        <p className="mt-5 max-w-md text-neutral-400">
                            Pick a home size and see the plot fill up. It’s where our name comes from, and a
                            reminder that every square foot is somebody’s.
                        </p>

                        <div className="mt-10">
                            <div className="flex items-baseline gap-3">
                                <span className="font-serif text-6xl font-semibold tabular-nums text-brand-400 sm:text-7xl">
                                    {homes.toLocaleString('en-IN')}
                                </span>
                                <span className="text-lg text-neutral-300">homes</span>
                            </div>
                            <p className="mt-1 text-neutral-400">
                                of <span className="tabular-nums text-white">{size.toLocaleString('en-IN')}</span> sq ft each
                            </p>

                            <label htmlFor="home-size" className="sr-only">
                                Home size in square feet
                            </label>
                            <input
                                id="home-size"
                                type="range"
                                min={400}
                                max={4000}
                                step={50}
                                value={size}
                                onChange={(e) => setSize(Number(e.target.value))}
                                className="mt-8 w-full accent-brand-500"
                            />
                            <div className="mt-2 flex justify-between text-xs tabular-nums text-neutral-500">
                                <span>400 sq ft</span>
                                <span>4,000 sq ft</span>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {SIZE_PRESETS.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setSize(p)}
                                        className={`rounded-full border px-4 py-1.5 text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${size === p
                                            ? 'border-brand-500 bg-brand-600 text-white'
                                            : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
                                            }`}
                                    >
                                        {p.toLocaleString('en-IN')} sq ft
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={150} className="mx-auto w-full max-w-md">
                        <div className="mb-3 flex items-center gap-3 text-xs text-neutral-500">
                            <DimLine className="flex-1" />
                            <span className="tabular-nums">1,000 ft</span>
                            <DimLine className="flex-1" />
                        </div>

                        <div
                            role="img"
                            aria-label={`A 1,000 by 1,000 foot plot divided into ${homes} homes of ${size} square feet`}
                            className="relative aspect-square w-full border border-white/40"
                            style={{
                                backgroundImage: gridLines('255,255,255', 0.22),
                                backgroundSize: `${cell}% ${cell}%`,
                            }}
                        >
                            <div
                                className="absolute left-0 top-0 bg-brand-500/70 transition-all duration-300 motion-reduce:transition-none"
                                style={{ width: `${cell}%`, height: `${cell}%` }}
                            />
                        </div>

                        <p className="mt-4 text-sm text-neutral-500">
                            The orange square is one home. Counted as a perfect grid, with no roads, parking or
                            lifts. Real life needs more room.
                        </p>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

function AboutUs() {
    return (
        <section className="relative overflow-hidden bg-neutral-950 py-20 text-white sm:py-28">
            {/* subtle grid */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: gridLines('255,255,255', 1),
                    backgroundSize: '48px 48px',
                }}
            />

            <div className="container-x relative px-4">
                <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
                    {/* Left — copy */}
                    <Reveal>
                        <Eyebrow className="text-neutral-400">About us</Eyebrow>
                        <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-4xl">
                            Built in Chennai,
                            {/* <br /> */}
                            <span className="text-brand-400"> for the way people live.</span>
                        </h2>
                        <div className="mt-6 max-w-full space-y-4 text-neutral-400 leading-relaxed">
                            <p>
                                OneMillionSqFt started with a simple frustration — finding a home
                                felt opaque. Prices were buried, listings were incomplete,
                                and every enquiry felt like a sales pitch.
                            </p>
                            <p>
                                So we built the platform we wished existed: clear pricing on every
                                listing, RERA and project details up front, and real people who reply
                                when you reach out.
                            </p>
                            <p>
                                Today we help buyers and builders across neighbourhoods — with the same promise we started with.
                            </p>
                        </div>

                        {/* <div className="mt-10 flex flex-wrap gap-8">
                            {[
                                { value: '5,000+', label: 'Listings' },
                                { value: '12+', label: 'Areas' },
                                { value: '3,200+', label: 'Families helped' },
                            ].map((s) => (
                                <div key={s.label}>
                                    <span className="block text-3xl font-semibold tabular-nums text-brand-400">
                                        {s.value}
                                    </span>
                                    <span className="mt-0.5 block text-sm text-neutral-500">
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div> */}
                    </Reveal>

                    {/* Right — visual card */}
                    <Reveal delay={150} className="mx-auto w-full max-w-md">
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 p-8 sm:p-10">
                            {/* corner ticks */}
                            <span aria-hidden className="absolute left-4 top-4 h-4 w-px bg-brand-500/60" />
                            <span aria-hidden className="absolute left-4 top-4 h-px w-4 bg-brand-500/60" />
                            <span aria-hidden className="absolute bottom-4 right-4 h-4 w-px bg-brand-500/60" />
                            <span aria-hidden className="absolute bottom-4 right-4 h-px w-4 bg-brand-500/60" />

                            <p className="font-serif text-2xl font-normal leading-snug tracking-tight sm:text-2xl">
                                “Every square foot is somebody’s home. We treat it that way.”
                            </p>
                            <div className="mt-8 border-t border-white/10 pt-6">
                                <p className="text-sm font-medium text-white">OneMillionSqFt</p>
                                <p className="mt-0.5 text-sm text-neutral-500">
                                    Find · Invest · Belong
                                </p>
                            </div>

                            <ul className="mt-8 space-y-3">
                                {[
                                    'Transparent pricing, always',
                                    'Verified listings & RERA details',
                                    'Zero-brokerage options marked clearly',
                                    'Real humans who answer',
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-center gap-3 text-sm text-neutral-300"
                                    >
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600/20 text-brand-400">
                                            <Check className="h-3 w-3" strokeWidth={2.5} />
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/** Sticky, scroll-driven walkthrough */
function Walkthrough() {
    const [active, setActive] = useState(0);
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
                });
            },
            { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
        );
        stepRefs.current.forEach((el) => el && io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <section id="walkthrough" className="scroll-mt-16 bg-white py-20 sm:py-28">
            <div className="container-x px-4">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                    <div className="lg:col-span-5 lg:self-start lg:sticky lg:top-28">
                        <Eyebrow>How it works</Eyebrow>
                        <h2 className="font-serif text-3xl font-semibold leading-tight text-neutral-900 sm:text-4xl lg:text-4xl">
                            From first search to keys in hand
                        </h2>

                        <div className="mt-10 hidden lg:block">
                            <div className="grid">
                                {steps.map((s, i) => (
                                    <span
                                        key={s.title}
                                        aria-hidden
                                        className={`col-start-1 row-start-1 text-[9rem] font-semibold leading-none text-red-600 transition-all duration-500 motion-reduce:transition-none ${i === active ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                            }`}
                                    >
                                        {pad(i + 1)}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-8 flex gap-2" aria-hidden>
                                {steps.map((s, i) => (
                                    <span
                                        key={s.title}
                                        className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= active ? 'bg-brand-600' : 'bg-neutral-200'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        {steps.map((s, i) => (
                            <div
                                key={s.title}
                                data-step={i}
                                ref={(el) => {
                                    stepRefs.current[i] = el;
                                }}
                                className="flex items-center border-t border-neutral-200 py-10 lg:min-h-[60vh] lg:py-0"
                            >
                                <div
                                    className={`transition-opacity duration-500 motion-reduce:transition-none ${i === active ? 'opacity-100' : 'lg:opacity-30'
                                        }`}
                                >
                                    <span className="text-sm font-medium tabular-nums text-brand-600 lg:hidden">{pad(i + 1)}</span>
                                    <h3 className="mt-1 font-serif text-3xl font-semibold text-neutral-900 lg:mt-0 lg:text-4xl">
                                        {s.title}
                                    </h3>
                                    <p className="mt-4 max-w-lg text-lg leading-relaxed text-neutral-600">{s.text}</p>
                                    <ul className="mt-6 flex flex-wrap gap-2">
                                        {s.chips.map((c) => (
                                            <li key={c} className="rounded-full border border-neutral-300 px-3.5 py-1 text-sm text-neutral-600">
                                                {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/** What you won't find here, struck through as it scrolls in */
function NoList() {
    const { ref, inView } = useInView<HTMLDivElement>(0.35);

    return (
        <section className="bg-brand-600 py-20 text-white sm:py-28">
            <div className="container-x px-4">
                <Reveal className="mx-auto max-w-2xl text-center">
                    <Eyebrow center className="text-white/80">
                        Our promise
                    </Eyebrow>
                    <h2 className="font-serif text-3xl font-semibold sm:text-4xl lg:text-4xl">
                        Some things stay off the listing
                    </h2>
                </Reveal>

                <div ref={ref} className="mx-auto mt-14 grid max-w-5xl gap-12 md:grid-cols-2">
                    <div>
                        <p className="mb-6 text-sm font-medium text-white/70">You won’t find</p>
                        <ul className="space-y-5">
                            {wontFind.map((t, i) => (
                                <li key={t}>
                                    <span
                                        style={{ '--d': `${i * 250}ms` } as React.CSSProperties}
                                        className={`relative inline-block font-serif text-3xl transition-colors duration-700 sm:text-4xl
                      after:absolute after:left-0 after:top-1/2 after:h-[3px] after:w-full after:origin-left after:bg-white
                      after:transition-transform after:duration-700 after:[transition-delay:var(--d)] motion-reduce:after:transition-none ${inView
                                                ? 'text-white/60 after:scale-x-100'
                                                : 'text-white after:scale-x-0'
                                            }`}
                                    >
                                        {t}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:border-l md:border-dashed md:border-white/40 md:pl-12">
                        <p className="mb-6 text-sm font-medium text-white/70">You will find</p>
                        <ul className="space-y-5">
                            {willFind.map((t) => (
                                <li key={t} className="flex items-start gap-3 text-lg">
                                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-brand-600">
                                        <Check className="h-4 w-4" />
                                    </span>
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

function AreaMarquee() {
    const list = (hidden: boolean) => (
        <ul aria-hidden={hidden} className="flex shrink-0 items-center gap-10 pr-10">
            {areas.map((a) => (
                <li key={a} className="flex items-center gap-10 font-serif text-2xl text-neutral-300 sm:text-3xl">
                    {a}
                    <span aria-hidden className="h-2 w-2 bg-brand-500" />
                </li>
            ))}
        </ul>
    );

    return (
        <section aria-label="Neighbourhoods we list in" className="overflow-hidden border-y border-neutral-800 bg-neutral-900 py-6">
            <div className="omsf-marquee flex w-max">
                {list(false)}
                {list(true)}
            </div>
        </section>
    );
}

function Door({ door }: { door: (typeof doors)[number] }) {
    const Icon = door.icon;
    return (
        <Link href={door.href} className="group block focus-visible:outline-none">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[300px]">
                <div
                    className="absolute inset-0 flex flex-col items-center rounded-t-full bg-neutral-900 px-8 pt-24 text-center text-white shadow-xl transition-colors duration-300 group-hover:bg-neutral-800 group-focus-visible:ring-2 group-focus-visible:ring-brand-600 group-focus-visible:ring-offset-4 motion-reduce:transition-none"
                >
                    <span aria-hidden className="pointer-events-none absolute inset-4 rounded-t-full border border-white/15" />
                    {/* <span aria-hidden className="absolute right-5 top-1/2 h-3 w-3 rounded-full bg-amber-300" /> */}
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                        <Icon className="h-5 w-5 text-brand-400" />
                    </span>
                    <h3 className="relative mt-4 font-serif text-2xl font-semibold leading-tight">{door.title}</h3>
                    <p className="relative mt-3 text-sm leading-relaxed text-neutral-400">{door.text}</p>
                </div>
            </div>

            <p className="mt-6 text-center text-sm font-semibold text-brand-600 group-hover:underline">{door.cta}</p>
        </Link>
    );
}

function Doors() {
    return (
        <section className="bg-neutral-50 py-20 sm:py-28">
            <div className="container-x px-4">
                <Reveal className="mx-auto max-w-2xl text-center">
                    <Eyebrow center>Come on in</Eyebrow>
                    <h2 className="font-serif text-3xl font-semibold text-neutral-900 sm:text-4xl lg:text-4xl">
                        Which door are you walking through?
                    </h2>
                </Reveal>

                <div className="mt-16 grid gap-14 md:grid-cols-3 md:gap-8">
                    {doors.map((d, i) => (
                        <Reveal key={d.title} delay={i * 120}>
                            <Door door={d} />
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Closing() {

    const router = useRouter();
    const navigate = (to: string) => router.push(to);

    return (
        // <section className="bg-white py-24 sm:py-32">
        //     <div className="container-x px-4">
        //         <Reveal className="mx-auto max-w-3xl text-center">
        //             <DimLine className="mx-auto mb-10 w-40 text-brand-600" />
        //             <h2 className="font-serif text-4xl font-semibold leading-tight text-neutral-900 sm:text-5xl lg:text-5xl">
        //                 Somewhere in Chennai, your square feet are waiting.
        //             </h2>
        //             <Link
        //                 href="/properties"
        //                 className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-colors hover:bg-brand-700"
        //             >
        //                 Start searching
        //                 <ArrowRight className="h-4 w-4" />
        //             </Link>
        //         </Reveal>
        //     </div>
        // </section>
        <section className="py-20 bg-brand-600">
            <div className="container-x text-center">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to Find Your Dream Home?
                </h2>
                <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                    Browse our extensive collection of verified properties or get in touch with our team for personalized assistance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/properties')}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-white text-brand-600 font-semibold hover:bg-neutral-100 transition-colors"
                    >
                        Browse Properties <ArrowRight className="h-5 w-5" />
                    </button>
                    <a
                        href="tel:+918925343397"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-brand-700 text-white font-semibold hover:bg-brand-800 transition-colors"
                    >
                        <Phone className="h-5 w-5" /> Talk to an Expert
                    </a>
                </div>
            </div>
        </section>
    );
}

/* ───────────────────────── Page ───────────────────────── */

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            <Hero />
            <AboutUs />
            {/* <MillionPlot /> */}
            <Walkthrough />
            <NoList />
            <AreaMarquee />
            <Doors />
            <Closing />

            <style>{`
        @keyframes omsf-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .omsf-marquee { animation: omsf-marquee 45s linear infinite; }
        .omsf-marquee:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .omsf-marquee { animation: none; } }
      `}</style>
        </main>
    );
}
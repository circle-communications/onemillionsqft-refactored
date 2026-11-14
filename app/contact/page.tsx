'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Honeypot } from '@/components/layout/Honeypot';
import { ArrowDown, ArrowRight, Check, Copy, Loader2, Mail, MapPin, Phone } from 'lucide-react';

/* ───────────────────────── Config: replace the TODOs ───────────────────────── */

const CONTACT = {
    phone: '+91 8925343397',
    phoneHref: 'tel:+918925343397',
    email: 'enquiries@onemillionsqft.com', // TODO
    addressLines: ['Chennai, Tamil Nadu'], // TODO
    hours: 'Add your working hours', // TODO
};

/** POST target for the form. Create this route, or point it at your CRM / form service. */
const CONTACT_ENDPOINT = '/api/contact';

/* ───────────────────────── Helpers ───────────────────────── */

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

// type IntentId = 'buy' | 'rent' | 'list' | 'partner';
type IntentId = 'flat' | 'villa' | 'plot' | 'commercial';

const intents: { id: IntentId; label: string }[] = [
    // { id: 'buy', label: 'buy a home' },
    // { id: 'rent', label: 'rent a home' },
    // { id: 'list', label: 'list a property' },
    // { id: 'partner', label: 'partner with you' },
    { id: 'flat', label: 'flat' },
    { id: 'villa', label: 'villa' },
    { id: 'plot', label: 'plot' },
    { id: 'commercial', label: 'commercial space' },
];

const afterSteps = [
    { title: 'We read it', text: 'Your note goes straight to our team.' },
    { title: 'We reply', text: 'By phone or email, whichever you gave us.' },
    { title: 'We match you', text: 'To the right listings, or the right person on our side.' },
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

            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-[25%] select-none text-center font-serif text-[13vw] font-bold leading-none"
                style={{ color: 'transparent', WebkitTextStroke: '1px oklch(57.7% 0.245 27.325)' }}
            >
                OneMillionSqFt
            </div>

            <div className="container-x relative px-4 pb-40 pt-24 sm:pt-32 lg:pb-56 lg:pt-36">
                <Reveal className="mx-auto max-w-4xl text-center">
                    <Eyebrow center>Contact Us</Eyebrow>
                    <h1 className="font-serif text-3xl font-semibold leading-[1.1] text-neutral-900 sm:text-5xl lg:text-6xl">
                        Tell us{' '}
                        <span className="italic text-brand-600">what home looks like to you.</span>
                    </h1>
                    <p className="mx-auto mt-8 max-w-3xl text-md leading-relaxed text-neutral-600 lg:text-lg">
                        Buying, renting, listing or building. Send us a note and someone at OneMillionSqFt
                        will read it and get back to you.
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
                        <a
                            href={CONTACT.phoneHref}
                            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                        >
                            <Phone className="h-4 w-4" />
                            {/* Call {CONTACT.phone} */}
                            Enquire Now
                        </a>
                        <a
                            href="#write"
                            className="inline-flex items-center gap-2 rounded-full border border-neutral-600 px-7 py-3.5 text-sm font-semibold text-neutral-700 transition-colors hover:text-brand-600"
                        >
                            Write to Us
                            <ArrowDown className="h-4 w-4" />
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

function CopyButton({ value, label }: { value: string; label: string }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard unavailable: ignore */
        }
    };

    return (
        <button
            type="button"
            onClick={copy}
            aria-label={`Copy ${label}`}
            className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-neutral-400 transition-colors hover:border-brand-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
            {copied ? <Check className="h-4 w-4 text-brand-400" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only" aria-live="polite">
                {copied ? 'Copied' : ''}
            </span>
        </button>
    );
}

function Channels() {
    const tiles = [
        {
            icon: Phone,
            label: 'Call us',
            value: CONTACT.phone,
            href: CONTACT.phoneHref,
            hint: 'Tap to call',
            copy: CONTACT.phone,
        },
        {
            icon: Mail,
            label: 'Email us',
            value: CONTACT.email,
            href: `mailto:${CONTACT.email}`,
            hint: 'Tap to write',
            copy: CONTACT.email,
        },
        {
            icon: MapPin,
            label: 'Visit us',
            value: CONTACT.addressLines.join(', '),
            href: undefined,
            hint: CONTACT.hours,
            copy: undefined,
        },
    ];

    return (
        <section className="relative overflow-hidden bg-neutral-950 py-20 text-white sm:py-28">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: gridLines('255,255,255', 1), backgroundSize: '48px 48px' }}
            />
            <div className="container-x relative px-4">
                <Reveal className="mx-auto max-w-2xl text-center">
                    <Eyebrow center className="text-neutral-400">
                        Reach us directly
                    </Eyebrow>
                    <h2 className="font-serif text-3xl font-semibold sm:text-4xl lg:text-4xl">
                        Pick whatever’s easiest
                    </h2>
                </Reveal>

                <Reveal delay={100} className="mt-14">
                    <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
                        {tiles.map((t) => (
                            <div
                                key={t.label}
                                className="group relative flex flex-col justify-between gap-10 bg-neutral-950 p-8 transition-colors duration-300 hover:bg-neutral-900 sm:p-10 motion-reduce:transition-none"
                            >
                                <div className="flex items-start justify-between">
                                    <span className="flex h-12 w-12 items-center justify-center bg-white/10">
                                        <t.icon className="h-5 w-5 text-brand-400" />
                                    </span>
                                    {t.copy && <CopyButton value={t.copy} label={t.label.toLowerCase()} />}
                                </div>

                                <div>
                                    <p className="text-sm text-neutral-500">{t.label}</p>
                                    {t.href ? (
                                        <a
                                            href={t.href}
                                            className="mt-2 block break-words text-xl font-semibold after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-brand-400"
                                        >
                                            {t.value}
                                        </a>
                                    ) : (
                                        <p className="mt-2 text-xl font-semibold">
                                            {CONTACT.addressLines.map((l) => (
                                                <span key={l} className="block">
                                                    {l}
                                                </span>
                                            ))}
                                        </p>
                                    )}
                                    {/* <p className="mt-3 flex items-center gap-2 text-sm text-neutral-400">
                                        {t.href && (
                                            <ArrowRight className="h-4 w-4 text-brand-400 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
                                        )}
                                        {t.hint}
                                    </p> */}
                                </div>
                            </div>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/* ── Fill-in-the-blanks form ── */

type FormState = {
    name: string;
    intent: IntentId;
    area: string;
    phone: string;
    email: string;
    message: string;
    /** honeypot: sent as `hp` */
    hp: string;
};

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'contact', string>>;

const emptyForm: FormState = { name: '', intent: 'flat', area: '', phone: '', email: '', message: '', hp: '' };

function validate(f: FormState): Errors {
    const e: Errors = {};
    const phone = f.phone.trim();
    const email = f.email.trim();
    if (!f.name.trim()) e.name = 'Tell us your name.';
    if (!phone && !email) e.contact = 'Add a phone number or an email so we can reach you.';
    if (phone && !/^[+()\d\s-]{10,16}$/.test(phone)) e.phone = 'That phone number doesn’t look right.';
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = 'That email doesn’t look right.';
    return e;
}

const blankBase =
    'inline-block max-w-full border-0 border-b-2 bg-transparent px-1 align-baseline font-serif text-brand-600 outline-none transition-colors placeholder:text-neutral-300 focus:border-brand-600 focus:ring-0';

function Blank({
    id,
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    autoComplete,
    invalid,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    type?: string;
    autoComplete?: string;
    invalid?: boolean;
}) {
    return (
        <span className="inline-block max-w-full align-baseline">
            <label htmlFor={id} className="sr-only">
                {label}
            </label>
            <input
                id={id}
                type={type}
                autoComplete={autoComplete}
                value={value}
                placeholder={placeholder}
                aria-invalid={invalid}
                onChange={(e) => onChange(e.target.value)}
                style={{ width: `${Math.max(value.length, placeholder.length, 6) + 1}ch` }}
                className={`${blankBase} ${invalid ? 'border-red-500' : 'border-neutral-300'}`}
            />
        </span>
    );
}

function WriteToUs() {
    const [form, setForm] = useState<FormState>(emptyForm);
    const [errors, setErrors] = useState<Errors>({});
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors({});
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length) return;

        setStatus('sending');
        try {
            const res = await fetch(CONTACT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    intent: form.intent,
                    area: form.area.trim(),
                    phone: form.phone.trim(),
                    email: form.email.trim(),
                    message: form.message.trim(),
                    hp: form.hp,
                }),
            });
            if (!res.ok) throw new Error('Request failed');
            setStatus('success');
        } catch {
            setStatus('error');
        }
    };

    const reset = () => {
        setForm(emptyForm);
        setErrors({});
        setStatus('idle');
    };

    const errorList = Object.values(errors).filter(Boolean) as string[];
    const firstName = form.name.trim().split(' ')[0];

    return (
        <section id="write" className="scroll-mt-16 bg-white py-20 sm:py-28">
            <div className="container-x px-4">
                <Reveal className="mx-auto max-w-4xl">
                    <Eyebrow>Write to us</Eyebrow>
                    <p className="mb-10 text-neutral-500">Fill in the blanks. That’s all it takes.</p>

                    {status === 'success' ? (
                        <div className="rounded-2xl bg-brand-600 p-10 text-center text-white sm:p-16">
                            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-600">
                                <Check className="h-7 w-7" />
                            </span>
                            <h2 className="mt-6 font-serif text-3xl font-semibold sm:text-4xl">
                                Thanks{firstName ? `, ${firstName}` : ''}.
                            </h2>
                            <p className="mx-auto mt-3 max-w-md text-white/80">
                                Your note is with our team. We’ll get back to you on{' '}
                                {form.phone.trim() && form.email.trim()
                                    ? 'the phone number or email you gave us'
                                    : form.phone.trim()
                                        ? form.phone.trim()
                                        : form.email.trim() || 'the details you gave us'}
                                .
                            </p>
                            <button
                                onClick={reset}
                                className="mt-8 text-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                Send another note
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} noValidate className="relative">
                            <Honeypot value={form.hp} onChange={(v) => set('hp', v)} />
                            <div className="font-serif text-2xl font-semibold leading-[2.1] text-neutral-900 sm:text-3xl lg:text-4xl lg:leading-[2.1]">
                                <p>
                                    Hi, I’m{' '}
                                    <Blank
                                        id="f-name"
                                        label="Your name"
                                        value={form.name}
                                        onChange={(v) => set('name', v)}
                                        placeholder="your name"
                                        autoComplete="name"
                                        invalid={!!errors.name}
                                    />{' '}
                                    and I’d like to buy a
                                </p>

                                <fieldset className="my-2">
                                    <legend className="sr-only">What would you like to do?</legend>
                                    <div className="flex flex-wrap gap-2.5">
                                        {intents.map((i) => (
                                            <label key={i.id} className="relative cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="intent"
                                                    value={i.id}
                                                    checked={form.intent === i.id}
                                                    onChange={() => set('intent', i.id)}
                                                    className="peer sr-only"
                                                />
                                                <span className="inline-block rounded-full border border-neutral-300 px-5 py-1.5 font-sans text-base font-medium leading-normal text-neutral-600 transition-colors hover:border-neutral-500 peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 peer-focus-visible:ring-offset-2 sm:text-lg">
                                                    {i.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>

                                <p>
                                    in{' '}
                                    <Blank
                                        id="f-area"
                                        label="Area or neighbourhood"
                                        value={form.area}
                                        onChange={(v) => set('area', v)}
                                        placeholder="area, e.g. Pallikaranai"
                                    />
                                    .
                                </p>

                                <p>
                                    You can reach me on{' '}
                                    <Blank
                                        id="f-phone"
                                        label="Phone number"
                                        type="tel"
                                        value={form.phone}
                                        onChange={(v) => set('phone', v)}
                                        placeholder="phone"
                                        autoComplete="tel"
                                        invalid={!!errors.phone || !!errors.contact}
                                    />{' '}
                                    or{' '}
                                    <Blank
                                        id="f-email"
                                        label="Email address"
                                        type="email"
                                        value={form.email}
                                        onChange={(v) => set('email', v)}
                                        placeholder="email"
                                        autoComplete="email"
                                        invalid={!!errors.email || !!errors.contact}
                                    />
                                    .
                                </p>
                            </div>

                            <div className="mt-8">
                                <label htmlFor="f-message" className="text-sm font-medium text-neutral-500">
                                    Anything else we should know?{' '}
                                    <span className="font-normal text-neutral-400">(optional)</span>
                                </label>
                                <textarea
                                    id="f-message"
                                    rows={3}
                                    value={form.message}
                                    onChange={(e) => set('message', e.target.value)}
                                    placeholder="Budget, BHK, timeline, questions…"
                                    className="mt-2 w-full resize-none border-0 border-b-2 border-neutral-300 bg-transparent px-0 py-3 text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-600 focus:ring-0"
                                />
                            </div>

                            {errorList.length > 0 && (
                                <ul role="alert" className="mt-6 space-y-1 text-sm text-red-600">
                                    {errorList.map((m) => (
                                        <li key={m}>{m}</li>
                                    ))}
                                </ul>
                            )}

                            {status === 'error' && (
                                <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                                    We couldn’t send your note. Please try again, or call us on{' '}
                                    <a href={CONTACT.phoneHref} className="font-semibold underline">
                                        {CONTACT.phone}
                                    </a>
                                    .
                                </p>
                            )}

                            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-neutral-500">
                                    We only use your details to reply to this note.
                                </p>
                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:opacity-60"
                                >
                                    {status === 'sending' ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Sending
                                        </>
                                    ) : (
                                        <>
                                            SEND REQUEST
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </Reveal>
            </div>
        </section>
    );
}

function AfterSend() {
    return (
        <section className="bg-neutral-50 py-20 sm:py-20">
            <div className="container-x px-4">
                <Reveal className="mx-auto max-w-2xl text-center">
                    <Eyebrow center>What happens next</Eyebrow>
                    <h2 className="font-serif text-3xl font-semibold text-neutral-900 sm:text-4xl lg:text-4xl">
                        After you hit send
                    </h2>
                </Reveal>

                <div className="mx-auto mt-14 grid max-w-5xl gap-12 md:grid-cols-3 md:gap-8">
                    {afterSteps.map((s, i) => (
                        <Reveal key={s.title} delay={i * 120}>
                            <div className="flex items-center gap-4 text-neutral-300">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-brand-600 text-xl font-semibold tabular-nums text-brand-600">
                                    {i + 1}
                                </span>
                                <DimLine className="flex-1" />
                            </div>
                            <h3 className="mt-6 font-serif text-2xl font-semibold text-neutral-900">{s.title}</h3>
                            <p className="mt-2 leading-relaxed text-neutral-600">{s.text}</p>
                        </Reveal>
                    ))}
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

function Closing() {
    return (
        <section className="bg-brand-600 py-20">
            <div className="container-x text-center">
                <h2 className="mb-4 font-serif text-3xl font-bold text-white md:text-4xl">
                    Rather look around first?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-white/80">
                    Browse verified properties across Chennai, or give us a call and talk it through.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Link
                        href="/properties"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3.5 font-semibold text-brand-600 transition-colors hover:bg-neutral-100"
                    >
                        Browse Properties <ArrowRight className="h-5 w-5" />
                    </Link>
                    <a
                        href={CONTACT.phoneHref}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-brand-800"
                    >
                        <Phone className="h-5 w-5" /> Talk to an Expert
                    </a>
                </div>
            </div>
        </section>
    );
}

/* ───────────────────────── Page ───────────────────────── */

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-white">
            <Hero />
            <Channels />
            <WriteToUs />
            <AfterSend />
            <AreaMarquee />
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
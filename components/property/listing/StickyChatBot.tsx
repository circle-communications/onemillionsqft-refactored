'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Building2, CalendarCheck, ChevronRight, KeyRound, MessageCircle, MessageSquare, Send, TrendingUp, X } from 'lucide-react';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '918925343397'; // digits only, with country code
const STORAGE_KEY = 'sticky-expert-chat-seen';
const AUTO_OPEN_MS = 6000;
const DEFAULT_MESSAGE = 'Hi, I need help finding a property on your website.';

const OPTIONS = [
    {
        id: 'buy',
        title: 'Buy a home',
        desc: 'Get a property that fits your needs',
        icon: Building2,
        message: 'Hi, I want to buy a property. Can you help me shortlist?',
    },
    // {
    //     id: 'rent',
    //     title: 'Rent a place',
    //     desc: 'Verified rentals, no broker hassle',
    //     icon: KeyRound,
    //     message: 'Hi, I am looking for a property to rent.',
    // },
    // {
    //     id: 'invest',
    //     title: 'Invest in real estate',
    //     desc: 'High-growth projects and returns',
    //     icon: TrendingUp,
    //     message: 'Hi, I want to invest in real estate. What are my options?',
    // },
    {
        id: 'visit',
        title: 'Book a site visit',
        desc: 'Pick a date, we handle the rest',
        icon: CalendarCheck,
        message: 'Hi, I would like to book a site visit.',
    },
] as const;

function openWhatsApp(message: string) {
    const text = `${message}\n\nPage: ${window.location.href}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

function Avatar({ className = '' }: { className?: string }) {
    return (
        <span
            className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-medium text-white ring-2 ring-white ${className}`}
        >
            1M
        </span>
    );
}

function TypingDots() {
    return (
        <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-md border border-neutral-200 bg-white px-3.5 py-3 shadow-sm">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
        </div>
    );
}

export function StickyChatBot() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0); // 0 typing, 1 greeting, 2 question, 3 options
    const [seen, setSeen] = useState(true); // true until we know the visitor hasn't seen it
    const [draft, setDraft] = useState('');
    const [time, setTime] = useState('');
    const interacted = useRef(false);

    const markSeen = () => {
        setSeen(true);
        try {
            sessionStorage.setItem(STORAGE_KEY, '1');
        } catch {
            /* storage unavailable: remember for this render only */
        }
    };

    // Auto-open once per session, unless the visitor already interacted.
    useEffect(() => {
        try {
            if (sessionStorage.getItem(STORAGE_KEY)) return;
        } catch {
            /* storage unavailable: fall through and show */
        }

        setSeen(false);
        const timer = setTimeout(() => {
            if (interacted.current) return;
            setOpen(true);
            markSeen();
        }, AUTO_OPEN_MS);
        return () => clearTimeout(timer);
    }, []);

    // Play the conversation each time the panel opens.
    useEffect(() => {
        if (!open) {
            setStep(0);
            return;
        }
        setTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
        const timers = [
            setTimeout(() => setStep(1), 1200),
            setTimeout(() => setStep(2), 2100),
            setTimeout(() => setStep(3), 2800),
        ];
        return () => timers.forEach(clearTimeout);
    }, [open]);

    const toggle = () => {
        interacted.current = true;
        setOpen((o) => !o);
        markSeen();
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        openWhatsApp(draft.trim() || DEFAULT_MESSAGE);
        setDraft('');
    };

    const reveal = (visible: boolean) =>
        visible ? 'max-h-24 translate-y-0 opacity-100' : 'max-h-0 translate-y-2 overflow-hidden opacity-0';

    return (
        <div className="pointer-events-none fixed bottom-5 right-5 z-40 hidden flex-col items-end gap-3 sm:bottom-6 sm:right-6 md:flex">
            {/* chat window */}
            <section
                aria-label="Chat with a property expert"
                aria-hidden={!open}
                className={`w-[calc(100vw-2.5rem)] max-w-[22rem] origin-bottom-right overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_24px_60px_-12px_rgba(15,23,42,0.35)] ring-1 ring-black/5 transition-all duration-300 ${open
                    ? 'pointer-events-auto visible scale-100 opacity-100'
                    : 'pointer-events-none invisible scale-95 opacity-0'
                    }`}
            >
                {/* header */}
                <header className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-600 to-brand-800 px-5 pb-5 pt-4 text-white">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-white/10 blur-2xl"
                    />

                    {/* <div className="relative flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <Avatar className="h-9 w-9" />
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-700 ring-2 ring-white">
                                    +2
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold leading-tight">Property Experts</p>
                                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] leading-tight text-white/85">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                                    </span>
                                    Online · replies in minutes
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={toggle}
                            tabIndex={open ? 0 : -1}
                            aria-label="Close chat"
                            className="-mr-1.5 -mt-1 rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div> */}

                    <div className="relative flex items-start justify-between">
                        {/* <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <Avatar className="h-9 w-9" />
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-700 ring-2 ring-white">
                                    +2
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold leading-tight">Property Experts</p>
                                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] leading-tight text-white/85">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                                    </span>
                                    Online · replies in minutes
                                </p>
                            </div>
                        </div> */}

                        <p className="relative mt-4 text-md font-semibold leading-snug">
                            Find your perfect property,
                            <br />
                            <span className="text-white/80">with expert guidance.</span>
                        </p>

                        <button
                            type="button"
                            onClick={toggle}
                            tabIndex={open ? 0 : -1}
                            aria-label="Close chat"
                            className="-mr-1.5 -mt-1 rounded-full p-1.5 text-white/80 transition-colors bg-white/15 hover:text-white"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>

                    {/* <p className="relative mt-4 text-lg font-semibold leading-snug">
                        Find your perfect property,
                        <br />
                        <span className="text-white/80">with expert guidance.</span>
                    </p> */}
                </header>

                {/* conversation */}
                <div className="flex max-h-[min(22rem,calc(100vh-18rem))] flex-col gap-2 overflow-y-auto bg-neutral-50/80 px-4 py-4">
                    <div className="mx-auto mb-1 rounded-full bg-neutral-200/70 px-2.5 py-0.5 text-[10px] font-medium text-neutral-500">
                        Today{time ? ` · ${time}` : ''}
                    </div>

                    <div className={`flex items-end gap-2 transition-all duration-300 ${reveal(step <= 1)}`}>
                        <Avatar className="h-6 w-6" />
                        <TypingDots />
                    </div>

                    <div className={`flex items-end gap-2 transition-all duration-300 ${reveal(step >= 1)}`}>
                        <Avatar className="h-6 w-6" />
                        <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-md border border-neutral-200 bg-white px-3.5 py-2.5 text-xs text-neutral-800 shadow-sm">
                            Hi there 👋 I&apos;m your property expert.
                        </p>
                    </div>

                    <div className={`flex items-end gap-2 transition-all duration-300 ${reveal(step >= 2)}`}>
                        <span className="h-6 w-6 shrink-0" aria-hidden="true" />
                        <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-md border border-neutral-200 bg-white px-3.5 py-2.5 text-xs text-neutral-800 shadow-sm">
                            What are you looking for today?
                        </p>
                    </div>

                    {/* quick actions */}
                    <div aria-hidden={step < 3} className="mt-1 flex flex-col gap-2">
                        {OPTIONS.map((opt, i) => {
                            const Icon = opt.icon;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    tabIndex={open && step >= 3 ? 0 : -1}
                                    onClick={() => openWhatsApp(opt.message)}
                                    style={{ transitionDelay: step >= 3 ? `${i * 70}ms` : '0ms' }}
                                    className={`group flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-2.5 text-left shadow-sm transition-all duration-300 hover:border-brand-600/40 hover:shadow-md ${step >= 3 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
                                        }`}
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                                        <Icon className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-[13px] font-semibold text-neutral-900">{opt.title}</span>
                                        <span className="block truncate text-xs text-neutral-500">{opt.desc}</span>
                                    </span>
                                    <ChevronRight
                                        className="h-4 w-4 shrink-0 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600"
                                        aria-hidden="true"
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* composer */}
                <footer className="border-t border-neutral-200 bg-white px-3 pb-2.5 pt-3">
                    <form onSubmit={onSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            tabIndex={open ? 0 : -1}
                            placeholder="Type your message…"
                            aria-label="Type your message"
                            className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                        />
                        <button
                            type="submit"
                            tabIndex={open ? 0 : -1}
                            aria-label="Send on WhatsApp"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                        >
                            <Send className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </form>
                    <p className="mt-2 text-center text-[10px] text-neutral-400">Continues on WhatsApp · Your number stays private</p>
                </footer>
            </section>

            {/* launcher */}
            <button
                type="button"
                onClick={toggle}
                aria-label={open ? 'Close chat' : 'Chat with a property expert'}
                aria-expanded={open}
                className="pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_10px_30px_-6px_rgba(15,23,42,0.5)] ring-4 ring-white/80 transition-all hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
                {!open && !seen && (
                    <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-brand-600/40" />
                )}
                <MessageSquare
                    className={`absolute h-6 w-6 transition-all duration-300 ${open ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
                    aria-hidden="true"
                />
                <X
                    className={`absolute h-6 w-6 transition-all duration-300 ${open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
                    aria-hidden="true"
                />
                {!open && !seen && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold">
                        1
                    </span>
                )}
            </button>
        </div>
    );
}
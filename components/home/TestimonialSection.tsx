'use client';

import { useEffect, useState } from 'react';
import { Quote, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const TESTIMONIALS = [
    {
        name: 'Rajesh Kumar',
        role: 'Software Engineer, Bengaluru',
        text: 'Found my dream 3BHK in Whitefield within a week. The filters and search made it incredibly easy to narrow down options.',
    },
    {
        name: 'Priya Venkatesh',
        role: 'Doctor, Chennai',
        text: 'Booked a 3BHK at Malles Ahaana in Pallikaranai through OneMillionSqFt. The RERA details and project information were spot on and the process was transparent.',
    },
    {
        name: 'Arun Reddy',
        role: 'Business Owner, Bengaluru',
        text: 'The best property portal for South India. I found a penthouse in Koramangala that matched all my requirements perfectly.',
    },
];

const DURATION = 7000;
const TICK = 50;

const mark = 'pointer-events-none absolute h-4 w-4 border-neutral-500';

const ctrlBtn =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-600 text-neutral-300 transition-colors hover:border-brand-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';

export function TestimonialSection() {
    const [active, setActive] = useState(0);
    const [progress, setProgress] = useState(0);
    const [userPaused, setUserPaused] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [reduced, setReduced] = useState(false);

    const total = TESTIMONIALS.length;
    const paused = userPaused || hovering || reduced;

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => setProgress((p) => p + (TICK / DURATION) * 100), TICK);
        return () => clearInterval(id);
    }, [paused]);

    useEffect(() => {
        if (progress >= 100) {
            setActive((a) => (a + 1) % total);
            setProgress(0);
        }
    }, [progress, total]);

    const select = (i: number) => {
        setActive((i + total) % total);
        setProgress(0);
    };

    const pad = (n: number) => String(n).padStart(2, '0');

    return (
        <section className="relative bg-neutral-900 py-20">

            {/* <img
                src="https://res.cloudinary.com/dib2kvojz/image/upload/v1795686297/san-lorenzo-beach-buildings-scape-gijon-asturias-spain-hand-drawn-black-white-vector_fafj0o.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-[full] object-cover opacity-40 brightness-0 invert"
            /> */}

            <div className="container-x">
                {/* <div className="mb-12 text-center">
                    <h2 className="mb-3 font-serif text-2xl font-bold text-white md:text-3xl">
                        What Our Clients Say
                    </h2>
                    <p className="text-neutral-400">Real stories from people who found their home.</p>
                </div> */}
                <div className="mb-12 text-center">
                    <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-600">
                        Testimonials
                    </span>
                    {/* <h2 className="font-serif text-2xl font-bold leading-tight text-white md:text-3xl">
                        What Our {' '}
                        <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                            Partners
                        </span>
                        {' '} Say
                    </h2> */}
                    <h2 className="mb-3 font-serif text-2xl font-bold text-white md:text-3xl">
                        What Our Partners Say
                    </h2>
                    <p className="mt-3 text-neutral-500">
                        Market trends, buying guides, and expert perspectives to help you make informed real estate
                        decisions.
                    </p>
                </div>

                <div
                    role="region"
                    aria-roledescription="carousel"
                    aria-label="Client testimonials"
                    className="relative mx-auto max-w-3xl rounded-2xl border border-neutral-700 bg-neutral-800/50 p-8 text-center md:p-8"
                    onMouseEnter={() => setHovering(true)}
                    onMouseLeave={() => setHovering(false)}
                    onFocus={() => setHovering(true)}
                    onBlur={() => setHovering(false)}
                >
                    <span className={`${mark} left-3 top-3 border-l-2 border-t-2`} />
                    <span className={`${mark} right-3 top-3 border-r-2 border-t-2`} />
                    <span className={`${mark} bottom-3 left-3 border-b-2 border-l-2`} />
                    <span className={`${mark} bottom-3 right-3 border-b-2 border-r-2`} />

                    <Quote className="mx-auto mb-6 h-9 w-9 text-brand-500" aria-hidden />

                    <div className="grid">
                        {TESTIMONIALS.map((t, i) => {
                            const isActive = i === active;
                            return (
                                <blockquote
                                    key={t.name}
                                    role="group"
                                    aria-roledescription="slide"
                                    aria-label={`${i + 1} of ${total}`}
                                    aria-hidden={!isActive}
                                    className={`col-start-1 row-start-1 flex flex-col items-center transition-all duration-500 motion-reduce:transition-none ${isActive
                                        ? 'translate-y-0 opacity-100'
                                        : 'pointer-events-none translate-y-3 opacity-0'
                                        }`}
                                >
                                    <p className="font-serif text-lg leading-snug text-white md:text-xl">{t.text}</p>

                                    <footer className="mt-8 flex flex-col items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 font-semibold text-white">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{t.name}</div>
                                            <div className="text-sm text-neutral-400">{t.role}</div>
                                        </div>
                                    </footer>
                                </blockquote>
                            );
                        })}
                    </div>

                    {/* Controls + dimension-line progress */}
                    <div className="mt-10 flex items-center justify-center gap-3 md:gap-4">
                        <button onClick={() => select(active - 1)} className={ctrlBtn} aria-label="Previous testimonial">
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <div className="flex flex-1 items-center" aria-hidden>
                            <span className="h-3 w-0.5 bg-neutral-500" />
                            <div className="h-0.5 flex-1 bg-neutral-700">
                                <div className="h-full bg-brand-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                            </div>
                            <span className="h-3 w-0.5 bg-neutral-500" />
                        </div>

                        <span className="text-sm tabular-nums text-neutral-400">
                            {pad(active + 1)} / {pad(total)}
                        </span>

                        <button onClick={() => select(active + 1)} className={ctrlBtn} aria-label="Next testimonial">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setUserPaused((p) => !p)}
                            className={ctrlBtn}
                            aria-label={userPaused ? 'Play testimonials' : 'Pause testimonials'}
                        >
                            {userPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
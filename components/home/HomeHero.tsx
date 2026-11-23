'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowDown, Play, ShieldCheck, X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Assets & content                                                    */
/* ------------------------------------------------------------------ */
const HERO_IMAGE = {
    desktop:
        'https://res.cloudinary.com/dib2kvojz/image/upload/v1793249864/1M_Building_2_wcxwio.jpg',
    mobile:
        'https://res.cloudinary.com/dib2kvojz/image/upload/v1793249862/1M_Building_1_vdgnek.jpg',
    alt: 'Aerial view of a premium residential tower surrounded by greenery',
    focalMobile: '60% 50%',
    focalDesktop: '70% 50%',
};

// Paste your Cloudinary aerial video URL. Leave '' to hide the play button.
const HERO_VIDEO_URL = '';

const HERO_STATS = [
    { value: '100%', label: 'Verified listings' },
    { value: '500+', label: 'Properties' },
    { value: '150+', label: 'Trusted builders' },
    { value: '2,000+', label: 'Happy owners' },
];

const TONE = '#EEF2F0';

const cld = (url: string, w: number) =>
    url.replace('/upload/', `/upload/f_auto,q_auto:good,c_limit,w_${w}/`);

const srcSet = (url: string, widths: number[]) =>
    widths.map((w) => `${cld(url, w)} ${w}w`).join(', ');

/* ------------------------------------------------------------------ */
export default function HomeHero({ postPropertyHref }: { postPropertyHref: string }) {
    const sectionRef = useRef<HTMLElement>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Scroll parallax only (hydration-safe)
    useEffect(() => {
        const el = sectionRef.current;
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let raf = 0;
        const update = () => {
            raf = 0;
            const p = Math.min(Math.max(-el.getBoundingClientRect().top / (el.offsetHeight || 1), 0), 1);
            el.style.setProperty('--p', p.toFixed(4));
        };

        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    const openVideo = () => {
        dialogRef.current?.showModal();
        videoRef.current?.play().catch(() => { });
    };

    const closeVideo = () => {
        videoRef.current?.pause();
        dialogRef.current?.close();
    };

    return (
        <section
            ref={sectionRef}
            aria-labelledby="hero-title"
            className="relative isolate overflow-hidden [--p:0]"
            style={{ backgroundColor: TONE }}
        >
            <style>{`
        @keyframes hero-settle {
          from { transform: scale(1.14); opacity: 0; }
          to   { transform: scale(1.04); opacity: 1; }
        }
        .hero-settle {
          animation: hero-settle 1.8s cubic-bezier(.2,.8,.2,1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-settle { animation: none; }
        }
      `}</style>

            {/* Full-bleed background */}
            <div className="absolute inset-0 -z-30">
                <div
                    className="absolute inset-0 will-change-transform"
                    style={{ transform: 'translate3d(0, calc(var(--p) * 60px), 0)' }}
                >
                    <picture>
                        <source
                            media="(min-width: 768px)"
                            srcSet={srcSet(HERO_IMAGE.desktop, [1280, 1920, 2560, 3200])}
                            sizes="100vw"
                        />
                        <img
                            src={cld(HERO_IMAGE.mobile, 900)}
                            srcSet={srcSet(HERO_IMAGE.mobile, [480, 750, 1080, 1440])}
                            sizes="100vw"
                            alt={HERO_IMAGE.alt}
                            width={1920}
                            height={1080}
                            fetchPriority="high"
                            decoding="async"
                            className="hero-settle h-full w-full object-cover contrast-[1.05] saturate-[1.05] [object-position:var(--focal-m)] lg:[object-position:var(--focal-d)]"
                            style={{
                                ['--focal-m' as string]: HERO_IMAGE.focalMobile,
                                ['--focal-d' as string]: HERO_IMAGE.focalDesktop,
                            }}
                        />
                    </picture>
                </div>
            </div>

            {/* Gradient wash – vertical on mobile, left-to-right on desktop */}
            <div
                aria-hidden
                className="absolute inset-0 -z-20 lg:hidden"
                style={{
                    background: `linear-gradient(180deg, ${TONE}F2 0%, ${TONE}E0 55%, ${TONE}33 100%)`,
                }}
            />
            <div
                aria-hidden
                className="absolute inset-0 -z-20 hidden lg:block"
                style={{
                    background: `linear-gradient(90deg, ${TONE} 0%, ${TONE}F0 28%, ${TONE}99 46%, ${TONE}00 72%)`,
                }}
            />

            {/* Blueprint grid pattern */}
            <svg
                aria-hidden
                className="absolute inset-0 -z-10 h-full w-full text-neutral-900 [mask-image:radial-gradient(120%_120%_at_0%_30%,#000_20%,transparent_70%)]"
            >
                <defs>
                    <pattern id="hero-grid" width="64" height="64" patternUnits="userSpaceOnUse">
                        <path d="M64 0H0V64" fill="none" stroke="currentColor" strokeOpacity=".08" strokeWidth="1" />
                        <path d="M-3 0H3M0 -3V3" stroke="currentColor" strokeOpacity=".28" strokeWidth="1" />
                    </pattern>
                    <pattern id="hero-grid-fine" width="16" height="16" patternUnits="userSpaceOnUse">
                        <path d="M16 0H0V16" fill="none" stroke="currentColor" strokeOpacity=".035" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-grid-fine)" />
                <rect width="100%" height="100%" fill="url(#hero-grid)" />
            </svg>

            {/* Content */}
            <div className="container-x relative grid min-h-[640px] items-center gap-10 pb-28 pt-12 md:pb-36 md:pt-16 lg:min-h-[720px] lg:grid-cols-12">
                {/* Left column – copy */}
                <div className="lg:col-span-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-neutral-900/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-sm backdrop-blur">
                        <ShieldCheck className="h-3.5 w-3.5 text-green-600" aria-hidden />
                        Explore. Discover. Own.
                    </div>

                    <h1
                        id="hero-title"
                        className="mt-6 font-serif text-[clamp(2rem,4.4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-neutral-900"
                    >
                        Your dream property awaits.
                    </h1>

                    <p className="mt-6 max-w-md text-base leading-relaxed text-neutral-700">
                        Explore verified apartments, independent villas, plots and commercial spaces from
                        builders you can trust.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <a
                            href="#search"
                            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                        >
                            Search properties
                            <ArrowDown className="h-4 w-4" aria-hidden />
                        </a>
                        <Link
                            href={postPropertyHref}
                            className="inline-flex items-center rounded-full border border-neutral-900/15 bg-white/80 px-6 py-3 text-sm font-medium text-neutral-900 backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                        >
                            Post a property for free
                        </Link>
                    </div>

                    {/* <dl className="mt-12 grid max-w-xl grid-cols-2 gap-y-6 border-t border-neutral-900/15 pt-6 sm:grid-cols-4">
                        {HERO_STATS.map((s, i) => (
                            <div
                                key={s.label}
                                className={`flex flex-col-reverse gap-1 ${i % 2 === 1 ? 'border-l border-neutral-900/15 pl-5' : ''
                                    } ${i > 0 ? 'sm:border-l sm:border-neutral-900/15 sm:pl-5' : 'sm:border-l-0'}`}
                            >
                                <dt className="text-xs leading-tight text-neutral-600">{s.label}</dt>
                                <dd className="font-serif text-2xl font-semibold tabular-nums text-neutral-900">
                                    {s.value}
                                </dd>
                            </div>
                        ))}
                    </dl> */}
                </div>

                {/* Right column – glass elements */}
                <div className="flex flex-col items-start gap-3 lg:col-span-6 lg:items-end lg:self-end">
                    {HERO_VIDEO_URL && (
                        <button
                            type="button"
                            onClick={openVideo}
                            className="group flex items-center gap-3 rounded-full border border-white/40 bg-white/55 p-1.5 pr-5 text-left text-neutral-900 shadow-lg backdrop-blur-xl transition-colors hover:bg-white/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                        >
                            <span className="grid h-11 w-11 place-items-center rounded-full bg-neutral-900 text-white transition-transform duration-300 group-hover:scale-105">
                                <Play className="h-4 w-4 translate-x-[1px] fill-current" aria-hidden />
                            </span>
                            <span className="text-sm font-medium leading-tight">Watch the aerial tour</span>
                        </button>
                    )}

                    <div className="max-w-[260px] rounded-2xl border border-white/40 bg-white/55 p-4 text-neutral-900 shadow-lg backdrop-blur-xl">
                        <p className="text-sm font-medium leading-snug">
                            Every listing is checked before it goes live.
                        </p>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-700">
                            <ShieldCheck className="h-3.5 w-3.5 text-green-600" aria-hidden />
                            Verified builders only
                        </p>
                    </div>
                </div>
            </div>

            {/* Video modal */}
            {HERO_VIDEO_URL && (
                <dialog
                    ref={dialogRef}
                    onClose={() => videoRef.current?.pause()}
                    onClick={(e) => e.target === dialogRef.current && closeVideo()}
                    className="m-auto w-[min(92vw,1100px)] overflow-hidden rounded-2xl bg-black p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
                    aria-label="Aerial property tour"
                >
                    <button
                        type="button"
                        onClick={closeVideo}
                        aria-label="Close video"
                        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <video
                        ref={videoRef}
                        src={HERO_VIDEO_URL}
                        controls
                        playsInline
                        preload="none"
                        className="aspect-video w-full"
                    />
                </dialog>
            )}
        </section>
    );
}
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Clock,
    Facebook,
    Link2,
    Linkedin,
    Twitter,
    Check,
} from 'lucide-react';

// ⚠️ Adjust this path to wherever your posts file lives
import { posts as allPosts, type BlogPost } from '@/data/posts';
import { LeadSubmitError, submitLead } from '@/lib/leads/client';
import { Honeypot } from '@/components/layout/Honeypot';

/* ------------------------------------------------------------------ */
/* Optional rich fields. Add any of these to a post in your data file  */
/* and they will override the auto-generated defaults below.           */
/* ------------------------------------------------------------------ */
type Block =
    | { type: 'p'; text: string }
    | { type: 'h2'; text: string }
    | { type: 'quote'; text: string; cite?: string }
    | { type: 'image'; src: string; caption: string }
    | { type: 'list'; items: string[] };

type RichPost = BlogPost & {
    author?: { name: string; role: string; avatar: string };
    tags?: string[];
    takeaways?: string[];
    body?: Block[];
};

const DEFAULT_AUTHOR = {
    name: 'Editorial Team',
    role: 'Real Estate Insights',
    avatar:
        'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=200',
};

const buildTakeaways = (p: RichPost): string[] => [
    `${p.category}: ${p.excerpt}`,
    'Verify approvals, title and RERA registration before paying any token amount.',
    'Compare quoted rates with recent registered transactions in the same micro-market.',
];

const buildBody = (p: RichPost, others: RichPost[]): Block[] => [
    { type: 'p', text: p.excerpt },
    {
        type: 'p',
        text: 'Buyer behaviour has shifted noticeably over the past few quarters. Households are comparing neighbourhoods more carefully, asking sharper questions about long-term value, and relying less on hearsay and more on verified data. For anyone entering the market, that is good news: the more informed the buyer, the fairer the deal.',
    },
    { type: 'h2', text: 'What is actually changing on the ground' },
    {
        type: 'p',
        text: 'Infrastructure upgrades, new transit corridors and the rise of mixed-use developments are quietly redrawing the map of desirable addresses. Areas that were overlooked a few years ago now sit within a short commute of major employment hubs, and prices are beginning to reflect it.',
    },
    ...(others[0]
        ? ([
            {
                type: 'image',
                src: others[0].image,
                caption:
                    'Well-planned communities continue to draw steady demand from end-users and investors alike.',
            },
        ] as Block[])
        : []),
    {
        type: 'quote',
        text: 'The best purchase is rarely the cheapest one. It is the one that still makes sense ten years from now.',
        cite: 'Our research desk',
    },
    { type: 'h2', text: 'A practical checklist before you commit' },
    {
        type: 'list',
        items: [
            'Verify title, approvals and RERA registration before paying any token amount.',
            'Visit the location at different times of day to judge traffic, noise and daylight.',
            'Compare the quoted rate with recent registered transactions nearby.',
            'Budget for registration, maintenance deposits and interiors, not just the sticker price.',
            'Ask for the builder’s delivery track record on earlier projects.',
        ],
    },
    {
        type: 'p',
        text: 'None of these steps are glamorous, but together they remove most of the risk from a purchase that will likely be the largest financial decision of your year. Take your time, document everything and never let urgency be manufactured for you.',
    },
    ...(others[1]
        ? ([
            {
                type: 'image',
                src: others[1].image,
                caption: 'Thoughtful design and quality of finish continue to hold resale value.',
            },
        ] as Block[])
        : []),
    { type: 'h2', text: 'The road ahead' },
    {
        type: 'p',
        text: 'Looking forward, expect demand to stay concentrated in well-connected, well-managed developments, while weaker projects face longer selling cycles. If you are unsure where to begin, speak with an advisor who can walk you through the numbers, not just the brochure.',
    },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function BlogDetailPage() {
    const params = useParams<{ slug: string | string[] }>();
    const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    const router = useRouter();
    const navigate = (to: string) => router.push(to);
    const [progress, setProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [subEmail, setSubEmail] = useState('');
    const [subTrap, setSubTrap] = useState('');
    const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [subError, setSubError] = useState('');

    const posts = allPosts as RichPost[];

    const raw = useMemo(() => posts.find((p) => p.slug === slug), [posts, slug]);
    const related = useMemo(() => posts.filter((p) => p.slug !== slug).slice(0, 3), [posts, slug]);

    const post = useMemo(() => {
        if (!raw) return undefined;
        return {
            ...raw,
            author: raw.author ?? DEFAULT_AUTHOR,
            tags: raw.tags ?? [raw.category, 'Real Estate', 'Chennai'],
            takeaways: raw.takeaways ?? buildTakeaways(raw),
            body: raw.body ?? buildBody(raw, related),
        };
    }, [raw, related]);

    useEffect(() => {
        window.scrollTo({ top: 0 });
        setShareUrl(window.location.href);
    }, [slug]);

    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement;
            const max = h.scrollHeight - h.clientHeight;
            setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* ignore */
        }
    };

    if (!post) {
        return (
            <section className="min-h-screen bg-[#f8f5f0] py-32">
                <div className="container-x text-center">
                    <h1 className="font-serif text-3xl font-bold text-black">Article not found</h1>
                    <p className="mt-3 font-serif text-neutral-600">The story you are looking for may have moved.</p>
                    <button
                        onClick={() => navigate('/blogs')}
                        className="mt-8 inline-flex items-center gap-2 border border-black bg-black px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-neutral-800"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to the archives
                    </button>
                </div>
            </section>
        );
    }

    let firstParagraphDone = false;

    const shareLinks = [
        {
            Icon: Facebook,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            label: 'Facebook',
        },
        {
            Icon: Twitter,
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`,
            label: 'Twitter',
        },
        {
            Icon: Linkedin,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            label: 'LinkedIn',
        },
    ];

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <article className="min-h-screen bg-[#f8f5f0] text-neutral-900">
            {/* Reading progress – thin black bar */}
            <div className="fixed left-0 top-0 z-50 h-[2px] w-full bg-transparent">
                <div
                    className="h-full bg-black transition-[width] duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* ===================== MASTHEAD ===================== */}
            <header className="border-b-4 border-black">
                <div className="border-b border-neutral-400 bg-[#f0ebe3] px-4 py-1.5 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-600">
                    Real Estate · Markets · Insights · Analysis
                </div>

                <div className="container-x py-6 md:py-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <button
                            onClick={() => navigate('/blogs')}
                            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-700 transition-colors hover:text-black"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                            Back to the archives
                        </button>

                        <div className="text-center">
                            <h1 className="font-serif text-3xl font-black tracking-tight text-black md:text-4xl">
                                ONEMILLIONSQFT
                            </h1>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-600">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{today}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ===================== ARTICLE HEADER ===================== */}
            <header className="border-b border-neutral-400">
                <div className="container-x py-10 md:py-14">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-5 flex flex-wrap items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest text-neutral-600">
                            <span className="bg-black px-2.5 py-0.5 text-white">{post.category}</span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {post.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {post.readTime} min read
                            </span>
                        </div>

                        <h1 className="font-serif text-2xl font-bold leading-tight tracking-tight text-black md:text-4xl">
                            {post.title}
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl font-serif text-md leading-relaxed text-neutral-700 md:text-xl">
                            {post.excerpt}
                        </p>

                        {/* Author line */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-neutral-300 pt-6">
                            <div className="flex items-center gap-3">
                                <img
                                    src={post.author.avatar}
                                    alt={post.author.name}
                                    className="h-10 w-10 border border-neutral-400 object-cover grayscale"
                                />
                                <div className="text-left">
                                    <p className="text-sm font-bold text-black">{post.author.name}</p>
                                    <p className="text-[11px] uppercase tracking-wider text-neutral-500">
                                        {post.author.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero image */}
                <div className="container-x pb-10 md:pb-14">
                    <div className="overflow-hidden border border-neutral-400">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="aspect-[16/9] w-full object-cover grayscale"
                        />
                    </div>
                </div>
            </header>

            {/* ===================== BODY ===================== */}
            <section className="py-12 md:py-16">
                <div className="container-x">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
                        {/* Share rail */}
                        <aside className="hidden lg:col-span-1 lg:block">
                            <div className="sticky top-28 flex flex-col items-center gap-3">
                                <span className="mb-2 rotate-180 text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-500 [writing-mode:vertical-rl]">
                                    Share
                                </span>
                                {shareLinks.map(({ Icon, href, label }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={`Share on ${label}`}
                                        className="flex h-9 w-9 items-center justify-center border border-neutral-400 bg-white text-neutral-700 transition-colors hover:border-black hover:bg-black hover:text-white"
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                    </a>
                                ))}
                                <button
                                    onClick={copyLink}
                                    aria-label="Copy link"
                                    className="flex h-9 w-9 items-center justify-center border border-neutral-400 bg-white text-neutral-700 transition-colors hover:border-black hover:bg-black hover:text-white"
                                >
                                    {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </aside>

                        {/* Article body */}
                        <div className="lg:col-span-7">
                            {/* Key takeaways */}
                            <aside className="mb-12 border border-neutral-400 bg-white p-6">
                                <div className="mb-4 border-b border-neutral-300 pb-2">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-black">
                                        Key takeaways
                                    </span>
                                </div>
                                <ul className="space-y-3">
                                    {post.takeaways.map((t) => (
                                        <li key={t} className="flex gap-3 font-serif text-[15px] leading-relaxed text-neutral-800">
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                                            <span>{t}</span>
                                        </li>
                                    ))}
                                </ul>
                            </aside>

                            {/* Content blocks */}
                            <div className="space-y-7">
                                {post.body.map((b, i) => {
                                    switch (b.type) {
                                        case 'p': {
                                            const isFirst = !firstParagraphDone;
                                            firstParagraphDone = true;
                                            return (
                                                <p
                                                    key={i}
                                                    className={
                                                        isFirst
                                                            ? 'font-serif text-[1.15rem] leading-[1.85] text-neutral-800 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-[4.5rem] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-black'
                                                            : 'font-serif text-[1.05rem] leading-[1.85] text-neutral-800'
                                                    }
                                                >
                                                    {b.text}
                                                </p>
                                            );
                                        }
                                        case 'h2':
                                            return (
                                                <h2
                                                    key={i}
                                                    className="border-b border-neutral-300 pb-3 pt-10 font-serif text-2xl font-bold leading-tight tracking-tight text-black md:text-3xl"
                                                >
                                                    {b.text}
                                                </h2>
                                            );
                                        case 'quote':
                                            return (
                                                <blockquote
                                                    key={i}
                                                    className="relative my-12 border-y-2 border-black py-10 text-center"
                                                >
                                                    <p className="mx-auto max-w-xl font-serif text-xl font-medium italic leading-snug text-black md:text-2xl">
                                                        “{b.text}”
                                                    </p>
                                                    {b.cite && (
                                                        <footer className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-neutral-600">
                                                            — {b.cite}
                                                        </footer>
                                                    )}
                                                </blockquote>
                                            );
                                        case 'image':
                                            return (
                                                <figure key={i} className="my-12">
                                                    <div className="overflow-hidden border border-neutral-400">
                                                        <img
                                                            src={b.src}
                                                            alt={b.caption}
                                                            className="aspect-[16/10] w-full object-cover grayscale"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    <figcaption className="mt-3 flex items-start gap-3 font-serif text-sm italic leading-relaxed text-neutral-600">
                                                        <span className="mt-2 h-px w-8 shrink-0 bg-neutral-400" />
                                                        {b.caption}
                                                    </figcaption>
                                                </figure>
                                            );
                                        case 'list':
                                            return (
                                                <ol
                                                    key={i}
                                                    className="my-10 space-y-4 border-y border-neutral-400 py-8"
                                                >
                                                    {b.items.map((it, n) => (
                                                        <li
                                                            key={it}
                                                            className="flex gap-5 font-serif text-[1.05rem] leading-relaxed text-neutral-800"
                                                        >
                                                            <span className="font-sans text-base font-bold tabular-nums text-black">
                                                                {String(n + 1).padStart(2, '0')}
                                                            </span>
                                                            <span>{it}</span>
                                                        </li>
                                                    ))}
                                                </ol>
                                            );
                                        default:
                                            return null;
                                    }
                                })}
                            </div>

                            {/* Tags */}
                            <div className="mt-14 flex flex-wrap items-center gap-2 border-t border-neutral-400 pt-8">
                                <span className="mr-2 text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
                                    Filed under
                                </span>
                                {post.tags.map((t) => (
                                    <span
                                        key={t}
                                        className="border border-neutral-400 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-700"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>

                            {/* Mobile share */}
                            <div className="mt-8 flex items-center gap-3 lg:hidden">
                                <span className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
                                    Share
                                </span>
                                {shareLinks.map(({ Icon, href, label }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={`Share on ${label}`}
                                        className="flex h-9 w-9 items-center justify-center border border-neutral-400 bg-white text-neutral-700"
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                    </a>
                                ))}
                                <button
                                    onClick={copyLink}
                                    className="flex h-9 w-9 items-center justify-center border border-neutral-400 bg-white text-neutral-700"
                                    aria-label="Copy link"
                                >
                                    {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                                </button>
                            </div>

                            {/* Author box */}
                            <div className="mt-14 border border-neutral-400 bg-white p-6 sm:p-8">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                                    <img
                                        src={post.author.avatar}
                                        alt={post.author.name}
                                        className="h-16 w-16 shrink-0 border border-neutral-400 object-cover grayscale"
                                    />
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500">
                                            Written by
                                        </span>
                                        <h3 className="mt-1 font-serif text-xl font-bold text-black">
                                            {post.author.name}
                                        </h3>
                                        <p className="text-sm text-neutral-600">{post.author.role}</p>
                                        <p className="mt-3 max-w-md font-serif text-[15px] leading-relaxed text-neutral-700">
                                            Helping buyers and investors make confident, well-informed property
                                            decisions through clear, data-led insight.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4">
                            <div className="space-y-10 lg:sticky lg:top-28">
                                {/* More stories */}
                                <div>
                                    <div className="mb-5 border-b-2 border-black pb-2">
                                        <h3 className="font-serif text-lg font-bold uppercase tracking-widest">
                                            Also in this edition
                                        </h3>
                                    </div>
                                    <div className="space-y-6">
                                        {related.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => navigate(`/blog/${p.slug}`)}
                                                className="group flex w-full gap-4 border-b border-neutral-300 pb-5 text-left last:border-0"
                                            >
                                                <div className="h-20 w-24 shrink-0 overflow-hidden border border-neutral-400">
                                                    <img
                                                        src={p.image}
                                                        alt={p.title}
                                                        className="h-full w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                                                        {p.category}
                                                    </span>
                                                    <h4 className="mt-1 font-serif text-[15px] font-bold leading-snug text-black transition-colors group-hover:underline">
                                                        {p.title}
                                                    </h4>
                                                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-neutral-500">
                                                        <span>{p.date}</span>
                                                        <span>·</span>
                                                        <span>{p.readTime} min</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Newsletter */}
                                <div className="border border-neutral-400 bg-white p-6">
                                    <div className="mb-4 border-b border-neutral-300 pb-2">
                                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-black">
                                            Newsletter
                                        </span>
                                    </div>
                                    <h3 className="font-serif text-xl font-bold leading-snug text-black">
                                        Property insight, delivered monthly.
                                    </h3>
                                    <p className="mt-2 font-serif text-sm leading-relaxed text-neutral-600">
                                        Market trends and buying guides, straight to your inbox.
                                    </p>
                                    <form
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            setSubStatus('loading');
                                            try {
                                                // await submitLead('newsletter', { email: subEmail.trim(), hp: subTrap });
                                                await submitLead('newsletter', { email: subEmail.trim() });
                                                setSubStatus('done');
                                                setSubEmail('');
                                            } catch (err) {
                                                setSubError(err instanceof LeadSubmitError ? err.message : 'Something went wrong. Please try again.');
                                                setSubStatus('error');
                                            }
                                        }}
                                        className="relative mt-5 space-y-3"
                                    >
                                        <Honeypot value={subTrap} onChange={setSubTrap} />
                                        <input
                                            type="email"
                                            required
                                            value={subEmail}
                                            onChange={(e) => {
                                                setSubEmail(e.target.value);
                                                if (subStatus !== 'idle') setSubStatus('idle');
                                            }}
                                            placeholder="Your email address"
                                            className="w-full border border-neutral-400 bg-[#f8f5f0] px-4 py-2.5 text-sm font-serif text-black placeholder:text-neutral-500 focus:border-black focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={subStatus === 'loading'}
                                            className="inline-flex w-full items-center justify-center gap-2 border border-black bg-black px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
                                        >
                                            {subStatus === 'loading' ? 'Subscribing…' : 'Subscribe'} <ArrowRight className="h-4 w-4" />
                                        </button>
                                        {subStatus === 'done' && (
                                            <p role="status" className="text-sm font-serif text-green-700">Thanks! You are subscribed.</p>
                                        )}
                                        {subStatus === 'error' && (
                                            <p role="alert" className="text-sm font-serif text-red-700">{subError}</p>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* ===================== KEEP READING ===================== */}
            <section className="border-t-4 border-black bg-[#f0ebe3] py-14 md:py-20">
                <div className="container-x">
                    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-neutral-600">
                                Keep reading
                            </span>
                            <h2 className="font-serif text-3xl font-bold leading-tight text-black md:text-4xl">
                                You might also like
                            </h2>
                        </div>
                        <button
                            onClick={() => navigate('/blogs')}
                            className="group inline-flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-wider text-black transition-colors hover:underline"
                        >
                            View all articles
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {related.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => navigate(`/blog/${p.slug}`)}
                                className="group text-left"
                            >
                                <div className="overflow-hidden border border-neutral-400">
                                    <img
                                        src={p.image}
                                        alt={p.title}
                                        className="aspect-[4/3] w-full object-cover grayscale transition duration-700 group-hover:grayscale-0"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="mt-4 border-b border-neutral-400 pb-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                                        {p.category}
                                    </span>
                                    <h3 className="mt-1.5 font-serif text-lg font-bold leading-snug text-black transition-colors group-hover:underline">
                                        {p.title}
                                    </h3>
                                    <div className="mt-2 flex items-center gap-3 text-[11px] text-neutral-500">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" />
                                            {p.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {p.readTime} min
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer rule */}
            {/* <footer className="border-t border-neutral-400 py-6 text-center">
                <p className="font-serif text-sm text-neutral-600">
                    © {new Date().getFullYear()} The OneMillionSqFt · All rights reserved
                </p>
            </footer> */}
        </article>
    );
}
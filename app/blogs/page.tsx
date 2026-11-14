'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Calendar, Clock, Search } from 'lucide-react';

// ⚠️ Adjust this path to wherever your posts file lives
import { posts } from '@/data/posts';

export default function BlogIndexPage() {
    const router = useRouter();
    const navigate = (to: string) => router.push(to);

    const [category, setCategory] = useState('All');
    const [query, setQuery] = useState('');

    const categories = useMemo(() => ['All', ...Array.from(new Set(posts.map((p) => p.category)))], []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return posts.filter((p) => {
            const matchCat = category === 'All' || p.category === category;
            const matchQuery =
                !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
            return matchCat && matchQuery;
        });
    }, [category, query]);

    const showFeatured = category === 'All' && !query.trim();
    const featured = showFeatured ? filtered[0] : undefined;
    const rest = showFeatured ? filtered.slice(1) : filtered;
    const sideList = featured ? rest.slice(0, 3) : [];
    const grid = featured ? rest.slice(3) : rest;

    // Simple date for the masthead
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <main className="min-h-screen bg-[#f8f5f0] text-neutral-900">
            {/* ===================== MASTHEAD ===================== */}
            <header className="border-b-4 border-black">
                {/* Top thin bar */}
                <div className="border-b border-neutral-400 bg-[#f0ebe3] px-4 py-1.5 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-600">
                    Real Estate · Markets · Insights · Analysis
                </div>

                <div className="container-x py-8 md:py-10">
                    {/* Newspaper name */}
                    <div className="text-center">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.35em] text-neutral-600">
                            Est. 2026
                        </p>
                        <h1 className="font-serif text-3xl font-black tracking-tight text-black md:text-6xl">
                            ONEMILLIONSQFT
                        </h1>
                        <p className="mt-2 font-serif text-sm italic text-neutral-700 md:text-xl">
                            News & Articles on Properties, Markets & Living
                        </p>
                    </div>

                    {/* Date + Search row */}
                    <div className="mt-8 flex flex-col items-center justify-between gap-4 border-y border-neutral-400 py-3 md:flex-row">
                        <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-wider">
                            <Calendar className="h-4 w-4" />
                            <span>{today}</span>
                        </div>

                        <div className="relative w-full max-w-sm">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for articles..."
                                className="w-full border border-neutral-400 bg-white py-2 pl-10 pr-4 text-sm font-serif text-neutral-900 placeholder:text-neutral-500 focus:border-black focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Category navigation */}
                    <nav className="mt-5 flex flex-wrap justify-center gap-x-1 gap-y-2">
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={`px-3 py-1 text-xs font-bold uppercase tracking-widest transition-colors ${category === c
                                    ? 'bg-black text-white'
                                    : 'text-neutral-700 hover:bg-neutral-200 hover:text-black'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* ===================== CONTENT ===================== */}
            <section className="py-10 md:py-14">
                <div className="container-x">
                    {filtered.length === 0 && (
                        <div className="border border-neutral-400 bg-white py-16 text-center">
                            <h2 className="font-serif text-3xl font-bold">No Articles Found</h2>
                            <p className="mt-2 font-serif text-neutral-600">Try a different keyword or section.</p>
                            <button
                                onClick={() => {
                                    setCategory('All');
                                    setQuery('');
                                }}
                                className="mt-6 border border-black bg-black px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-neutral-800"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}

                    {/* ===== Featured Story + Side Column ===== */}
                    {featured && (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
                            {/* Main Story */}
                            <article className="lg:col-span-8">
                                <button
                                    onClick={() => navigate(`/blog/${featured.slug}`)}
                                    className="group block w-full text-left"
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden border border-neutral-400">
                                        <img
                                            src={featured.image}
                                            alt={featured.title}
                                            className="h-full w-full object-cover grayscale transition duration-700 group-hover:grayscale-0"
                                        />
                                    </div>

                                    <div className="mt-5 border-b border-neutral-300 pb-5">
                                        <div className="mb-2 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-neutral-600">
                                            <span className="bg-black px-2 py-0.5 text-white">{featured.category}</span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {featured.date}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                {featured.readTime} min
                                            </span>
                                        </div>

                                        <h2 className="font-serif text-xl font-bold leading-tight tracking-tight text-black transition-colors group-hover:underline md:text-4xl">
                                            {featured.title}
                                        </h2>

                                        <p className="mt-4 max-w-3xl font-serif text-lg leading-relaxed text-neutral-700">
                                            {featured.excerpt}
                                        </p>

                                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black">
                                            Continue Reading
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </div>
                                </button>
                            </article>

                            {/* Side Column – Secondary Stories */}
                            <aside className="flex flex-col gap-6 lg:col-span-4">
                                <div className="border-b-2 border-black pb-2">
                                    <h3 className="font-serif text-lg font-bold uppercase tracking-widest">
                                        Also in this edition
                                    </h3>
                                </div>

                                {sideList.map((post, idx) => (
                                    <button
                                        key={post.id}
                                        onClick={() => navigate(`/blog/${post.slug}`)}
                                        className="group flex gap-4 border-b border-neutral-300 pb-5 text-left last:border-0"
                                    >
                                        <div className="relative h-20 w-24 shrink-0 overflow-hidden border border-neutral-400">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="h-full w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                                                {post.category}
                                            </span>
                                            <h4 className="mt-1 font-serif text-[15px] font-bold leading-snug text-black transition-colors group-hover:underline">
                                                {post.title}
                                            </h4>
                                            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-neutral-500">
                                                <span>{post.date}</span>
                                                <span>·</span>
                                                <span>{post.readTime} min</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </aside>
                        </div>
                    )}

                    {/* ===== Remaining Grid ===== */}
                    {grid.length > 0 && (
                        <>
                            {featured && (
                                <div className="mb-8 mt-14 flex items-center gap-4">
                                    <div className="h-px flex-1 bg-neutral-400" />
                                    <span className="font-serif text-sm font-bold uppercase tracking-[0.25em] text-neutral-700">
                                        More from the archive
                                    </span>
                                    <div className="h-px flex-1 bg-neutral-400" />
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                                {grid.map((post) => (
                                    <button
                                        key={post.id}
                                        onClick={() => navigate(`/blog/${post.slug}`)}
                                        className="group flex flex-col text-left"
                                    >
                                        <div className="relative aspect-[16/10] overflow-hidden border border-neutral-400">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="h-full w-full object-cover grayscale transition duration-700 group-hover:grayscale-0"
                                                loading="lazy"
                                            />
                                        </div>

                                        <div className="mt-4 flex flex-1 flex-col border-b border-neutral-300 pb-5">
                                            <div className="mb-2 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                                                <span>{post.category}</span>
                                                <span>·</span>
                                                <span>{post.date}</span>
                                            </div>

                                            <h3 className="font-serif text-xl font-bold leading-snug text-black transition-colors group-hover:underline">
                                                {post.title}
                                            </h3>

                                            <p className="mt-2 line-clamp-3 font-serif text-sm leading-relaxed text-neutral-600">
                                                {post.excerpt}
                                            </p>

                                            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black">
                                                Read story
                                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Simple footer rule */}
            {/* <footer className="border-t-4 border-black py-6 text-center">
                <p className="font-serif text-sm text-neutral-600">
                    © {new Date().getFullYear()} The OneMillionSqFt · All rights reserved
                </p>
            </footer> */}
        </main>
    );
}
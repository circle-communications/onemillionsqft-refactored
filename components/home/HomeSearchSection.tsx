'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Building2, Home, LandPlot, Store, TrendingUp, BadgeCheck, HandCoins, Users } from 'lucide-react';

type Keyword = { label: string; href: string };

const TABS = [
    { id: 'buy', label: 'Buy', Icon: Home },
    { id: 'rent', label: 'Rent', Icon: Building2 },
    { id: 'plots', label: 'Plots', Icon: LandPlot },
    { id: 'commercial', label: 'Commercial', Icon: Store },
] as const;
export type SearchTab = (typeof TABS)[number]['id'];

const TRUST = [
    { Icon: BadgeCheck, text: 'Verified listings' },
    { Icon: Users, text: 'Trusted builders' },
    { Icon: HandCoins, text: 'Free to post' },
];

export default function HomeSearchSection({
    keywords,
    children,
    onTabChange,
}: {
    keywords: readonly Keyword[];
    children: ReactNode; // pass <SearchBar /> here
    onTabChange?: (tab: SearchTab) => void; // wire this to SearchBar's listing type
}) {
    const [tab, setTab] = useState<SearchTab>('buy');

    const select = (id: SearchTab) => {
        setTab(id);
        onTabChange?.(id);
    };

    // Roving arrow-key navigation for the tablist
    const onKeyDown = (e: React.KeyboardEvent) => {
        const i = TABS.findIndex((t) => t.id === tab);
        if (e.key === 'ArrowRight') select(TABS[(i + 1) % TABS.length].id);
        if (e.key === 'ArrowLeft') select(TABS[(i - 1 + TABS.length) % TABS.length].id);
    };

    return (
        <section
            id="search"
            aria-labelledby="search-title"
            className="container-x relative z-30 -mt-10 pb-10 sm:-mt-14 md:-mt-20 md:pb-16"
        >
            <div className="rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,.35)] sm:p-6 md:p-8">
                <div className="mb-5 flex flex-col gap-4 md:mb-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 id="search-title" className="font-serif text-xl font-semibold text-neutral-900 sm:text-2xl">
                            Find the best place
                        </h2>
                        <p className="mt-1 max-w-sm text-sm text-neutral-500">
                            Search by type, budget and location.
                        </p>
                    </div>

                    {/* Segmented intent control */}
                    <div
                        role="tablist"
                        aria-label="Property intent"
                        onKeyDown={onKeyDown}
                        className="inline-flex w-full gap-1 rounded-full bg-neutral-100 p-1 md:w-auto"
                    >
                        {TABS.map(({ id, label, Icon }) => {
                            const active = tab === id;
                            return (
                                <button
                                    key={id}
                                    role="tab"
                                    type="button"
                                    aria-selected={active}
                                    tabIndex={active ? 0 : -1}
                                    onClick={() => select(id)}
                                    className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900 md:flex-none ${active ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" aria-hidden />
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div role="tabpanel" aria-label={`${tab} search`}>{children}</div>

                <div className="mt-5 flex flex-col gap-4 border-t border-neutral-100 pt-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-1 inline-flex items-center text-xs font-medium text-neutral-500">
                            <TrendingUp className="mr-1.5 h-4 w-4 text-green-600" aria-hidden />
                            Popular keywords
                        </span>
                        {keywords.map(({ label, href }) => (
                            <Link
                                key={label}
                                href={href}
                                className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-neutral-500">
                        {TRUST.map(({ Icon, text }) => (
                            <li key={text} className="inline-flex items-center gap-1.5">
                                <Icon className="h-3.5 w-3.5 text-green-600" aria-hidden />
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function PropertySmallCardSlider({ label, children }: { label: string; children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);

    const scroll = (dir: 1 | -1) => {
        const el = ref.current;
        if (!el) return;
        el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
                    </span>
                    {label}
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => scroll(-1)}
                        aria-label="Scroll left"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-brand-600 text-white shadow-sm transition-all hover:border-brand-500 hover:bg-brand-500 hover:text-white"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => scroll(1)}
                        aria-label="Scroll right"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-brand-600 text-white shadow-sm transition-all hover:border-brand-500 hover:bg-brand-500 hover:text-white"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="relative">
                <div
                    ref={ref}
                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {children}
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-amber-50 to-transparent" />
            </div>
        </div>
    );
}
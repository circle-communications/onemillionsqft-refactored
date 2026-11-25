'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, X } from 'lucide-react';

export interface PropertyAd {
    id: string;
    title: string;
    image: string;
    location: string;
    price: string; // pre-formatted, e.g. "₹85 L onwards"
    meta?: string; // e.g. "2 & 3 BHK · Ready to move"
    href: string;
}

const STORAGE_KEY = 'sticky-property-ad-dismissed';
const SHOW_DELAY_MS = 2000; // 2 seconds

export function StickyPropertyAd({ ad }: { ad: PropertyAd }) {
    // Start hidden so a previously dismissed ad never flashes on load.
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            if (sessionStorage.getItem(STORAGE_KEY) === ad.id) return; // already dismissed
        } catch {
            /* storage unavailable: fall through and show */
        }

        const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
        return () => clearTimeout(timer);
    }, [ad.id]);

    if (!visible) return null;

    const dismiss = () => {
        setVisible(false);
        try {
            sessionStorage.setItem(STORAGE_KEY, ad.id);
        } catch {
            /* storage unavailable: dismiss for this render only */
        }
    };

    return (
        <aside
            aria-label="Sponsored property"
            className="fixed left-0 top-1/2 z-40 hidden w-56 -translate-y-1/2 overflow-hidden rounded-2xl rounded-l-none border border-white/50 bg-white p-1 shadow-[0_8px_32px_rgba(31,38,135,0.25),inset_0_1px_0_rgba(255,255,255,0.6)] supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150 xl:block"
        >
            {/* soft light sheen across the glass */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 via-white/10 to-transparent"
            />

            <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss ad"
                className="absolute right-2 top-2 z-20 rounded-full border border-white/30 bg-black/30 p-1 text-white backdrop-blur-md transition-colors hover:bg-black/50"
            >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <Link href={ad.href} className="relative z-10 block">
                <div className="relative h-32 w-full overflow-hidden rounded-xl bg-neutral-200">
                    <Image src={ad.image} alt={ad.title} fill sizes="224px" className="object-cover" unoptimized />
                    <span className="absolute left-2 top-2 rounded-md border border-white/40 bg-white/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-800 backdrop-blur-md">
                        Sponsored
                    </span>
                </div>

                <div className="flex flex-col gap-3 px-1 pb-1 pt-3">
                    {/* <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1 text-xs text-neutral-700">
                            <p className="line-clamp-1 font-sans text-sm font-semibold text-neutral-900">{ad.title}</p>
                            <p className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                                <span className="line-clamp-1">{ad.location}</span>
                            </p>
                            {ad.meta && <p>{ad.meta}</p>}
                        </div>

                        <p className="text-sm font-bold text-brand-700">{ad.price}</p>
                    </div> */}

                    <span className="block rounded-lg border border-white/30 bg-brand-600 py-2 text-center text-xs font-semibold text-white shadow-md transition-colors hover:bg-brand-700">
                        View Details
                    </span>
                </div>
            </Link>
        </aside>
    );
}
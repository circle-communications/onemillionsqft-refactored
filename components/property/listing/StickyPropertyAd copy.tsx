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

export function StickyPropertyAd({ ad }: { ad: PropertyAd }) {
    // Start hidden so a previously dismissed ad never flashes on load.
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            if (sessionStorage.getItem(STORAGE_KEY) !== ad.id) setVisible(true);
        } catch {
            setVisible(true);
        }
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
            className="fixed right-4 top-1/2 z-40 hidden w-56 -translate-y-1/2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl xl:block"
        >
            <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss ad"
                className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
            >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <Link href={ad.href} className="block">
                <div className="relative h-32 w-full bg-neutral-100">
                    <Image src={ad.image} alt={ad.title} fill sizes="224px" className="object-cover" unoptimized />
                    <span className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
                        Sponsored
                    </span>
                </div>

                <div className="p-3">
                    <p className="line-clamp-1 font-sans text-sm font-semibold text-neutral-900">{ad.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                        <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span className="line-clamp-1">{ad.location}</span>
                    </p>
                    {ad.meta && <p className="mt-1 text-xs text-neutral-500">{ad.meta}</p>}
                    <p className="mt-2 text-sm font-bold text-brand-600">{ad.price}</p>
                    <span className="mt-3 block rounded-lg bg-brand-600 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-brand-700">
                        View Details
                    </span>
                </div>
            </Link>
        </aside>
    );
}
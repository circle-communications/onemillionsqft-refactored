'use client';

import Link from 'next/link';
import { formatPriceRange } from '@/lib/format';
import { MapPin } from 'lucide-react';
import type { Property } from '@/types';

interface PropertySmallCardProps {
  property: Property;
  href: string;
}

export function PropertySmallCard({ property, href }: PropertySmallCardProps) {
  return (
    <div className="relative group flex h-32 sm:h-36 bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-300">
      {/* Image – fixed width, always full height */}
      <div className="relative w-36 sm:w-44 shrink-0 overflow-hidden bg-neutral-100">
        <img
          src={property.image_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Listing type – fixed slot (bottom-left) */}
        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-600 text-white">
          For Sale
        </span>
      </div>

      {/* Content – three fixed zones: header / location / price */}
      <div className="flex flex-1 min-w-0 flex-col p-3 sm:p-4">
        <div className="min-w-0">
          <span className="block h-4 text-[10px] font-medium leading-4 text-brand-600 uppercase tracking-wider truncate">
            {property.property_type}
          </span>
          <h3 className="font-sans text-sm sm:text-base font-bold leading-snug text-neutral-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
            <Link href={href} className="after:absolute after:inset-0 after:content-['']">
              {property.title}
            </Link>
          </h3>
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {property.locality}, {property.city}
          </span>
        </div>

        {/* Price – always pinned to bottom */}
        <div className="mt-auto flex items-baseline gap-1.5 border-t border-neutral-100 pt-2">
          <span className="text-sm sm:text-base font-bold leading-tight text-neutral-900">
            {formatPriceRange(property.price, property.price_max)}
          </span>
          <span className="text-[10px] text-neutral-400">
            onwards
          </span>
        </div>
      </div>
    </div>
  );
}
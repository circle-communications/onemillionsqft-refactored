'use client';

import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin, MessageSquareText, ArrowRight, Sparkles } from 'lucide-react';
import { formatPriceRange, formatArea } from '@/lib/format';
import { useEnquiry } from '@/components/layout/EnquiryProvider';
import type { Property } from '@/types';

interface PropertyCardHorizontalProps {
  property: Property;
  href: string;
}

/** Featured-project card (large, horizontal). The whole card is clickable through the title link. */
export function PropertyCardHorizontal({ property, href }: PropertyCardHorizontalProps) {
  const { openEnquiry } = useEnquiry();

  return (
    <div className="relative group bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-300 hover:shadow-xl hover:border-brand-200 transition-all duration-300 animate-fade-in">
      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1 origin-left scale-x-0 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 transition-transform duration-500 ease-out group-hover:scale-x-100" />

      <div className="p-2 pb-6 grid grid-cols-1 md:grid-cols-[45%_55%]">
        {property.featured && (
          <div className="absolute z-10 left-0 top-6 flex items-center gap-1.5 rotate-180 [writing-mode:vertical-rl] rounded-l-md bg-amber-400 py-3 pl-2 pr-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-950 shadow-md">
            <span>Featured</span>
            <Sparkles className="h-3.5 w-3.5 rotate-180" strokeWidth={1.5} />
          </div>
        )}

        {/* Image */}
        <div className="relative h-[240px] md:h-[360px] overflow-hidden rounded-xl">
          <img
            src={property.image_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-1000 group-hover:left-[130%] group-hover:opacity-100" />

          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              type="button"
              onClick={() => openEnquiry({ propertySlug: property.slug, heading: property.title })}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
              aria-label={`Enquire about ${property.title}`}
            >
              <MessageSquareText className="h-4 w-4 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 flex flex-col justify-between min-h-[320px] md:min-h-[360px]">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-medium text-brand-600 uppercase tracking-wider">{property.property_type}</span>
              {property.builder && (
                <span className="text-sm text-neutral-800 font-medium truncate">
                  <span className="text-sm text-neutral-400 font-normal truncate">Builder : </span>
                  {property.builder}
                </span>
              )}
            </div>

            <h3 className="font-sans text-lg md:text-xl font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
              <Link href={href} className="after:absolute after:inset-0 after:z-[5] after:content-['']">
                {property.title}
              </Link>
            </h3>

            <span className="mb-3 block h-0.5 w-24 bg-gradient-to-r from-amber-300 to-transparent transition-all duration-500" />

            <div className="flex items-center gap-1.5 text-sm text-neutral-500 mb-5">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>
                {property.locality}, {property.city}
              </span>
            </div>

            <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">{property.description}</p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-3 mt-2 pt-3 border-t border-neutral-100">
              {property.bedrooms !== null && (
                <div className="flex items-center gap-1.5 text-sm text-neutral-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <Bed className="h-4 w-4 text-brand-500" />
                  <span>{property.bedrooms} BHK</span>
                </div>
              )}
              {property.bathrooms !== null && (
                <div className="flex items-center gap-1.5 text-sm text-neutral-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <Bath className="h-4 w-4 text-brand-500" />
                  <span>{property.bathrooms} Bath</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-neutral-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                <Maximize className="h-4 w-4 text-brand-500" />
                <span>{formatArea(property.area_sqft)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 mt-2 pt-3 border-t border-neutral-200">
            <div>
              <div className="text-xs text-neutral-400 mb-1">Price starting from</div>
              <div className="text-lg md:text-xl font-bold text-neutral-900">
                {formatPriceRange(property.price, property.price_max)}
              </div>
            </div>

            <span
              aria-hidden="true"
              className="shrink-0 inline-flex h-12 items-center gap-3 rounded-full bg-amber-400 pl-5 pr-1.5 text-sm font-bold text-neutral-950 transition-colors duration-300 group-hover:bg-neutral-950 group-hover:text-white"
            >
              View Details
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-950 text-white transition-all duration-300 group-hover:-rotate-45 group-hover:bg-amber-400 group-hover:text-neutral-950">
                <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

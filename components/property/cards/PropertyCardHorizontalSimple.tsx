'use client';

import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin, MessageSquareText, ArrowUpRight, Crown, Sparkles } from 'lucide-react';
import { formatPriceRange, formatArea } from '@/lib/format';
import { useEnquiry } from '@/components/layout/EnquiryProvider';
import type { Property } from '@/types';

interface PropertyCardHorizontalProps {
  property: Property;
  href: string;
}

/** Search-results card. The whole card is clickable through the title link. */
export function PropertyCardHorizontalSimple({ property, href }: PropertyCardHorizontalProps) {
  const { openEnquiry } = useEnquiry();

  return (
    <div className="relative group bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-300 hover:shadow-xl hover:border-brand-200 transition-all duration-300 animate-fade-in">
      <div className="p-2 grid grid-cols-1 md:grid-cols-[45%_55%]">
        {/* Image */}
        <div className="relative h-[240px] md:h-[340px] overflow-hidden rounded-xl">
          <img
            src={property.image_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />

          {/* <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {property.possession && (
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-600 text-white">{property.status}</span>
            )}
          </div> */}

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

          {property.featured && !property.exclusive && (
            <div className="absolute top-4 left-4 px-2.5 py-1 rounded bg-yellow-400 text-yellow-900 text-xs font-bold">
              <Sparkles className="inline-block h-4 w-4 rotate-180 mr-1" strokeWidth={1.5} />
              FEATURED
            </div>
          )}
          {property.exclusive && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full border border-amber-400/60 bg-black/50 tracking-wide text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.15)] backdrop-blur-xl text-xs font-bold">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Crown className="h-4 w-4 text-amber-300 flex-shrink-0" strokeWidth={1.5} />
                EXCLUSIVE
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col justify-between min-h-[320px] md:min-h-[340px]">
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

            <div className="flex items-center gap-1.5 text-sm text-neutral-500 mb-5">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>
                {property.locality}, {property.city}
              </span>
            </div>

            <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">{property.description}</p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-3 mt-2 pt-3 border-t border-neutral-100">
              {property.bedrooms !== null && (
                <div className="flex items-center gap-1.5 text-sm md:text-base text-neutral-600 px-3 py-1.5 rounded-lg">
                  <Bed className="h-4 w-4 text-brand-500" />
                  <span>{property.bedrooms} BHK</span>
                </div>
              )}
              {property.bathrooms !== null && (
                <div className="flex items-center gap-1.5 text-sm md:text-base text-neutral-600 px-3 py-1.5 rounded-lg">
                  <Bath className="h-4 w-4 text-brand-500" />
                  <span>{property.bathrooms} Bath</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm md:text-base text-neutral-600 px-3 py-1.5 rounded-lg">
                <Maximize className="h-4 w-4 text-brand-500" />
                <span>{formatArea(property.area_sqft)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 mt-2 pt-3 border-neutral-200 bg-slate-50 px-4 py-3 rounded-md shadow-sm">
            <div>
              <div className="text-xs text-neutral-400 mb-1">Price starting from</div>
              <div className="text-lg font-bold text-neutral-900">{formatPriceRange(property.price, property.price_max)}</div>
            </div>

            <span
              aria-hidden="true"
              className="shrink-0 text-sm font-semibold text-brand-600 group-hover:underline border border-brand-600/20 group-hover:border-brand-600 px-3 py-3 rounded-lg transition-colors"
            >
              View Details <ArrowUpRight className=" inline-block h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin, MessageSquareText, ArrowUpRight, Sparkles } from 'lucide-react';
import { formatPriceRange, formatArea } from '@/lib/format';
import { useEnquiry } from '@/components/layout/EnquiryProvider';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  href: string;
}

export function PropertyCardNewLaunch({ property, href }: PropertyCardProps) {
  const { openEnquiry } = useEnquiry();

  return (
    <div className="relative p-2 group bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-300 hover:shadow-xl hover:border-brand-200 transition-all duration-300 animate-fade-in">
      <div className="relative h-56 overflow-hidden rounded-xl">
        <img
          src={property.image_url}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button
            type="button"
            onClick={() => openEnquiry({ propertySlug: property.slug, heading: property.title })}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
            aria-label={`Enquire about ${property.title}`}
          >
            <MessageSquareText className="h-4 w-4 text-neutral-600" />
          </button>
        </div>
        {property.featured && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded bg-yellow-400 text-yellow-900 text-xs font-bold">
            <Sparkles className="inline-block h-3.5 w-3.5 mr-1" />
            FEATURED
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-brand-600 uppercase tracking-wider">{property.property_type}</span>
          {property.builder && (
            <span className="text-xs text-neutral-800 font-medium truncate">
              <span className="text-xs text-neutral-400 font-normal truncate">Builder : </span>
              {property.builder}
            </span>
          )}
        </div>

        <h3 className="font-sans text-lg font-bold text-neutral-900 mb-1 line-clamp-1 group-hover:text-brand-600 transition-colors">
          <Link href={href} className="after:absolute after:inset-0 after:z-[5] after:content-['']">
            {property.title}
          </Link>
        </h3>

        <div className="flex items-center gap-1 text-sm text-neutral-500 mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {property.locality}, {property.city}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4 border-t border-neutral-100 pt-3">
          {property.bedrooms !== null && (
            <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-brand-500" />
              <span>{property.bedrooms} BHK</span>
            </div>
          )}
          {property.bathrooms !== null && (
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-brand-500" />
              <span>{property.bathrooms} Bath</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4 text-brand-500" />
            <span>{formatArea(property.area_sqft)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-neutral-900">{formatPriceRange(property.price, property.price_max)}</div>
            <div className="text-xs text-neutral-400">onwards</div>
          </div>
          <span aria-hidden="true" className="text-sm font-semibold text-brand-600 group-hover:underline">
            View Details <ArrowUpRight className="inline-block h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

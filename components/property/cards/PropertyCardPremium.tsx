'use client';

import Link from 'next/link';
import { MapPin, Crown, ArrowUpRight } from 'lucide-react';
import { formatPriceRange } from '@/lib/format';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  href: string;
}

export function PropertyCardPremium({ property, href }: PropertyCardProps) {
  const rightValue = property.status;

  return (
    <article className="group relative h-[480px] overflow-hidden rounded-2xl bg-neutral-950 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition-all duration-500 hover:shadow-[0_28px_60px_-20px_rgba(0,0,0,0.6)] hover:ring-amber-400/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {/* ============ Image ============ */}
      <img
        src={property.image_url}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.07] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />

      {/* Depth gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.35)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/75 via-black/30 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />

      {/* Shine sweep */}
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-1000 group-hover:left-[130%] group-hover:opacity-100 motion-reduce:hidden" />

      {/* Gold bottom line — draws in on hover */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1 origin-left scale-x-0 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 transition-transform duration-500 group-hover:scale-x-100 motion-reduce:transition-none" />

      {/* Inset hairline frame */}
      <div className="pointer-events-none absolute inset-3 rounded-xl border border-white/20 transition-colors duration-500 group-hover:border-amber-300/30" />

      {/* ============ Content ============ */}
      <div className="relative flex h-full flex-col justify-between p-6 text-white">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center rounded-full bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase text-white/90 ring-1 ring-white/20 backdrop-blur-md">
            {property.property_type}
          </span>

          {property.exclusive && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#d9b66a] via-[#e6c981] to-[#c9a45c] py-1.5 pl-2 pr-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-950">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-950/90">
                <Crown className="h-3 w-3 text-amber-300" strokeWidth={2.25} />
              </span>
              Exclusive
            </span>
          )}
        </div>

        {/* Bottom block */}
        <div>
          {/* Title */}
          <h3 className="font-serif text-2xl font-medium leading-[1.15] tracking-tight text-white">
            <Link
              href={href}
              className="line-clamp-2 text-left after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-amber-400"
            >
              {property.title}
            </Link>
          </h3>

          {/* Location */}
          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-white/80">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-300" strokeWidth={1.75} />
            <span className="line-clamp-1">
              {property.locality}, {property.city}
            </span>
          </p>

          {/* Frosted price panel */}
          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-white/[0.08] px-4 py-3.5 ring-1 ring-white/15 backdrop-blur-sm transition-colors duration-500 group-hover:bg-white/[0.12]">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
                Starting from
              </p>
              <p className="mt-0.5 truncate text-[1.4rem] font-semibold leading-none tracking-tight text-white">
                {formatPriceRange(property.price, property.price_max)}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {rightValue && (
                <div className="hidden border-l border-white/15 pl-4 text-right sm:block">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
                    Status
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-amber-300">
                    {rightValue}
                  </p>
                </div>
              )}

              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 transition-all duration-300 group-hover:rotate-0 group-hover:bg-gradient-to-r from-[#d9b66a] via-[#e6c981] to-[#c9a45c] group-hover:text-neutral-950 group-hover:ring-amber-400"
              >
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

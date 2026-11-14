import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { formatArea, formatPrice } from '@/lib/format';
import { getPropertyPath } from '@/lib/routes';
import type { Property } from '@/types';

/** Props every detail layout receives from its server page. */
export interface DetailProps {
  property: Property;
  /** Other listings in the same category (same city first). May be empty. */
  similar: Property[];
}

/**
 * Plot-only facts the detail layouts can show. Only what the database actually stores is
 * returned; everything else is left undefined so the layouts hide those rows.
 */
export function plotAttributes(p: Property): Record<string, string | boolean | undefined> {
  const approvals = [p.cmda_approved && 'CMDA', p.dtcp_approved && 'DTCP', p.rera_registered && 'RERA'].filter(Boolean);
  return {
    facing: p.facing ?? undefined,
    corner_plot: p.category === 'residential-plot' ? p.is_corner : undefined,
    approval_authority: approvals.length ? approvals.join(', ') : undefined,
  };
}

/** Compact "similar listings" strip rendered under every detail layout. */
export function SimilarProperties({ similar }: { similar: Property[] }) {
  if (similar.length === 0) return null;
  return (
    <section className="bg-white border-t border-neutral-200" aria-labelledby="similar-heading">
      <div className="container-x py-10">
        <h2 id="similar-heading" className="font-serif text-xl md:text-2xl font-bold text-neutral-900 mb-6">
          Similar properties
        </h2>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {similar.map((p) => (
            <li key={p.id}>
              <Link
                href={getPropertyPath(p)}
                className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg"
              >
                <div className="h-44 overflow-hidden bg-neutral-100">
                  <img
                    src={p.image_url}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-brand-600">{p.property_type}</p>
                  <h3 className="mt-1 line-clamp-1 font-sans font-semibold text-neutral-900">{p.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {p.locality}, {p.city}
                  </p>
                  <p className="mt-3 text-sm text-neutral-500">
                    <span className="font-bold text-neutral-900">{formatPrice(p.price)}</span> · {formatArea(p.area_sqft)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

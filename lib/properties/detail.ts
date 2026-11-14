import 'server-only';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { getPropertyBySlug, getSimilarProperties } from '@/lib/properties/repository';
import { getPropertyPath } from '@/lib/routes';
import { formatPriceRange } from '@/lib/format';
import type { Property } from '@/types';

/** Slugs come from the URL: reject anything that cannot be a slug before it reaches the database. */
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,119}$/;

/** One fetch per request, shared by `generateMetadata` and the page itself. */
const fetchProperty = cache(async (slug: string): Promise<Property | null> => {
  if (!SLUG_RE.test(slug)) return null;
  return getPropertyBySlug(createServerClient(), slug);
});

/**
 * Loads a listing for /property/[slug] (unknown or malformed slug → 404) plus similar listings.
 * There is exactly one URL per listing, so there is nothing to redirect between.
 */
export async function loadDetail(slug: string) {
  const property = await fetchProperty(slug);
  if (!property) notFound();

  const similar = await getSimilarProperties(createServerClient(), property, 3).catch(() => [] as Property[]);
  return { property, similar };
}

export async function detailMetadata(slug: string): Promise<Metadata> {
  let property: Property | null = null;
  try {
    property = await fetchProperty(slug);
  } catch {
    /* fall through to the generic title */
  }
  if (!property) return { title: 'Property not found', robots: { index: false } };

  const title = `${property.title} – ${property.locality}, ${property.city}`;
  const description =
    property.description.slice(0, 160) ||
    `${property.property_type} for sale in ${property.locality}, ${property.city}. ${formatPriceRange(property.price, property.price_max)}.`;

  return {
    title,
    description,
    alternates: { canonical: getPropertyPath(property) },
    openGraph: { title, description, images: property.image_url ? [property.image_url] : undefined },
  };
}

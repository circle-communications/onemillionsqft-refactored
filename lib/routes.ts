/**
 * Every internal URL for a listing comes from here, so a change to the route structure is one edit.
 *
 *   /property/<slug>       one URL per listing, whatever its category or tier
 *
 * The URL identifies the listing and nothing else. Which page layout is used (standard, featured,
 * exclusive; plot or building) is decided from the listing's data in `PropertyDetailView`, so
 * switching a listing between tiers never changes or breaks its link. `slug` is globally unique
 * (UNIQUE constraint on properties.slug), which is what makes a flat route safe.
 *
 * Old URLs (/property/featured/<slug>, /property/exclusive/<slug>, /plot/<slug>, /plot/exclusive/<slug> …)
 * are redirected to the new one in next.config.js.
 */

import type { Property } from '@/types';

export const PROPERTY_BASE = '/property';

export const isPlot = (property: Pick<Property, 'category'>): boolean => property.category === 'residential-plot';

export type DetailTier = 'standard' | 'featured' | 'exclusive';

/** Presentation tier, derived from the listing's flags. Never part of a URL. */
export const detailTier = (p: Pick<Property, 'featured' | 'exclusive'>): DetailTier =>
  p.exclusive ? 'exclusive' : p.featured ? 'featured' : 'standard';

export const getPropertyPath = (property: Pick<Property, 'slug'>): string => `${PROPERTY_BASE}/${property.slug}`;

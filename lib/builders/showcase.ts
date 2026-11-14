/**
 * Data for the home page "Trusted Builders" carousel.
 *
 * A builder appears when its `builders` row is active and has a logo and a tagline, and it has at
 * least one published listing. Projects come from those live listings, so a card can never
 * advertise something that is not for sale. To feature a builder, fill in its tagline / logo in
 * Supabase; nothing in the code changes.
 */
import { textSearchHref } from '@/lib/search/links';
import { getPropertyPath } from '@/lib/routes';
import type { Property } from '@/types';

/** A row of the `builders` table, as far as the carousel needs it. */
export interface BuilderRow {
  slug: string;
  name: string;
  logo_url: string | null;
  tagline: string | null;
  badges: string[] | null;
  sort_order: number | null;
}

export interface ShowcaseProject {
  name: string;
  locality: string;
  image: string | null;
  href: string;
}

export interface ShowcaseBuilder {
  slug: string;
  name: string;
  logo: string | null;
  tagline: string;
  badges: string[];
  projects: ShowcaseProject[];
  /** "View all projects" target: a text search for the builder. */
  href: string;
}

type Source = Pick<Property, 'builder' | 'builder_slug' | 'builder_logo' | 'title' | 'slug' | 'locality' | 'image_url'>;

export function buildShowcase(
  builders: readonly BuilderRow[],
  properties: readonly Source[],
  maxProjects = 8,
): ShowcaseBuilder[] {
  const bySlug = new Map<string, Source[]>();
  for (const p of properties) {
    if (!p.builder_slug) continue;
    const list = bySlug.get(p.builder_slug) ?? [];
    list.push(p);
    bySlug.set(p.builder_slug, list);
  }

  return builders
    .filter((b) => b.logo_url && b.tagline?.trim() && bySlug.has(b.slug))
    .sort((a, b) => (a.sort_order ?? 100) - (b.sort_order ?? 100) || a.name.localeCompare(b.name))
    .map((b) => ({
      slug: b.slug,
      name: b.name,
      logo: b.logo_url,
      tagline: b.tagline!.trim(),
      badges: b.badges ?? [],
      projects: bySlug.get(b.slug)!.slice(0, maxProjects).map((r) => ({
        name: r.title,
        locality: r.locality,
        image: r.image_url || null,
        href: getPropertyPath(r),
      })),
      href: textSearchHref(b.name),
    }));
}

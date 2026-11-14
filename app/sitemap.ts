import type { MetadataRoute } from 'next';
import { CITIES } from '@/lib/constants/locations';
import { CATEGORY_SLUGS } from '@/lib/constants/property';
import { getPropertyPath } from '@/lib/routes';
import { categoryHref, cityHref } from '@/lib/search/links';
import { SITE } from '@/lib/site';
import { createServerClient } from '@/lib/supabase/server';
import { posts } from '@/data/posts';
import type { Property } from '@/types';

export const revalidate = 3600;

const abs = (path: string) => `${SITE.url}${path}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    ...['/', '/properties', '/about', '/contact', '/post-property', '/blogs'].map((p) => ({
      url: abs(p),
      lastModified: now,
    })),
    ...CATEGORY_SLUGS.map((c) => ({ url: abs(categoryHref(c)), lastModified: now })),
    ...CITIES.map((c) => ({ url: abs(cityHref(c.slug)), lastModified: now })),
    ...posts.map((p) => ({ url: abs(`/blog/${p.slug}`), lastModified: now })),
  ];

  try {
    const { data } = await createServerClient(3600)
      .from('property_cards')
      .select('slug,category,featured,exclusive,created_at')
      .order('created_at', { ascending: false })
      .limit(5000);
    for (const row of (data ?? []) as Pick<Property, 'slug' | 'category' | 'featured' | 'exclusive' | 'created_at'>[]) {
      entries.push({ url: abs(getPropertyPath(row)), lastModified: new Date(row.created_at) });
    }
  } catch {
    /* database unreachable at build time: ship the static part of the sitemap */
  }
  return entries;
}

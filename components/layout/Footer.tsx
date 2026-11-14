import { CATEGORY_BY_SLUG } from '@/lib/constants/property';
import { getPopularSearches } from '@/lib/properties/repository';
import { localityHref } from '@/lib/search/links';
import { createServerClient } from '@/lib/supabase/server';
import { FooterContent, type LinkItem } from './FooterContent';

/**
 * Server wrapper: loads the footer's "Popular searches" from live listings, then hands them to the
 * client-side footer. If the database is unreachable the column is simply hidden.
 */
export async function Footer() {
  let popularSearches: LinkItem[] = [];
  try {
    const rows = await getPopularSearches(createServerClient());
    popularSearches = rows.map((r) => ({
      label: `${CATEGORY_BY_SLUG[r.category].short} in ${r.locality}`,
      href: localityHref(r.citySlug, r.localitySlug, { category: [r.category] }),
    }));
  } catch (err) {
    console.error('[footer] popular searches unavailable', err);
  }
  return <FooterContent popularSearches={popularSearches} />;
}

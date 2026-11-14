import { HomeContent, type CityRail } from '@/components/home/HomeContent';
import { CITIES } from '@/lib/constants/locations';
import { buildShowcase, type ShowcaseBuilder } from '@/lib/builders/showcase';
import {
  getBuilderListings,
  getShowcaseBuilderRows,
  getExclusiveProperties,
  getFacets,
  getFeaturedProperties,
  getLatestInCity,
  getLatestProperties,
} from '@/lib/properties/repository';
import { createServerClient } from '@/lib/supabase/server';
import type { Property } from '@/types';

/** Home page data is cached for a minute (see LISTING_REVALIDATE_SECONDS); the page itself is ISR. */
export const revalidate = 60;

async function loadHome() {
  const empty = {
    featured: [] as Property[],
    exclusive: [] as Property[],
    latest: [] as Property[],
    cities: CITIES.map((c): CityRail => ({ slug: c.slug, name: c.name, count: 0, properties: [] })),
    stats: { total: 0, builders: 0 },
    builders: [] as ShowcaseBuilder[],
  };

  try {
    const client = createServerClient();
    const [featured, exclusive, latest, facets, builderListings, builderRows, ...cityLists] = await Promise.all([
      getFeaturedProperties(client),
      getExclusiveProperties(client),
      getLatestProperties(client, 9),
      getFacets(client),
      getBuilderListings(client),
      getShowcaseBuilderRows(client),
      ...CITIES.map((c) => getLatestInCity(client, c.slug, 6)),
    ]);

    return {
      featured,
      exclusive,
      latest,
      cities: CITIES.map(
        (c, i): CityRail => ({
          slug: c.slug,
          name: c.name,
          count: facets.cities[c.slug] ?? 0,
          properties: cityLists[i],
        }),
      ),
      stats: { total: facets.total, builders: facets.builders },
      builders: buildShowcase(builderRows, builderListings),
    };
  } catch (err) {
    // Missing env or database down: still render the page (empty rails) instead of a 500.
    console.error('[home] could not load listings', err);
    return empty;
  }
}

export default async function HomePage() {
  const data = await loadHome();
  return <HomeContent {...data} />;
}

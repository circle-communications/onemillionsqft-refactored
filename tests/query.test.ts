import { describe, expect, it } from 'vitest';
import { applyFilters, applySort, bhkValues, escapeLike } from '@/lib/search/query';
import { emptyFilters, parseSearchParams, type SearchFilters } from '@/lib/search/filters';

type Call = [method: string, ...args: unknown[]];

/** Records every filter call instead of talking to a database. */
function recorder() {
  const calls: Call[] = [];
  const proxy: Record<string, (...a: unknown[]) => unknown> = new Proxy(
    {},
    {
      get:
        (_t, method: string) =>
        (...args: unknown[]) => {
          calls.push([method, ...args]);
          return proxy;
        },
    },
  );
  return { builder: proxy as never, calls };
}

const run = (f: Partial<SearchFilters>) => {
  const { builder, calls } = recorder();
  applyFilters(builder, { ...emptyFilters(), ...f });
  return calls;
};

describe('applyFilters', () => {
  it('adds nothing for an empty search', () => {
    expect(run({})).toEqual([]);
  });

  it('uses range overlap for price', () => {
    const calls = run({ minPrice: 10_000_000, maxPrice: 20_000_000 });
    expect(calls).toContainEqual(['lte', 'price', 20_000_000]);
    expect(calls).toContainEqual(['or', 'price_max.gte.10000000,and(price_max.is.null,price.gte.10000000)']);
  });

  it('uses range overlap for area', () => {
    const calls = run({ minArea: 900, maxArea: 1500 });
    expect(calls).toContainEqual(['lte', 'area_min_sqft', 1500]);
    expect(calls).toContainEqual(['gte', 'area_max_sqft', 900]);
  });

  it('matches BHK through bhk_options and expands "5+"', () => {
    expect(bhkValues([2])).toEqual([2]);
    expect(bhkValues([5])[0]).toBe(5);
    expect(bhkValues([5]).length).toBeGreaterThan(5);
    expect(run({ bhk: [3] })).toContainEqual(['overlaps', 'bhk_options', [3]]);
  });

  it('requires every selected amenity', () => {
    expect(run({ amenities: ['gym', 'lift'] })).toContainEqual(['contains', 'amenity_slugs', ['gym', 'lift']]);
  });

  it('applies every word of the free-text search and escapes LIKE wildcards', () => {
    const calls = run({ q: '100% velachery' });
    expect(calls).toContainEqual(['ilike', 'search_text', '%100\\%%']);
    expect(calls).toContainEqual(['ilike', 'search_text', '%velachery%']);
    expect(escapeLike('a_b%c\\')).toBe('a\\_b\\%c\\\\');
  });

  it('maps approval flags to their view columns', () => {
    const calls = run(parseSearchParams(new URLSearchParams('category=residential-plot&cmda=1&dtcp=1&corner=1')));
    expect(calls).toContainEqual(['eq', 'cmda_approved', true]);
    expect(calls).toContainEqual(['eq', 'dtcp_approved', true]);
    expect(calls).toContainEqual(['eq', 'is_corner', true]);
  });
});

describe('applySort', () => {
  it('always ends with the id tie-break so pages never overlap', () => {
    const { builder, calls } = recorder();
    applySort(builder, 'price_asc');
    expect(calls[0]).toEqual(['order', 'price', { ascending: true, nullsFirst: false }]);
    expect(calls.at(-1)).toEqual(['order', 'id', { ascending: true }]);
  });
});

describe('rankPopularSearches', () => {
  const row = (category: string, locality: string) => ({
    category, city_slug: 'chennai', locality_slug: locality.toLowerCase(), locality,
  });

  it('ranks by listing count, then alphabetically, and respects the limit', async () => {
    const { rankPopularSearches } = await import('@/lib/properties/repository');
    const rows = [
      row('flat-apartment', 'Velachery'), row('flat-apartment', 'Velachery'), row('flat-apartment', 'Velachery'),
      row('residential-plot', 'Oragadam'), row('residential-plot', 'Oragadam'),
      row('independent-villa', 'Adyar'), row('flat-apartment', 'Porur'),
    ];
    const ranked = rankPopularSearches(rows, 3);
    expect(ranked.map((r) => `${r.category}/${r.localitySlug}/${r.count}`)).toEqual([
      'flat-apartment/velachery/3',
      'residential-plot/oragadam/2',
      'independent-villa/adyar/1',
    ]);
  });

  it('ignores rows without a category or locality', async () => {
    const { rankPopularSearches } = await import('@/lib/properties/repository');
    expect(rankPopularSearches([row('', 'X'), { ...row('flat-apartment', 'Y'), locality_slug: '' }], 5)).toEqual([]);
  });
});

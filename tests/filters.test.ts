import { describe, expect, it } from 'vitest';
import {
  canonicalQuery,
  emptyFilters,
  parseSearchParams,
  sanitizeFilters,
  searchHref,
  serializeFilters,
} from '@/lib/search/filters';
import { CRORE, LAKH } from '@/lib/constants/property';

const parse = (qs: string) => parseSearchParams(new URLSearchParams(qs));

describe('parseSearchParams', () => {
  it('reads the canonical vocabulary', () => {
    const f = parse('category=flat-apartment&city=chennai&locality=velachery&bhk=2,3&minPrice=4000000&possession=ready-to-move&rera=1');
    expect(f.category).toEqual(['flat-apartment']);
    expect(f.city).toBe('chennai');
    expect(f.locality).toEqual(['velachery']);
    expect(f.bhk).toEqual([2, 3]);
    expect(f.minPrice).toBe(40 * LAKH);
    expect(f.possession).toEqual(['ready-to-move']);
    expect(f.rera).toBe(true);
  });

  it.each([
    ['propertyType=Apartment', 'flat-apartment'],
    ['type=houses', 'independent-villa'],
    ['propertyType=Villa', 'independent-villa'],
    ['propertyType=Plot', 'residential-plot'],
    ['propertyType=Commercial', 'commercial-space'],
    ['type=plots', 'residential-plot'],
  ])('maps legacy %s to %s', (qs, category) => {
    expect(parse(qs).category).toEqual([category]);
  });

  it('maps legacy city / locality display names to slugs', () => {
    const f = parse('city=Chennai&locality=Anna+Nagar');
    expect(f.city).toBe('chennai');
    expect(f.locality).toEqual(['anna-nagar']);
  });

  it('maps legacy budget bands and min/max budget', () => {
    expect(parse('budget=40l-80l')).toMatchObject({ minPrice: 40 * LAKH, maxPrice: 80 * LAKH });
    expect(parse('budget=above-1.5cr')).toMatchObject({ minPrice: 1.5 * CRORE, maxPrice: null });
    expect(parse('maxBudget=5000000').maxPrice).toBe(50 * LAKH);
  });

  it('maps legacy quick filters', () => {
    expect(parse('filter=gated').gated).toBe(true);
    expect(parse('filter=ready-to-move').possession).toEqual(['ready-to-move']);
    expect(parse('status=Ready+to+Occupy').possession).toEqual(['ready-to-move']);
    expect(parse('type=apartment&bhk=1rk').subtype).toEqual(['studio']);
  });

  it('clamps and ignores garbage instead of throwing', () => {
    const f = parse('page=-4&minPrice=abc&bhk=x&sort=drop-table&category=boats&q=' + 'a'.repeat(500));
    expect(f.page).toBe(1);
    expect(f.minPrice).toBeNull();
    expect(f.bhk).toEqual([]);
    expect(f.sort).toBe('newest');
    expect(f.category).toEqual([]);
    expect(f.q.length).toBe(100);
  });

  it('accepts Next.js style record params (arrays)', () => {
    const f = parseSearchParams({ category: ['flat-apartment', 'independent-villa'], bhk: '3' });
    expect(f.category).toEqual(['flat-apartment', 'independent-villa']);
    expect(f.bhk).toEqual([3]);
  });
});

describe('sanitizeFilters', () => {
  it('drops filters that cannot apply to the selected categories', () => {
    const f = parse('category=residential-plot&bhk=2&bathrooms=2&furnishing=unfurnished&parking=1&dtcp=1&gated=1');
    expect(f.bhk).toEqual([]);
    expect(f.bathrooms).toBeNull();
    expect(f.furnishing).toEqual([]);
    expect(f.parking).toBe(false);
    expect(f.dtcp).toBe(true); // plots do have DTCP
  });

  it('drops DTCP / corner for categories without them', () => {
    const f = parse('category=flat-apartment&dtcp=1&corner=1&possession=ready-to-build');
    expect(f.dtcp).toBe(false);
    expect(f.corner).toBe(false);
    expect(f.possession).toEqual([]);
  });

  it('swaps inverted ranges', () => {
    const f = sanitizeFilters({ ...emptyFilters(), minPrice: 9 * CRORE, maxPrice: 1 * CRORE });
    expect([f.minPrice, f.maxPrice]).toEqual([1 * CRORE, 9 * CRORE]);
  });
});

describe('serialize / canonical', () => {
  it('is stable: parse(serialize(f)) equals f', () => {
    const f = parse('category=independent-villa,flat-apartment&city=chennai&bhk=4,5&sort=price_asc&page=3&amenities=gym,lift');
    const again = parseSearchParams(serializeFilters(f));
    expect(again).toEqual(f);
  });

  it('emits parameters in a fixed order', () => {
    const a = serializeFilters(parse('sort=price_asc&city=chennai&category=flat-apartment')).toString();
    const b = serializeFilters(parse('category=flat-apartment&city=chennai&sort=price_asc')).toString();
    expect(a).toBe(b);
  });

  it('canonicalQuery returns null for a canonical query and never loops', () => {
    for (const qs of ['', 'category=flat-apartment', 'city=chennai&locality=velachery&bhk=2', 'sort=price_desc&page=2']) {
      expect(canonicalQuery(new URLSearchParams(qs))).toBeNull();
    }
    const fixed = canonicalQuery(new URLSearchParams('propertyType=Villa&city=Chennai'));
    expect(fixed).toBe('category=independent-villa&city=chennai');
    expect(canonicalQuery(new URLSearchParams(fixed!))).toBeNull();
  });

  it('keeps unrelated params (utm_*) when canonicalising', () => {
    const fixed = canonicalQuery(new URLSearchParams('propertyType=Plot&utm_source=ad'));
    expect(fixed).toBe('category=residential-plot&utm_source=ad');
    expect(canonicalQuery(new URLSearchParams(fixed!))).toBeNull();
  });

  it('searchHref builds /properties URLs', () => {
    expect(searchHref()).toBe('/properties');
    expect(searchHref({ category: ['residential-plot'], city: 'chennai' })).toBe('/properties?category=residential-plot&city=chennai');
  });
});

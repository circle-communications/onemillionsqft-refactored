import { describe, expect, it } from 'vitest';
import { NAV } from '@/components/navigation/menu';
import { canonicalQuery, parseSearchParams, countActiveFilters } from '@/lib/search/filters';
import { BUDGET_BANDS, CATEGORY_SLUGS } from '@/lib/constants/property';
import { LOCALITIES } from '@/lib/constants/locations';
import { budgetHref, categoryHref, localityHref, luxuryHref } from '@/lib/search/links';
import { detailTier, getPropertyPath } from '@/lib/routes';

function menuPaths(): string[] {
  const out: string[] = [];
  for (const nav of NAV) {
    out.push(nav.cta.path, nav.promo.cta.path);
    for (const section of nav.sections)
      for (const group of section.groups)
        for (const item of group.items) {
          out.push(item.path);
          for (const child of item.children ?? []) out.push(child.path);
        }
  }
  return out;
}

describe('navigation links', () => {
  const searchLinks = menuPaths().filter((p) => p.startsWith('/properties'));

  it('the header menu has search links', () => {
    expect(searchLinks.length).toBeGreaterThan(30);
  });

  it.each([...new Set(searchLinks)])('%s is canonical and carries its filters', (path) => {
    const url = new URL(path, 'http://x');
    expect(canonicalQuery(url.searchParams)).toBeNull(); // no redirect hop, no dropped filters
    if (url.search) expect(countActiveFilters(parseSearchParams(url.searchParams))).toBeGreaterThan(0);
  });

  it('every internal non-search link points at a page that exists', () => {
    const known = ['/', '/about', '/contact', '/post-property', '/blogs', '/properties'];
    for (const p of menuPaths().filter((p) => !p.startsWith('/properties'))) {
      expect(known).toContain(p.split('?')[0]);
    }
  });

  it('generated link builders produce canonical URLs', () => {
    const links = [
      ...CATEGORY_SLUGS.map((c) => categoryHref(c)),
      ...BUDGET_BANDS.map((b) => budgetHref(b.slug)),
      ...LOCALITIES.map((l) => localityHref(l.city, l.slug)),
      luxuryHref(),
    ];
    for (const href of links) expect(canonicalQuery(new URL(href, 'http://x').searchParams)).toBeNull();
  });
});

describe('getPropertyPath', () => {
  it('is one flat URL per listing, whatever its category or tier', () => {
    expect(getPropertyPath({ slug: 'velachery-heights' })).toBe('/property/velachery-heights');
    for (const category of ['flat-apartment', 'independent-villa', 'residential-plot', 'commercial-space'] as const) {
      for (const [featured, exclusive] of [[false, false], [true, false], [true, true]] as const) {
        expect(getPropertyPath({ slug: 's', category, featured, exclusive } as never)).toBe('/property/s');
      }
    }
  });

  it('picks the presentation tier from the flags, not from the URL', () => {
    expect(detailTier({ featured: false, exclusive: false })).toBe('standard');
    expect(detailTier({ featured: true, exclusive: false })).toBe('featured');
    expect(detailTier({ featured: true, exclusive: true })).toBe('exclusive');
    expect(detailTier({ featured: false, exclusive: true })).toBe('exclusive');
  });
});

describe('legacy detail URLs (next.config.js redirects)', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = require('../next.config.js') as { redirects: () => Promise<{ source: string; destination: string; permanent: boolean }[]> };
  const match = async (path: string) => {
    for (const r of await config.redirects()) {
      // translate the two forms used in next.config.js: :name and :name(a|b)
      const re = new RegExp('^' + r.source.replace(/:(\w+)\(([^)]+)\)/g, '(?<$1>$2)').replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$');
      const m = re.exec(path);
      if (m) return r.destination.replace(/:(\w+)/g, (_, k) => m.groups?.[k] ?? '');
    }
    return null;
  };

  it.each([
    ['/property/featured/skyline-oasis', '/property/skyline-oasis'],
    ['/property/exclusive/skyline-oasis', '/property/skyline-oasis'],
    ['/plot/green-acres', '/property/green-acres'],
    ['/plot/featured/green-acres', '/property/green-acres'],
    ['/plot/exclusive/green-acres', '/property/green-acres'],
    ['/listings', '/properties'],
  ])('%s → %s', async (from, to) => expect(await match(from)).toBe(to));

  it('leaves the new URLs alone', async () => {
    expect(await match('/property/skyline-oasis')).toBeNull();
    expect(await match('/properties')).toBeNull();
  });
});

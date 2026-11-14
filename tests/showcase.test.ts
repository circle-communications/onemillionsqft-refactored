import { describe, expect, it } from 'vitest';
import { buildShowcase, type BuilderRow } from '@/lib/builders/showcase';

const listing = (o: Record<string, unknown> = {}) => ({
  builder: 'Harmony Homes',
  builder_slug: 'harmony-homes',
  builder_logo: 'l.png',
  title: 'Ramprasad',
  slug: 'ramprasad',
  locality: 'T Nagar',
  image_url: 'https://x/y.jpg',
  ...o,
});
const builder = (o: Partial<BuilderRow> = {}): BuilderRow => ({
  slug: 'harmony-homes',
  name: 'Harmony Homes',
  logo_url: 'l.png',
  tagline: 'Signature homes',
  badges: ['RERA'],
  sort_order: 100,
  ...o,
});

describe('buildShowcase', () => {
  it('shows a builder with logo + tagline + listings, linking projects to /property/<slug>', () => {
    const out = buildShowcase([builder()], [listing(), listing({ title: 'Navrang', slug: 'navrang' })]);
    expect(out).toHaveLength(1);
    expect(out[0].projects.map((p) => p.href)).toEqual(['/property/ramprasad', '/property/navrang']);
    expect(out[0].href).toBe('/properties?q=Harmony+Homes');
    expect(out[0].badges).toEqual(['RERA']);
  });
  it('hides builders missing a logo or tagline, or without listings', () => {
    const l = [listing(), listing({ builder_slug: 'b2', slug: 'b2p' }), listing({ builder_slug: 'b3', slug: 'b3p' })];
    expect(buildShowcase([builder({ logo_url: null })], l)).toEqual([]);
    expect(buildShowcase([builder({ tagline: '  ' })], l)).toEqual([]);
    expect(buildShowcase([builder({ slug: 'no-listings' })], l)).toEqual([]);
  });
  it('orders by sort_order then name', () => {
    const l = [listing(), listing({ builder_slug: 'a', slug: 'a1' })];
    const out = buildShowcase([builder(), builder({ slug: 'a', name: 'Alpha', sort_order: 5 })], l);
    expect(out.map((b) => b.slug)).toEqual(['a', 'harmony-homes']);
  });
});

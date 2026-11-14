import { describe, expect, it } from 'vitest';
import { buildSuggestions, normalizeQuery, type SuggestRows } from '@/lib/search/suggest';

const rows: SuggestRows = {
  projects: [
    { slug: 'velachery-heights', title: 'Velachery Heights', category: 'flat-apartment', featured: false, exclusive: false, locality: 'Velachery', city: 'Chennai' },
    { slug: 'the-vela-villas', title: 'The Vela Villas', category: 'independent-villa', featured: true, exclusive: false, locality: 'ECR', city: 'Chennai' },
    { slug: 'vela-plots', title: 'Vela Plots', category: 'residential-plot', featured: false, exclusive: true, locality: 'Kelambakkam', city: 'Chennai' },
  ],
  localities: [
    { locality: 'Velachery', locality_slug: 'velachery', city: 'Chennai', city_slug: 'chennai' },
    { locality: 'Velachery', locality_slug: 'velachery', city: 'Chennai', city_slug: 'chennai' },
    { locality: 'Ashok Velan Nagar', locality_slug: 'ashok-velan-nagar', city: 'Chennai', city_slug: 'chennai' },
  ],
  builders: [
    { builder: 'Vela Builders', builder_slug: 'vela-builders' },
    { builder: 'Vela Builders', builder_slug: 'vela-builders' },
  ],
};

describe('normalizeQuery', () => {
  it('collapses whitespace and caps the length', () => {
    expect(normalizeQuery('  adyar   chennai ')).toBe('adyar chennai');
    expect(normalizeQuery('x'.repeat(200))).toHaveLength(60);
  });
});

describe('buildSuggestions', () => {
  it('returns nothing for queries shorter than two characters', () => {
    expect(buildSuggestions('v', rows)).toEqual([]);
    expect(buildSuggestions('   ', rows)).toEqual([]);
  });

  it('groups in order: property types, localities, projects, builders', () => {
    const types = buildSuggestions('vel', rows).map((s) => s.type);
    const order = ['category', 'locality', 'project', 'builder'];
    expect(types.map((t) => order.indexOf(t))).toEqual([...types.map((t) => order.indexOf(t))].sort((a, b) => a - b));
    expect(new Set(types)).toEqual(new Set(['locality', 'project', 'builder']));
  });

  it('counts listings per locality and per builder, and de-duplicates them', () => {
    const out = buildSuggestions('vel', rows);
    const localities = out.filter((s) => s.type === 'locality');
    expect(localities.map((s) => s.label)).toEqual(['Velachery', 'Ashok Velan Nagar']); // prefix match first
    expect(localities[0].sublabel).toBe('Chennai · 2 properties');
    expect(localities[1].sublabel).toBe('Chennai · 1 property');
    expect(out.filter((s) => s.type === 'builder')).toHaveLength(1);
    expect(out.find((s) => s.type === 'builder')?.sublabel).toBe('Builder · 2 projects');
  });

  it('links each kind of suggestion to the right canonical URL', () => {
    const byId = Object.fromEntries(buildSuggestions('vel', rows).map((s) => [s.id, s.href]));
    expect(byId['locality:chennai/velachery']).toBe('/properties?city=chennai&locality=velachery');
    expect(byId['project:velachery-heights']).toBe('/property/velachery-heights');
    expect(byId['project:the-vela-villas']).toBe('/property/the-vela-villas');
    expect(byId['project:vela-plots']).toBe('/property/vela-plots');
    expect(byId['builder:vela-builders']).toBe('/properties?q=Vela+Builders');
  });

  it('offers matching property types without touching the database rows', () => {
    const empty: SuggestRows = { projects: [], localities: [], builders: [] };
    expect(buildSuggestions('villa', empty).map((s) => s.href)).toEqual(['/properties?category=independent-villa']);
    expect(buildSuggestions('plot', empty).map((s) => s.label)).toEqual(['Residential Plots']);
    expect(buildSuggestions('zzz', empty)).toEqual([]);
  });
});

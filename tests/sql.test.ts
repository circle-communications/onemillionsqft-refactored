/**
 * Applies the real migrations (and seed) to an in-process Postgres (PGlite) and checks that the
 * database and the TypeScript code agree: vocabulary, reference data, every column the search
 * layer reads, constraints, and the security model. If you change a filter in lib/ or a table in
 * supabase/, this is the test that tells you the other side needs to change too.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import fs from 'node:fs';
import path from 'node:path';
import {
  AMENITIES,
  APPROVALS,
  CATEGORY_SLUGS,
  FACING,
  FURNISHING,
  POSSESSION,
  SUBTYPES,
} from '@/lib/constants/property';
import { CITIES, CORRIDORS, LOCALITIES } from '@/lib/constants/locations';
import { applyFilters, applySort, SORT_COLUMNS } from '@/lib/search/query';
import { emptyFilters, type SearchFilters } from '@/lib/search/filters';
import { toProperty } from '@/lib/properties/mappers';
import { buildSuggestions } from '@/lib/search/suggest';

const ROOT = path.resolve(__dirname, '..');
const MIGRATIONS = path.join(ROOT, 'supabase', 'migrations');
const files = fs.readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort();
const SEED = fs.readFileSync(path.join(ROOT, 'supabase', 'seed.sql'), 'utf8');

async function freshDb(beforeFoundation?: (db: PGlite) => Promise<void>) {
  const db = new PGlite({ extensions: { pg_trgm } });
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;');
  for (const f of files) {
    if (f.includes('foundation') && beforeFoundation) await beforeFoundation(db);
    try {
      await db.exec(fs.readFileSync(path.join(MIGRATIONS, f), 'utf8'));
    } catch (e) {
      throw new Error(`migration ${f} failed: ${(e as Error).message}`);
    }
  }
  return db;
}

const col = async (db: PGlite, sql: string): Promise<string[]> =>
  (await db.query<Record<string, string>>(sql)).rows.map((r) => Object.values(r)[0]);

describe('migrations on a fresh database', () => {
  let db: PGlite;
  beforeAll(async () => {
    db = await freshDb();
    await db.exec(SEED);
  });
  afterAll(() => db.close());

  describe('vocabulary: SQL enums = TypeScript constants', () => {
    const enumValues = (name: string) => col(db, `SELECT unnest(enum_range(NULL::${name}))::text`);
    it('property_category', async () => expect(await enumValues('property_category')).toEqual([...CATEGORY_SLUGS]));
    it('possession_status', async () => expect(await enumValues('possession_status')).toEqual(POSSESSION.map((p) => p.slug)));
    it('furnishing_status', async () => expect(await enumValues('furnishing_status')).toEqual(FURNISHING.map((f) => f.slug)));
    it('facing_direction', async () => expect(await enumValues('facing_direction')).toEqual(FACING.map((f) => f.slug)));
  });

  describe('reference data: SQL tables = TypeScript constants', () => {
    it('cities', async () => {
      expect(await col(db, 'SELECT slug FROM cities ORDER BY sort_order')).toEqual(CITIES.map((c) => c.slug));
    });
    it('corridors', async () => {
      const rows = await col(db, `SELECT c.slug || '/' || k.slug FROM corridors k JOIN cities c ON c.id = k.city_id ORDER BY 1`);
      expect(rows).toEqual(CORRIDORS.map((k) => `${k.city}/${k.slug}`).sort());
    });
    it('localities (slug, city, corridor, popular)', async () => {
      const rows = await col(
        db,
        `SELECT c.slug || '/' || l.slug || '/' || coalesce(k.slug, '-') || '/' || l.is_popular
           FROM localities l JOIN cities c ON c.id = l.city_id LEFT JOIN corridors k ON k.id = l.corridor_id ORDER BY 1`,
      );
      const expected = LOCALITIES.map((l) => `${l.city}/${l.slug}/${l.corridor ?? '-'}/${l.popular}`).sort();
      expect(rows).toEqual(expected);
    });
    it('property_subtypes', async () => {
      const rows = await col(db, `SELECT slug || '/' || category::text FROM property_subtypes ORDER BY 1`);
      expect(rows).toEqual(SUBTYPES.map((s) => `${s.slug}/${s.category}`).sort());
    });
    it('amenities', async () => {
      expect(await col(db, 'SELECT slug FROM amenities ORDER BY sort_order')).toEqual(AMENITIES.map((a) => a.slug));
    });
  });

  describe('the search layer only reads columns that exist', () => {
    const everything: SearchFilters = {
      ...emptyFilters(),
      q: 'x',
      category: [...CATEGORY_SLUGS],
      subtype: ['apartment'],
      city: 'chennai',
      corridor: 'omr',
      locality: ['velachery'],
      minPrice: 1, maxPrice: 2, minArea: 1, maxArea: 2,
      bhk: [2], bathrooms: 1, possession: ['ready-to-move'], furnishing: ['unfurnished'], facing: ['north'],
      parking: true, amenities: ['gym'], rera: true, cmda: true, dtcp: true, gated: true, corner: true,
    };

    function usedColumns(): Set<string> {
      const cols = new Set<string>();
      const proxy: Record<string, (...a: unknown[]) => unknown> = new Proxy(
        {},
        {
          get: (_t, method: string) => (...args: unknown[]) => {
            if (method === 'or') for (const m of String(args[0]).matchAll(/([a-z_]+)\.(?:gte|lte|is|eq)/g)) cols.add(m[1]);
            else if (typeof args[0] === 'string') cols.add(args[0]);
            return proxy;
          },
        },
      );
      applyFilters(proxy as never, everything);
      for (const sort of Object.keys(SORT_COLUMNS)) applySort(proxy as never, sort as never);
      for (const a of APPROVALS) cols.add(a.column);
      return cols;
    }

    it('every filter / sort column exists on property_cards', async () => {
      const have = new Set(await col(db, `SELECT column_name FROM information_schema.columns WHERE table_name = 'property_cards'`));
      const missing = [...usedColumns()].filter((c) => !have.has(c));
      expect(missing).toEqual([]);
    });

    it('every field toProperty reads exists on property_details', async () => {
      const have = new Set(await col(db, `SELECT column_name FROM information_schema.columns WHERE table_name = 'property_details'`));
      const read = new Set<string>();
      const row = new Proxy({} as Record<string, unknown>, {
        get: (_t, key: string) => (read.add(key), undefined),
        has: (_t, key: string) => (read.add(key), false),
      });
      toProperty(row);
      const missing = [...read].filter((c) => !have.has(c));
      expect(missing).toEqual([]);
    });

    it('filter columns are of the types the query layer assumes', async () => {
      const q = async (c: string) =>
        (await db.query<{ data_type: string }>(`SELECT data_type FROM information_schema.columns WHERE table_name='property_cards' AND column_name='${c}'`)).rows[0]?.data_type;
      expect(await q('bhk_options')).toBe('ARRAY');
      expect(await q('amenity_slugs')).toBe('ARRAY');
      expect(await q('price')).toBe('numeric');
      expect(await q('rera_registered')).toBe('boolean');
    });
  });

  describe('seed data', () => {
    it('covers all four categories', async () => {
      const cats = await col(db, 'SELECT DISTINCT category::text FROM property_cards ORDER BY 1');
      expect(cats).toEqual([...CATEGORY_SLUGS].sort());
    });
    it('is idempotent', async () => {
      const before = (await db.query<{ n: number }>('SELECT count(*)::int n FROM properties')).rows[0].n;
      await db.exec(SEED);
      const after = (await db.query<{ n: number }>('SELECT count(*)::int n FROM properties')).rows[0].n;
      expect(after).toBe(before);
    });
    it('property_filter_facets agrees with the data', async () => {
      const { rows } = await db.query<{ f: { total: number; categories: Record<string, number> } }>('SELECT property_filter_facets() AS f');
      const total = (await db.query<{ n: number }>('SELECT count(*)::int n FROM property_cards')).rows[0].n;
      expect(rows[0].f.total).toBe(total);
      expect(Object.values(rows[0].f.categories).reduce((a, b) => a + b, 0)).toBe(total);
    });
    it('bhk_options includes configuration BHKs', async () => {
      const { rows } = await db.query<{ bhk_options: number[] }>(`SELECT bhk_options FROM property_cards WHERE slug = 'skyline-oasis-omr'`);
      expect(rows[0].bhk_options).toEqual([2, 3]);
    });
    it('search_text is populated', async () => {
      const { rows } = await db.query<{ n: number }>(`SELECT count(*)::int n FROM property_cards WHERE search_text LIKE '%velachery%'`);
      expect(rows[0].n).toBeGreaterThan(0);
    });
    it('autocomplete queries (same columns as repository.getSuggestions) yield suggestions', async () => {
      const q = async (sql: string) => (await db.query(sql)).rows as never[];
      const suggestions = buildSuggestions('vel', {
        projects: await q(`SELECT slug,title,category,featured,exclusive,locality,city FROM property_cards WHERE title ILIKE '%vel%' LIMIT 8`),
        localities: await q(`SELECT locality,locality_slug,city,city_slug FROM property_cards WHERE locality ILIKE '%vel%' LIMIT 300`),
        builders: await q(`SELECT builder,builder_slug FROM property_cards WHERE builder ILIKE '%vel%' LIMIT 300`),
      });
      expect(suggestions.some((x) => x.type === 'locality' && x.label === 'Velachery')).toBe(true);
    });
  });

  describe('data integrity', () => {
    const attempt = async (sql: string) => {
      try {
        await db.exec(sql);
        return null;
      } catch (e) {
        return (e as Error).message;
      }
    };
    const insert = (over: Record<string, string>) => {
      const v = {
        slug: `t-${Math.random().toString(36).slice(2)}`,
        category: `'flat-apartment'`,
        subtype: 'NULL',
        possession: `'ready-to-move'`,
        bedrooms: '2',
        locality: `(SELECT id FROM localities WHERE slug = 'velachery')`,
        city: `(SELECT id FROM cities WHERE slug = 'chennai')`,
        ...over,
      };
      return `INSERT INTO properties (slug, title, category, subtype, city_id, locality_id, price_min, area_min_sqft, area_max_sqft, bedrooms, possession, cover_image_url)
              VALUES ('${v.slug}', 'T', ${v.category}, ${v.subtype}, ${v.city}, ${v.locality}, 100, 100, 100, ${v.bedrooms}, ${v.possession}, '/x.jpg')`;
    };

    it('accepts a valid listing', async () => expect(await attempt(insert({}))).toBeNull());
    it('rejects bedrooms on a plot', async () =>
      expect(await attempt(insert({ category: `'residential-plot'`, bedrooms: '3' }))).toMatch(/rooms_only_for_homes/));
    it('rejects ready-to-build for non-plots', async () =>
      expect(await attempt(insert({ possession: `'ready-to-build'` }))).toMatch(/ready_to_build_only_plots/));
    it('rejects a locality that belongs to another city', async () =>
      expect(await attempt(insert({ city: `(SELECT id FROM cities WHERE slug = 'bengaluru')` }))).toMatch(/locality_in_city/));
    it('rejects a subtype of another category', async () =>
      expect(await attempt(insert({ subtype: `'warehouse'` }))).toMatch(/does not belong to category/));
    it('rejects a reversed area range', async () =>
      expect(await attempt(insert({}).replace('100, 100, 100', '100, 500, 100'))).toMatch(/area_range/));

    it('hides drafts from the read views', async () => {
      await db.exec(`UPDATE properties SET publish_status = 'draft' WHERE slug = 'skyline-oasis-omr'`);
      const { rows } = await db.query<{ n: number }>(`SELECT count(*)::int n FROM property_cards WHERE slug = 'skyline-oasis-omr'`);
      expect(rows[0].n).toBe(0);
      await db.exec(`UPDATE properties SET publish_status = 'published' WHERE slug = 'skyline-oasis-omr'`);
    });
  });

  describe('security model', () => {
    const asAnon = async (sql: string) => {
      await db.exec('SET ROLE anon');
      try {
        await db.exec(sql);
        return null;
      } catch (e) {
        return (e as Error).message;
      } finally {
        await db.exec('RESET ROLE');
      }
    };
    it('anon can read the listing views', async () => {
      await db.exec('SET ROLE anon');
      const { rows } = await db.query<{ n: number }>('SELECT count(*)::int n FROM property_cards');
      await db.exec('RESET ROLE');
      expect(rows[0].n).toBeGreaterThan(0);
    });
    it('anon cannot write listings', async () => {
      expect(await asAnon(`DELETE FROM properties`)).toMatch(/permission denied/);
      expect(await asAnon(`UPDATE properties SET featured = true`)).toMatch(/permission denied/);
    });
    it('anon cannot read or write leads', async () => {
      expect(await asAnon(`SELECT * FROM leads`)).toMatch(/permission denied/);
      expect(await asAnon(`INSERT INTO leads (kind, phone) VALUES ('enquiry', '9999999999')`)).toMatch(/permission denied/);
    });
    it('leads must be reachable (phone or email)', async () => {
      await expect(db.exec(`INSERT INTO leads (kind, name) VALUES ('contact', 'x')`)).rejects.toThrow(/leads_reachable/);
      await db.exec(`INSERT INTO leads (kind, email) VALUES ('newsletter', 'a@b.co')`);
    });
    it('inquiries view: readable rows, hidden from the public', async () => {
      await db.exec(`INSERT INTO leads (kind, name, phone, payload, email_status, email_error)
                     VALUES ('post-property', 'Kumar', '9876543210', '{"projectName":"Green Acres","location":"Medavakkam"}', 'failed', 'Invalid login')`);
      const r = await db.query<Record<string, string>>(`SELECT type, name, details, email_status, email_error FROM inquiries WHERE name = 'Kumar'`);
      expect(r.rows[0].type).toBe('Post property');
      expect(r.rows[0].details).toBe('location: Medavakkam\nprojectName: Green Acres');
      expect(r.rows[0].email_status).toBe('failed');
      expect(await asAnon(`SELECT * FROM inquiries`)).toMatch(/permission denied/);
      await expect(db.exec(`UPDATE leads SET status = 'bogus'`)).rejects.toThrow(/leads_status_valid/);
    });
  });
});

describe('upgrade path from the legacy single-table schema', () => {
  let db: PGlite;
  beforeAll(async () => {
    db = await freshDb(async (d) => {
      await d.exec(`
        INSERT INTO properties (title, slug, city, locality, property_type, listing_type, price, bedrooms, bathrooms,
                                min_area_sqft, max_area_sqft, image_url, gallery, amenities, furnishing, parking, builder_name, rera_id, featured, status)
        VALUES
          ('Legacy Apt',  'legacy-apt',  'Chennai',   'Velachery',   'Apartment', 'Buy',  7500000, 2, 2, 900, 1100, '/x.jpg', ARRAY['/g1.jpg'], ARRAY['Gym','Lift'], 'Semi-Furnished', 1, 'Acme', 'TN/1', true,  'Under Construction'),
          ('Legacy Plot', 'legacy-plot', 'Chennai',   'Kelambakkam', 'Plot',      'Buy',  2500000, NULL, NULL, 1200, 1200, '/p.jpg', NULL, NULL, 'Unfurnished', 0, 'Acme', NULL, false, 'Ready to Move'),
          ('Legacy Rent', 'legacy-rent', 'Bengaluru', 'Whitefield',  'Apartment', 'Rent', 40000,   2, 2, 900, 900,  '/r.jpg', NULL, NULL, 'Unfurnished', 0, NULL,   NULL, false, 'Ready to Move');
      `);
    });
  });
  afterAll(() => db.close());

  it('migrates Buy rows into the new schema and maps vocabulary', async () => {
    const { rows } = await db.query<Record<string, string>>(
      `SELECT slug, category::text, subtype, possession::text, furnishing_slug::text AS furn, builder FROM property_cards ORDER BY slug`,
    );
    expect(rows).toEqual([
      { slug: 'legacy-apt', category: 'flat-apartment', subtype: 'apartment', possession: 'under-construction', furn: 'semi-furnished', builder: 'Acme' },
      { slug: 'legacy-plot', category: 'residential-plot', subtype: 'plot', possession: 'ready-to-move', furn: null, builder: 'Acme' },
    ]);
  });

  it('does not migrate Rent rows, but keeps them in properties_legacy', async () => {
    expect((await col(db, `SELECT slug FROM property_cards WHERE slug = 'legacy-rent'`)).length).toBe(0);
    expect((await db.query<{ n: number }>('SELECT count(*)::int n FROM properties_legacy')).rows[0].n).toBe(3);
  });

  it('carries amenities and gallery across', async () => {
    const { rows } = await db.query<{ amenity_slugs: string[]; gallery: string[] }>(
      `SELECT amenity_slugs, gallery FROM property_details WHERE slug = 'legacy-apt'`,
    );
    expect(rows[0].amenity_slugs).toEqual(['gym', 'lift']);
    expect(rows[0].gallery).toEqual(['/g1.jpg']);
  });

  it('removes the legacy public-write policies', async () => {
    const { rows } = await db.query<{ n: number }>(`SELECT count(*)::int n FROM pg_policies WHERE tablename = 'properties_legacy'`);
    expect(rows[0].n).toBe(0);
  });
});

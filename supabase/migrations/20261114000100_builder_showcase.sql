/*
  # Builder showcase fields

  The home page "Trusted Builders" carousel shows every active builder that has a logo, a tagline
  and at least one published listing. Add a builder to the carousel by filling in `tagline`
  (and optionally `badges`) on its row in the `builders` table - no code change needed.

  Idempotent. The four builders below are seeded only where the field is still empty.
*/

ALTER TABLE builders ADD COLUMN IF NOT EXISTS tagline text;
ALTER TABLE builders ADD COLUMN IF NOT EXISTS badges  text[] NOT NULL DEFAULT '{}';
-- lower number = earlier in the carousel
ALTER TABLE builders ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 100;

UPDATE builders SET tagline = 'Trusted developer in Chennai',
                    badges  = ARRAY['RERA','CMDA','ISO Certified'], sort_order = 10
 WHERE slug = 'arun-excello' AND tagline IS NULL;
UPDATE builders SET tagline = '47 years of legacy',
                    badges  = ARRAY['RERA','CMDA','ISO Certified'], sort_order = 20
 WHERE slug = 'malles-constructions' AND tagline IS NULL;
UPDATE builders SET tagline = 'Signature residences offering comfort and elegance',
                    badges  = ARRAY['Signature Homes','Prime Locations'], sort_order = 30
 WHERE slug = 'harmony-homes' AND tagline IS NULL;
UPDATE builders SET tagline = 'Thoughtful Planning, Exceptional Results',
                    badges  = ARRAY['Signature Homes','Prime Locations'], sort_order = 40
 WHERE slug = 'kkr-builders' AND tagline IS NULL;

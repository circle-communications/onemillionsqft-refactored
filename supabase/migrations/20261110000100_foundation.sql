/*
  # Foundation: extensions, enums, helpers

  Retires the original single-table design. Any existing `properties` table in the
  legacy shape (flat text columns, anon write policies) is renamed to
  `properties_legacy`; its rows are migrated into the normalized schema by
  20261110000500_migrate_legacy_data.sql.

  Scope: BUY-only listings for four categories
    flat-apartment | independent-villa | residential-plot | commercial-space

  One vocabulary: every enum label below is the exact slug used in URLs and TypeScript
  (see lib/constants/property.ts).
*/

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Retire the legacy table (idempotent: only when it still has the old shape).
DO $$
BEGIN
  IF to_regclass('public.properties_legacy') IS NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'listing_type'
     )
  THEN
    ALTER TABLE public.properties RENAME TO properties_legacy;
    -- free the index / policy names so the new objects can reuse them
    ALTER INDEX IF EXISTS idx_properties_city          RENAME TO idx_properties_legacy_city;
    ALTER INDEX IF EXISTS idx_properties_type          RENAME TO idx_properties_legacy_type;
    ALTER INDEX IF EXISTS idx_properties_listing_type  RENAME TO idx_properties_legacy_listing_type;
    ALTER INDEX IF EXISTS idx_properties_price         RENAME TO idx_properties_legacy_price;
    ALTER INDEX IF EXISTS idx_properties_bedrooms      RENAME TO idx_properties_legacy_bedrooms;
    ALTER INDEX IF EXISTS idx_properties_featured      RENAME TO idx_properties_legacy_featured;
    ALTER INDEX IF EXISTS idx_properties_exclusive     RENAME TO idx_properties_legacy_exclusive;
    -- the legacy table must never be publicly writable again
    DROP POLICY IF EXISTS "anon_select_properties" ON public.properties_legacy;
    DROP POLICY IF EXISTS "anon_insert_properties" ON public.properties_legacy;
    DROP POLICY IF EXISTS "anon_update_properties" ON public.properties_legacy;
    DROP POLICY IF EXISTS "anon_delete_properties" ON public.properties_legacy;
    ALTER TABLE public.properties_legacy ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ BEGIN
  CREATE TYPE property_category AS ENUM (
    'flat-apartment', 'independent-villa', 'residential-plot', 'commercial-space'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE possession_status AS ENUM ('ready-to-move', 'under-construction', 'ready-to-build');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE furnishing_status AS ENUM ('unfurnished', 'semi-furnished', 'fully-furnished');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE facing_direction AS ENUM (
    'north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE publish_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lead_kind AS ENUM ('contact', 'enquiry', 'post-property');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION slugify(input text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' from regexp_replace(lower(trim(input)), '[^a-z0-9]+', '-', 'g'))
$$;

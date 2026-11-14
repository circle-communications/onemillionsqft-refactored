/*
  # Leads: newsletter signups, optional name, lookup indexes

  - `lead_kind` gains 'newsletter' (footer signup stores just an email).
  - `name` becomes nullable: the sticky "call me back" bar and the newsletter form do not ask for one.
  - Every lead must still be reachable: a phone or an email is required.
  - Public clients can neither read nor write this table (RLS on, no policies); only the Next.js
    API routes, using the service-role key, insert rows.
*/

ALTER TYPE lead_kind ADD VALUE IF NOT EXISTS 'newsletter';

ALTER TABLE leads ALTER COLUMN name DROP NOT NULL;

DO $$ BEGIN
  ALTER TABLE leads ADD CONSTRAINT leads_reachable CHECK (phone IS NOT NULL OR email IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_leads_property ON leads (property_id) WHERE property_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads (status, created_at DESC);

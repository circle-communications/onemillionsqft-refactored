/*
  # Inquiries inbox

  Every form submission is stored in `leads` (raw). This adds:
    - email delivery columns on `leads`, so you can see whether the notification email went out
      and, if not, why (`email_status` = sent | failed | not-configured, `email_error`);
    - a readable `inquiries` view: one row per submission with the form type, the contact
      details, the property title, a flattened summary of the form fields and the email result.
      Open it under Table Editor -> inquiries (views are listed there too).

  Work through the inbox by editing `leads.status` (new -> contacted -> closed).
  Nothing here is readable by the public site: RLS stays on, no policies, service role only.
*/

ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_status text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_error  text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS emailed_at   timestamptz;

DO $$ BEGIN
  ALTER TABLE leads ADD CONSTRAINT leads_status_valid CHECK (status IN ('new', 'contacted', 'closed', 'spam'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE VIEW inquiries WITH (security_invoker = true) AS
SELECT
  l.created_at,
  CASE l.kind::text
    WHEN 'enquiry'       THEN CASE WHEN l.payload->>'source' = 'callback-bar' THEN 'Call-back request'
                                   WHEN l.property_id IS NOT NULL            THEN 'Property enquiry'
                                   ELSE 'General enquiry' END
    WHEN 'contact'       THEN 'Contact form'
    WHEN 'post-property' THEN 'Post property'
    WHEN 'newsletter'    THEN 'Newsletter signup'
    ELSE l.kind::text
  END                                              AS type,
  l.status,
  l.name,
  l.phone,
  l.email,
  p.title                                          AS property,
  p.slug                                           AS property_slug,
  l.message,
  (SELECT string_agg(e.key || ': ' || e.value, E'\n' ORDER BY e.key)
     FROM jsonb_each_text(l.payload) e
    WHERE e.key <> 'source')                       AS details,
  l.source_url,
  l.email_status,
  l.email_error,
  l.id
FROM leads l
LEFT JOIN properties p ON p.id = l.property_id
ORDER BY l.created_at DESC;

REVOKE ALL ON inquiries FROM anon, authenticated;

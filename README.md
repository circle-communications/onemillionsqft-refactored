# OneMillionSqFt

Buy-only property portal for Chennai and Bengaluru. Next.js 14 (App Router), Tailwind, Supabase.

Categories: **Flats & Apartments**, **Independent Villas**, **Residential Plots**, **Commercial Spaces**.

## Run it

```bash
cp .env.example .env.local      # fill in the Supabase values
npm install
npm run dev                     # http://localhost:3000
```

Database (Supabase project, empty or existing):

```bash
supabase db push                # applies supabase/migrations in order
psql "$DATABASE_URL" -f supabase/seed.sql   # optional: sample listings, dev/staging only
```

To load the listings exported from the pre-refactor project, run `supabase/import/legacy_properties.sql`
in the SQL editor after the migrations (one time; safe to re-run; Rent rows are skipped).

An existing database with the old single `properties` table is upgraded in place: the old table is
renamed `properties_legacy`, Buy rows are migrated, Rent rows are kept in the legacy table only.

Checks: `npm run typecheck`, `npm run lint`, `npm test` (runs every migration on an in-memory
Postgres), `npm run build`.

## Search architecture

One vocabulary, defined once, used everywhere:

```
lib/constants/property.ts   categories, sub-types, possession, BHK, budget bands, approvals, sorts
        │                   (SQL enums and lookup tables must match; tests/sql.test.ts enforces it)
        ▼
lib/search/filters.ts       URL ⇄ SearchFilters (parse, sanitize, serialize, canonicalQuery)
lib/search/links.ts         typed link builders: the ONLY way to produce /properties?... links
lib/search/query.ts         SearchFilters → PostgREST query on the `property_cards` view
lib/properties/repository.ts  data access (search, facets, featured, detail)
        ▲
header menu · footer · home page · search bar · filter panel · listing page
```

- Header, footer, home page and the filter panel all build links through `lib/search/links.ts`, so a
  link can never offer a filter the listing page doesn't understand.
- Old URLs (`propertyType=Villa`, `type=plots&budget=40l-80l`, `bhk=1rk`, `/listings`) are
  308-redirected by `middleware.ts` to the canonical form, e.g. `/properties?category=independent-villa&city=chennai`.
- Filters that don't apply to the chosen category (bedrooms for plots, etc.) are dropped, not
  silently turned into zero results.
- Price and area are range-overlap filters; BHK matches any configuration a project offers.

## Listing URLs

One URL per listing: `/property/<slug>` (slug is unique; `/properties` is the search/listing page). Category and tier (featured / exclusive) are
data, not part of the URL: `components/property/detail/PropertyDetailView.tsx` picks the layout from
them. Old `/property/featured/...`, `/property/exclusive/...` and `/plot/...` URLs are permanently
redirected to it in `next.config.js`.

## Database

Normalized schema in `supabase/migrations`:

| Migration | Contents |
|---|---|
| `…000100_foundation` | enums, helpers, retires the legacy table |
| `…000200_reference_data` | cities, corridors, localities, builders, sub-types, amenities |
| `…000300_properties` | `properties` plus images, amenities, configurations, floor plans, nearby |
| `…000400_views_and_security` | read views, RLS (public read of published rows only), leads table |
| `…000500_migrate_legacy_data` | moves legacy rows into the new tables |
| `…000100_search_views_and_indexes` | `property_cards` / filter facets, search indexes |
| `…000200_leads_hardening` | lead constraints |

The app reads only the views. Writes (leads, post-property) go through server routes in `app/api`
using `SUPABASE_SERVICE_ROLE_KEY`, which must never be exposed to the browser.

## Scope notes

Rent listings were removed. The home page "Trusted Builders" carousel (`components/home/BuilderCards.tsx`) lists every active builder that has a `logo_url`, a `tagline` and a published listing; fill those in on the `builders` row in Supabase to feature a builder (`badges` and `sort_order` are optional).

## Lead emails

Enquiries, contact, post-property and newsletter submissions are saved to `leads` and then emailed to `LEADS_TO_EMAIL` over SMTP (`lib/mail`). Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `LEADS_TO_EMAIL` (see `.env.example`; for Gmail use an App Password). If they are missing the lead is still saved and a warning is logged; a mail failure never fails the visitor's submission. Reply-To is the visitor's address. Run `npm run test:mail` to send one test email and see the exact SMTP error if it fails. Every submission is also stored in `leads` and shown, with its email result (`email_status`, `email_error`), in the `inquiries` view in Supabase.
(`/sellers/*`, `/builders/*`, `/faq`, …) were removed rather than left as dead links.

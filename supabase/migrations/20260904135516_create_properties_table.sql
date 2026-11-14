/*
# Create properties table for OneMillionSqFt property portal

1. New Tables
- `properties`: Stores all property listings for Chennai and Bengaluru
  - `id` (uuid, primary key)
  - `title` (text, name of the property project/listing)
  - `slug` (text, unique URL-friendly identifier)
  - `city` (text, 'Chennai' or 'Bengaluru')
  - `locality` (text, neighborhood/area within the city)
  - `property_type` (text, 'Apartment', 'Villa', 'Plot', 'Penthouse', 'Independent House')
  - `listing_type` (text, 'Buy' or 'Rent')
  - `price` (numeric, price in INR)
  - `bedrooms` (integer, number of bedrooms, nullable for plots)
  - `bathrooms` (integer, number of bathrooms, nullable for plots)
  - `area_sqft` (integer, built-up area in square feet)
  - `description` (text, detailed property description)
  - `image_url` (text, main exterior/cover image URL)
  - `gallery` (text[], array of interior/gallery image URLs)
  - `amenities` (text[], array of amenity names)
  - `furnishing` (text, 'Fully Furnished', 'Semi-Furnished', 'Unfurnished')
  - `parking` (integer, number of car parking spaces)
  - `floor_number` (integer, floor the unit is on, nullable)
  - `total_floors` (integer, total floors in the building, nullable)
  - `age_years` (integer, age of property in years)
  - `builder` (text, developer/builder name)
  - `rera_id` (text, RERA registration ID)
  - `featured` (boolean, whether to show on homepage)
  - `status` (text, 'Ready to Move' or 'Under Construction')
  - `created_at` (timestamptz, record creation timestamp)

2. Security
- Enable RLS on `properties`.
- Allow anon + authenticated to read all properties (public browsing, no sign-in).
- Allow anon + authenticated to insert/update/delete (admin management without auth for demo).

3. Indexes
- Index on `city` for city-based filtering
- Index on `property_type` for type filtering
- Index on `listing_type` for buy/rent filtering
- Index on `price` for budget filtering
- Index on `bedrooms` for bedroom filtering
*/

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  city text NOT NULL,
  locality text NOT NULL,
  property_type text NOT NULL,
  listing_type text NOT NULL DEFAULT 'Buy',
  price numeric NOT NULL,
  -- bedrooms integer,
  bedrooms integer,
  bathrooms integer,
  -- area_sqft integer NOT NULL,
  min_area_sqft integer NOT NULL,
  max_area_sqft integer NOT NULL,
  project_description text,
  image_url text NOT NULL,
  gallery text[],
  amenities text[],
  furnishing text DEFAULT 'Unfurnished',
  parking integer DEFAULT 0,
  floor_number integer,
  total_floors integer,
  age_years integer DEFAULT 0,
  builder_name text,
  builder_logo text,
  builder_description text,
  rera_id text,
  featured boolean DEFAULT false,
  exclusive boolean DEFAULT false,
  status text DEFAULT 'Ready to Move',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_properties" ON properties;
CREATE POLICY "anon_select_properties" ON properties FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_properties" ON properties;
CREATE POLICY "anon_insert_properties" ON properties FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_properties" ON properties;
CREATE POLICY "anon_update_properties" ON properties FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_properties" ON properties;
CREATE POLICY "anon_delete_properties" ON properties FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_exclusive ON properties(exclusive);

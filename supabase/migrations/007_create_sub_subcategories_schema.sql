-- Create sub_subcategories table linked to subcategories
CREATE TABLE IF NOT EXISTS sub_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subcategory_id, slug)
);

-- Enable RLS for the new table
ALTER TABLE sub_subcategories ENABLE ROW LEVEL SECURITY;

-- Public read access (Idempotent)
DROP POLICY IF EXISTS "Sub_subcategories are viewable by everyone" ON sub_subcategories;
CREATE POLICY "Sub_subcategories are viewable by everyone" ON sub_subcategories
  FOR SELECT USING (true);

-- Add sub_subcategory_id to listings table (Idempotent check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'sub_subcategory_id') THEN
        ALTER TABLE listings ADD COLUMN sub_subcategory_id UUID REFERENCES sub_subcategories(id);
    END IF;
END $$;

-- Add index (Idempotent)
DROP INDEX IF EXISTS idx_listings_sub_subcategory;
CREATE INDEX idx_listings_sub_subcategory ON listings(sub_subcategory_id);

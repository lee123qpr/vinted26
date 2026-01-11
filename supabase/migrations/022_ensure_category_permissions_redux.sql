-- Redundant check to ensure Category Taxonomy tables are publicly readable
-- This handles cases where previous migrations might have been reset or not applied correctly.

-- 1. Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- 2. Subcategories
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Subcategories are viewable by everyone" ON subcategories;
CREATE POLICY "Subcategories are viewable by everyone" ON subcategories FOR SELECT USING (true);

-- 3. Sub-Subcategories
ALTER TABLE sub_subcategories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sub_subcategories are viewable by everyone" ON sub_subcategories;
CREATE POLICY "Sub_subcategories are viewable by everyone" ON sub_subcategories FOR SELECT USING (true);

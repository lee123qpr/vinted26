-- Fix permissions for Category Taxonomy tables
-- Ensure they are publicly readable so the "List Item" form can populate dropdowns.

-- 1. Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- 2. Subcategories
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Subcategories are viewable by everyone" ON subcategories;
CREATE POLICY "Subcategories are viewable by everyone" ON subcategories
  FOR SELECT USING (true);

-- 3. Sub-Subcategories (Redundant check to be safe)
ALTER TABLE sub_subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sub_subcategories are viewable by everyone" ON sub_subcategories;
CREATE POLICY "Sub_subcategories are viewable by everyone" ON sub_subcategories
  FOR SELECT USING (true);

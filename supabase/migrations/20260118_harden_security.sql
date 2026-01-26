-- Fix function_search_path_mutable warnings by explicitly setting search_path
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- 1. update_updated_at_column
ALTER FUNCTION update_updated_at_column() SET search_path = public;

-- 2. update_seller_rating
ALTER FUNCTION update_seller_rating() SET search_path = public;

-- 3. increment_listing_views
ALTER FUNCTION increment_listing_views() SET search_path = public;

-- 4. increment_view_count
ALTER FUNCTION increment_view_count(UUID) SET search_path = public;

-- 5. search_listings
ALTER FUNCTION search_listings(
  TEXT,    -- search_query
  TEXT,    -- category_filter
  NUMERIC, -- min_price
  NUMERIC, -- max_price
  NUMERIC, -- lat
  NUMERIC, -- lng
  INT,     -- radius_miles
  INT,     -- limit_val
  INT      -- offset_val
) SET search_path = public;

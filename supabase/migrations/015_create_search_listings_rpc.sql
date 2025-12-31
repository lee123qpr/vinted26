-- Drop function if it exists to allow updates
DROP FUNCTION IF EXISTS search_listings;

CREATE OR REPLACE FUNCTION search_listings(
  search_query TEXT DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  min_price NUMERIC DEFAULT NULL,
  max_price NUMERIC DEFAULT NULL,
  lat NUMERIC DEFAULT NULL,
  lng NUMERIC DEFAULT NULL,
  radius_miles INT DEFAULT NULL,
  limit_val INT DEFAULT 20,
  offset_val INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price_gbp NUMERIC,
  is_free BOOLEAN,
  postcode_area TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  condition TEXT,
  category_id TEXT, -- Keep as TEXT if mixed, but usually it is UUID in DB. Let's cast in WHERE.
  subcategory_id TEXT,
  sub_subcategory_id TEXT,
  seller_id UUID,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  include_carbon_certificate BOOLEAN,
  calculated_weight_kg NUMERIC,
  listing_material_id UUID,
  dimensions_unit TEXT,
  distance_miles NUMERIC,
  images JSON
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.title,
    l.description,
    l.price_gbp,
    l.is_free,
    l.postcode_area,
    l.location_lat as latitude,
    l.location_lng as longitude,
    l.condition,
    l.category_id::TEXT, -- Cast UUID to TEXT for return matching
    l.subcategory_id::TEXT,
    l.sub_subcategory_id::TEXT,
    l.seller_id,
    l.status,
    l.created_at,
    l.updated_at,
    l.include_carbon_certificate,
    l.calculated_weight_kg,
    l.listing_material_id,
    l.dimensions_unit,
    CASE
      WHEN lat IS NOT NULL AND lng IS NOT NULL AND l.location_lat IS NOT NULL AND l.location_lng IS NOT NULL THEN
        (3959 * acos(cos(radians(lat)) * cos(radians(l.location_lat)) * cos(radians(l.location_lng) - radians(lng)) + sin(radians(lat)) * sin(radians(l.location_lat))))::NUMERIC
      ELSE NULL::NUMERIC
    END AS distance_miles,
    (SELECT json_agg(json_build_object('image_url', li.image_url, 'sort_order', li.sort_order)) FROM listing_images li WHERE li.listing_id = l.id) AS images
  FROM listings l
  WHERE l.status = 'active'
    AND (search_query IS NULL OR l.title ILIKE '%' || search_query || '%' OR l.description ILIKE '%' || search_query || '%')
    AND (
      category_filter IS NULL
      -- Cast DB UUID columns to TEXT for comparison if input is TEXT, or cast input to UUID if valid.
      -- Casting DB columns to TEXT is safer if we don't validate the input format.
      OR l.category_id::TEXT = category_filter
      OR l.subcategory_id::TEXT = category_filter
      OR l.sub_subcategory_id::TEXT = category_filter
    )
    AND (min_price IS NULL OR l.price_gbp >= min_price)
    AND (max_price IS NULL OR l.price_gbp <= max_price)
    AND (lat IS NULL OR lng IS NULL OR radius_miles IS NULL OR (l.location_lat IS NOT NULL AND l.location_lng IS NOT NULL AND (3959 * acos(cos(radians(lat)) * cos(radians(l.location_lat)) * cos(radians(l.location_lng) - radians(lng)) + sin(radians(lat)) * sin(radians(l.location_lat)))) <= radius_miles))
  ORDER BY
    CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN (3959 * acos(cos(radians(lat)) * cos(radians(l.location_lat)) * cos(radians(l.location_lng) - radians(lng)) + sin(radians(lat)) * sin(radians(l.location_lat)))) END ASC NULLS LAST,
    l.created_at DESC
  LIMIT limit_val OFFSET offset_val;
END;
$$;

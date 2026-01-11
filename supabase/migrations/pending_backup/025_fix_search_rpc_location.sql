
-- Re-create search_listings RPC to ensure location columns are returned
CREATE OR REPLACE FUNCTION search_listings(
    search_query text DEFAULT null,
    category_filter uuid DEFAULT null,
    min_price numeric DEFAULT null,
    max_price numeric DEFAULT null,
    lat float DEFAULT null,
    lng float DEFAULT null,
    radius_miles int DEFAULT null,
    limit_val int DEFAULT 50,
    offset_val int DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    title text,
    price_gbp numeric,
    is_free boolean,
    condition text,
    postcode_area text,
    location_lat float,
    location_lng float,
    created_at timestamptz,
    distance_miles float,
    images jsonb,
    carbon_saved_kg numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.title,
        l.price_gbp,
        l.is_free,
        l.condition,
        l.postcode_area,
        l.location_lat,
        l.location_lng,
        l.created_at,
        -- Calculate distance if lat/lng provided
        CASE
            WHEN lat IS NOT NULL AND lng IS NOT NULL AND l.location_lat IS NOT NULL AND l.location_lng IS NOT NULL THEN
                (point(l.location_lng, l.location_lat) <@> point(lng, lat))
            ELSE
                NULL::float
        END as distance_miles,
        -- Aggregate images
        (
            SELECT jsonb_agg(jsonb_build_object('image_url', li.image_url, 'sort_order', li.sort_order))
            FROM listing_images li
            WHERE li.listing_id = l.id
        ) as images,
        l.carbon_saved_kg
    FROM
        listings l
    WHERE
        l.status = 'active'
        AND (
            category_filter IS NULL 
            OR l.category_id = category_filter 
            OR l.subcategory_id = category_filter 
            OR l.sub_subcategory_id = category_filter
        )
        AND (
            search_query IS NULL 
            OR l.title ILIKE '%' || search_query || '%' 
            OR l.description ILIKE '%' || search_query || '%'
        )
        AND (min_price IS NULL OR l.price_gbp >= min_price)
        AND (max_price IS NULL OR l.price_gbp <= max_price)
        AND (
            lat IS NULL OR lng IS NULL OR radius_miles IS NULL OR
             (point(l.location_lng, l.location_lat) <@> point(lng, lat)) <= radius_miles
        )
    ORDER BY
        l.created_at DESC
    LIMIT limit_val OFFSET offset_val;
END;
$$;

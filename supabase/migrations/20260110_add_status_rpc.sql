-- Secure RPC to get listing status (Bypasses RLS)
CREATE OR REPLACE FUNCTION get_listing_status(listing_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as database owner (bypasses RLS)
SET search_path = public -- Security best practice
AS $$
DECLARE
  status_text text;
BEGIN
  SELECT status INTO status_text
  FROM listings
  WHERE id = listing_uuid;
  
  RETURN status_text;
END;
$$;

GRANT EXECUTE ON FUNCTION get_listing_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_listing_status(uuid) TO anon;

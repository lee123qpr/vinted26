-- Force enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- 1. Grant Access (Ensure no weird column logic blocks it)
GRANT SELECT ON TABLE public.listings TO authenticated;
GRANT SELECT ON TABLE public.listings TO anon;

-- 2. "Public/Active" Policy (Everyone sees active)
DROP POLICY IF EXISTS "Public can view active listings" ON listings;
CREATE POLICY "Public can view active listings"
ON listings FOR SELECT
USING (status = 'active');

-- 3. "Buyer/Purchased" Policy (Mirror Image fix)
DROP POLICY IF EXISTS "Buyers can view purchased listings" ON listings;
CREATE POLICY "Buyers can view purchased listings"
ON listings FOR SELECT
USING (
    exists (
        SELECT 1 FROM transactions 
        WHERE transactions.listing_id = listings.id 
        AND transactions.buyer_id = auth.uid()
    )
);

-- 4. "Seller/Own" Policy
DROP POLICY IF EXISTS "Sellers can view own listings" ON listings;
CREATE POLICY "Sellers can view own listings"
ON listings FOR SELECT
USING (auth.uid() = seller_id);

-- 5. Explicitly notify schema reload
NOTIFY pgrst, 'reload schema';

-- 1. Ensure RLS is enabled
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- 2. Transactions Policies
DROP POLICY IF EXISTS "Buyers can view their own transactions" ON transactions;
CREATE POLICY "Buyers can view their own transactions" 
ON transactions FOR SELECT 
USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Sellers can view their own transactions" ON transactions;
CREATE POLICY "Sellers can view their own transactions" 
ON transactions FOR SELECT 
USING (auth.uid() = seller_id);

-- 3. Listings Policies (The Critical Part)
-- Allow anyone to view 'active' listings (probably already exists, but safe to ensure)
DROP POLICY IF EXISTS "Public can view active listings" ON listings;
CREATE POLICY "Public can view active listings" 
ON listings FOR SELECT 
USING (status = 'active');

-- Allow Buyers to view listings they have purchased, even if 'sold'
-- This solves the "Mirror Image" issue where the seller sees it (owner) but buyer couldn't
DROP POLICY IF EXISTS "Buyers can view purchased listings" ON listings;
CREATE POLICY "Buyers can view purchased listings" 
ON listings FOR SELECT 
USING (
    existS (
        SELECT 1 FROM transactions 
        WHERE transactions.listing_id = listings.id 
        AND transactions.buyer_id = auth.uid()
    )
);

-- 4. Ensure Sellers can view their own listings (regardless of status)
DROP POLICY IF EXISTS "Sellers can view own listings" ON listings;
CREATE POLICY "Sellers can view own listings" 
ON listings FOR SELECT 
USING (auth.uid() = seller_id);

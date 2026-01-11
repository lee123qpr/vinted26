
-- Policy: Sellers can update offers on their listings
-- Using a join or exists check to verify the auth user owns the listing related to the offer.
create policy "Sellers can update offers on sent to them"
on offers for update
using (
  exists (
    select 1 from listings
    where listings.id = offers.listing_id
    and listings.seller_id = auth.uid()
  )
);

-- Policy: Buyers can update their own offers (e.g. to accept a counter offer)
create policy "Buyers can update their own offers"
on offers for update
using (
  auth.uid() = buyer_id
);

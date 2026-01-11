-- Allow buyers to view listings they have purchased, even if status is 'sold'
-- This fixes the issue where orders disappear or look broken because the underlying listing is no longer 'active' (public).

create policy "Buyers can view purchased listings"
  on listings
  for select
  using (
    exists (
      select 1 from transactions
      where transactions.listing_id = listings.id
      and transactions.buyer_id = auth.uid()
    )
  );

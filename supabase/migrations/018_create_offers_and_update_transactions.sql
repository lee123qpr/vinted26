-- Create Offers Table
create type offer_status as enum ('pending', 'accepted', 'rejected', 'countered', 'expired');

create table offers (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references listings(id) on delete cascade not null,
  buyer_id uuid references profiles(id) on delete cascade not null,
  amount_gbp decimal(10,2) not null check (amount_gbp > 0),
  status offer_status default 'pending' not null,
  expires_at timestamptz default (now() + interval '24 hours') not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS for Offers
alter table offers enable row level security;

-- Buyers can create offers
create policy "Buyers can insert their own offers"
  on offers for insert
  with check (auth.uid() = buyer_id);

-- Buyers can view their own offers
create policy "Buyers can view their own offers"
  on offers for select
  using (auth.uid() = buyer_id);

-- Sellers can view offers on their listings
create policy "Sellers can view offers on their listings"
  on offers for select
  using (exists (
    select 1 from listings
    where listings.id = offers.listing_id
    and listings.seller_id = auth.uid()
  ));

-- Listings Updates (Courier)
alter table listings add column courier_delivery_available boolean default false;
alter table listings add column courier_delivery_cost_gbp decimal(10,2);

-- Transaction Updates (Escrow & Disputes)
create type escrow_status as enum ('held', 'released', 'refunded', 'dispute_open');

alter table transactions add column stripe_payment_intent_id text;
alter table transactions add column escrow_status escrow_status default 'held';
alter table transactions add column dispute_reason text;
alter table transactions add column dispute_evidence jsonb default '[]'::jsonb;
alter table transactions add column delivered_at timestamptz;
alter table transactions add column accepted_at timestamptz;

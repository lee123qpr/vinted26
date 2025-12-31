-- Create favourites table
create table public.favourites (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  constraint favourites_pkey primary key (id),
  constraint favourites_user_id_listing_id_key unique (user_id, listing_id)
);

-- Enable RLS
alter table public.favourites enable row level security;

-- Policies
create policy "Users can view their own favourites" on public.favourites
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favourites" on public.favourites
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favourites" on public.favourites
  for delete
  using (auth.uid() = user_id);

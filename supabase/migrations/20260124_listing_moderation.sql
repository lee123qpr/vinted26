-- Migration: 20260124_listing_moderation.sql
-- Purpose: Add Reports system and Auto-Moderation for listings.

-- 1. Create Reports Table
create table if not exists public.reports (
    id uuid not null default gen_random_uuid() primary key,
    listing_id uuid references public.listings(id) on delete cascade not null,
    reporter_id uuid references auth.users(id) on delete set null, -- Optional (anon reports?)
    reason text not null,
    status text not null default 'pending', -- pending, resolved, dismissed
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- RLS for Reports
alter table public.reports enable row level security;

-- Admin can view all
create policy "Admins can view all reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.is_admin = true
    )
  );

-- Admin can update reports (resolve them)
create policy "Admins can update reports"
  on public.reports for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.is_admin = true
    )
  );

-- Users can create reports (authenticated only for now to prevent spam)
create policy "Users can insert reports"
  on public.reports for insert
  with check ((select auth.uid()) is not null);


-- 2. Auto-Moderation Trigger
-- Function to check for keywords/patterns
create or replace function public.auto_flag_listing()
returns trigger
language plpgsql
security definer
as $$
declare
    text_content text;
begin
    -- Concatenate title and description for checking
    text_content := lower(coalesce(new.title, '') || ' ' || coalesce(new.description, ''));

    -- Check for UK Mobile Phone Numbers (Basic regex for 07xxx xxxxxx or 07xxx-xxxxxx)
    -- This is a simple heuristic, might catch some false positives but safer for moderation.
    if text_content ~* '(07\d{3}\s*\d{6})|(07\d{3}\s*\d{3}\s*\d{3})|(\+44\s?7\d{3}\s?\d{6})' then
        new.status := 'flagged';
    end if;

    -- Check for Email Addresses
    if text_content ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' then
        new.status := 'flagged';
    end if;

    -- Check for Scam Keywords
    if text_content similar to '%(bank transfer|western union|paypal friends|cash app)%' then
        new.status := 'flagged';
    end if;

    return new;
end;
$$;

-- Create Trigger on Assignments (Insert and Update)
drop trigger if exists on_listing_created_check_safety on public.listings;
create trigger on_listing_created_check_safety
    before insert or update of title, description
    on public.listings
    for each row
    execute function public.auto_flag_listing();


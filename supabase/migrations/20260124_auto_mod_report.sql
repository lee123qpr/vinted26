-- Migration: 20260124_auto_mod_report.sql
-- Purpose: Automatically create a Report when a listing is flagged by auto-moderation.

-- 1. Create Function to Insert Report
create or replace function public.on_listing_flagged_create_report()
returns trigger
language plpgsql
security definer
as $$
begin
    -- Only proceed if status changed to 'flagged'
    if new.status = 'flagged' and (old.status is distinct from 'flagged') then
        
        -- Check if a report already exists to prevent duplicates
        if not exists (
            select 1 from public.reports 
            where listing_id = new.id 
            and reason = 'auto_moderation'
        ) then
            insert into public.reports (listing_id, reason, status)
            values (new.id, 'auto_moderation', 'pending');
        end if;
        
    end if;
    return new;
end;
$$;

-- 2. Create Trigger
drop trigger if exists on_listing_flagged_report on public.listings;
create trigger on_listing_flagged_report
    after insert or update of status
    on public.listings
    for each row
    execute function public.on_listing_flagged_create_report();

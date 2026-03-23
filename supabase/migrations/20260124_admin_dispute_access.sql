-- Migration: 20260124_admin_dispute_access.sql
-- Purpose: Grant admins access to view and manage all disputes.

-- Policy: Admins can view all disputes
create policy "Admins can view all disputes"
  on public.disputes for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.is_admin = true
    )
  );

-- Policy: Admins can update disputes (Start resolution, resolve)
create policy "Admins can update disputes"
  on public.disputes for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.is_admin = true
    )
  );

-- Policy: Admins can view dispute/transaction messages
-- Even though they aren't sender/recipient, they need to see evidence.
create policy "Admins can view all messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.is_admin = true
    )
  );

-- Policy: Admins can view dispute messages
create policy "Admins can view all dispute messages"
  on public.dispute_messages for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.is_admin = true
    )
  );

create policy "Admins can insert dispute messages"
  on public.dispute_messages for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.is_admin = true
    )
  );


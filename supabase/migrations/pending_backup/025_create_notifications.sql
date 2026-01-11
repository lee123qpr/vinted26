-- Create notifications table
create table if not exists public.notifications (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    type text not null check (type in ('offer_received', 'offer_accepted', 'offer_rejected', 'offer_countered')),
    resource_id uuid not null, -- Can reference offers.id, but kept loose or we can add FK if strictly for offers. Let's keep it flexible or add FK. 
    -- Actually, for now, let's just assume it references 'offers'.
    resource_type text not null default 'offer',
    data jsonb not null default '{}'::jsonb, -- Stores snapshot data: { "listing_title": "...", "amount": 10, "other_user_name": "..." }
    is_read boolean not null default false,
    created_at timestamp with time zone not null default now(),
    constraint notifications_pkey primary key (id)
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies
create policy "Users can view their own notifications"
    on public.notifications for select
    using (auth.uid() = user_id);

create policy "Users can update their own notifications (mark as read)"
    on public.notifications for update
    using (auth.uid() = user_id);

-- Service role (server actions) can insert
-- (Implicitly allowed if using service role key, but for user-triggered actions via RLS we might need logic. 
-- However, we plan to use administrative/secure clients or `security definer` functions for insertions if done by the user? 
-- Actually, the server actions run as the user usually, BUT inserting a notification for *someone else* requires privilege.
-- So we will strictly use `createAdminClient` in our server actions to insert notifications.)

-- Create index for performance
create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_is_read_idx on public.notifications(is_read);

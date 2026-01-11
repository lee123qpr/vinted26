-- Enable Realtime for messages table
alter publication supabase_realtime add table messages;

-- Enable RLS
alter table messages enable row level security;

-- Policy for viewing messages: Users can see messages they sent or received
create policy "Users can view their own messages"
on messages for select
using (
  auth.uid() = sender_id or auth.uid() = recipient_id
);

-- Policy for inserting messages: Users can insert messages where they are the sender
create policy "Users can insert messages"
on messages for insert
with check (
  auth.uid() = sender_id
);

-- Policy for updating messages: Users can update (e.g. mark read) messages they received
create policy "Recipients can update messages"
on messages for update
using (
  auth.uid() = recipient_id
);

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Setup Dispute Storage
    const { error: storageError } = await supabase.rpc('exec_sql', {
        sql_query: `
            insert into storage.buckets (id, name, public)
            values ('dispute-evidence', 'dispute-evidence', false)
            on conflict (id) do nothing;

            drop policy if exists "Users can upload dispute evidence" on storage.objects;
            create policy "Users can upload dispute evidence"
            on storage.objects for insert
            with check (
              bucket_id = 'dispute-evidence' AND
              auth.role() = 'authenticated'
            );

            drop policy if exists "Users can view own evidence" on storage.objects;
            create policy "Users can view own evidence"
            on storage.objects for select
            using (
              bucket_id = 'dispute-evidence' AND
              auth.uid() = owner
            );
        `
    });

    // 2. Update Notification Types
    const { error: notifyError } = await supabase.rpc('exec_sql', {
        sql_query: `
            ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
            ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
            CHECK (type IN ('offer_received', 'offer_accepted', 'offer_rejected', 'offer_countered', 'dispute_raised'));
        `
    });

    return NextResponse.json({
        message: "Attempted to setup storage and notifications.",
        storageError,
        notifyError
    });
}

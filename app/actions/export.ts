
'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function getUsersForExport() {
    const supabase = await createClient(); // Use RLS-safe client, checks if admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Check admin
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) throw new Error('Forbidden');

    const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at, is_trade_verified, total_sales, total_purchases');

    return data || [];
}

export async function getListingsForExport() {
    const supabase = await createAdminClient();
    // Admin access for listing dump

    const { data } = await supabase
        .from('listings')
        .select('id, title, price, status, created_at, seller_id, views_count, likes_count');

    return data || [];
}

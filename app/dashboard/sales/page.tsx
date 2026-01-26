import { createClient, createAdminClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/format';
import { redirect } from 'next/navigation';
import SalesClient from './SalesClient';

export default async function SalesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Use Admin Client to ensure Seller can see their sales even if RLS is strict
    const adminSupabase = await createAdminClient();

    // Fetch Sold Items
    const { data: sales } = await adminSupabase
        .from('transactions')
        .select(`
            id,
            total_price_gbp,
            order_status,
            created_at,
            listings:listings!listing_id (
                id,
                title,
                listing_images (image_url)
            ),
            buyer_id, 
            buyer:profiles!buyer_id (username),
            reviews:reviews!transaction_id(id)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <SalesClient initialSales={sales || []} />
    );
}

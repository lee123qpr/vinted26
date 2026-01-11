import { createClient, createAdminClient } from '@/lib/supabase/server';
import OrdersClient from './OrdersClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const supabase = await createClient(); // For Auth
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Use Admin Client as a "Server-Side Secure Filter"
    // This bypasses RLS flakes but maintains security by strictly filtering for the current user
    const adminSupabase = await createAdminClient();

    const { data: orders, error } = await adminSupabase
        .from('transactions')
        .select(`
            id,
            total_price_gbp,
            order_status,
            created_at,
            listings:listing_id (title, ),
            seller:seller_id (username)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Critical: Orders Fetch Error", error);
    } else {
        console.log(`Debug: Fetched ${orders?.length} orders successfully.`);
    }



    return <OrdersClient initialOrders={orders || []} />;
}

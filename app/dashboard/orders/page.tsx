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
    // Use standard client with RLS for security
    const { data: orders, error } = await supabase
        .from('transactions')
        .select(`
            id,
            total_price_gbp,
            order_status,
            created_at,
            listings:listings!listing_id (
                id, 
                title, 
                listing_images (image_url),
                carbon_saved_kg
            ),
            seller:profiles!seller_id (username),
            reviews:reviews!transaction_id(id)
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

import { createClient } from '@/lib/supabase/server';
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

    // Fetch Sold Items
    const { data: sales } = await supabase
        .from('transactions')
        .select(`
            id,
            total_price_gbp,
            order_status,
            created_at,
            listings:listing_id (title),
            buyer_id, // Needed for review
            buyer:buyer_id (username)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <SalesClient initialSales={sales || []} />
    );
}

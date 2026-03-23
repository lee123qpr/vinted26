'use server';

import { createAdminClient } from '@/lib/supabase/server';

export async function exportEsgData() {
    const supabase = await createAdminClient();

    // Fetch all successful transactions, joining the listing to get carbon data
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
            id,
            created_at,
            total_price_gbp,
            listing:listings (
                title,
                weight_kg,
                carbon_saved_kg
            ),
            buyer:profiles!buyer_id ( username, full_name, email ),
            seller:profiles!seller_id ( username, full_name, email )
        `)
        .not('order_status', 'eq', 'cancelled')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to export ESG data:', error);
        return { success: false, error: 'Database error fetching ESG data' };
    }

    if (!transactions || transactions.length === 0) {
        return { success: false, error: 'No transactions found to export' };
    }

    // Build CSV Content
    const headers = [
        'Transaction ID',
        'Date',
        'Listing Title',
        'Buyer Name',
        'Buyer Email',
        'Seller Name',
        'Seller Email',
        'Sale Price (GBP)',
        'Material Weight Diverted (kg)',
        'Carbon Emissions Prevented (kg CO2e)'
    ];

    const rows = transactions.map((t: any) => {
        // Sanitize commas and quotes for CSV format
        const clean = (str: string | undefined | null) => {
            if (!str) return '';
            const val = String(str).replace(/"/g, '""');
            return `"${val}"`;
        };

        return [
            clean(t.id),
            clean(new Date(t.created_at).toISOString().split('T')[0]),
            clean(t.listing?.title),
            clean(t.buyer?.full_name || t.buyer?.username),
            clean(t.buyer?.email),
            clean(t.seller?.full_name || t.seller?.username),
            clean(t.seller?.email),
            t.total_price_gbp || 0,
            t.listing?.weight_kg || 0,
            t.listing?.carbon_saved_kg || 0
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    return { success: true, csv: csvContent };
}

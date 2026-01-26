'use server';

import { createAdminClient } from '@/lib/supabase/server';

/**
 * Get revenue data for a specified time period
 */
export async function getRevenueData(startDate?: string, endDate?: string, granularity: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const supabase = await createAdminClient();

    let query = supabase
        .from('transactions')
        .select('created_at, total_price_gbp, platform_fee_gbp, payment_status')
        .eq('payment_status', 'released')
        .order('created_at', { ascending: true });

    if (startDate) {
        query = query.gte('created_at', startDate);
    }
    if (endDate) {
        query = query.lte('created_at', endDate);
    }

    const { data: transactions, error } = await query;

    if (error) throw new Error('Failed to fetch revenue data: ' + error.message);

    // Aggregate by granularity
    const aggregated: Record<string, { revenue: number, fees: number, count: number }> = {};

    transactions?.forEach(tx => {
        const date = new Date(tx.created_at);
        let key: string;

        if (granularity === 'daily') {
            key = date.toISOString().split('T')[0];
        } else if (granularity === 'weekly') {
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
        } else {
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }

        if (!aggregated[key]) {
            aggregated[key] = { revenue: 0, fees: 0, count: 0 };
        }

        aggregated[key].revenue += tx.total_price_gbp || 0;
        aggregated[key].fees += tx.platform_fee_gbp || 0;
        aggregated[key].count += 1;
    });

    return Object.entries(aggregated).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        platformFees: data.fees,
        netRevenue: data.fees,
        transactionCount: data.count
    }));
}

/**
 * Get category performance metrics
 */
export async function getCategoryPerformance() {
    const supabase = await createAdminClient();

    const { data: listings, error } = await supabase
        .from('listings')
        .select('price_gbp, categories(name)')
        .eq('status', 'sold');

    if (error) throw new Error('Failed to fetch category data: ' + error.message);

    const categoryStats: Record<string, { totalSales: number, count: number, avgPrice: number }> = {};

    listings?.forEach(listing => {
        // @ts-ignore - Supabase type inference might be tricky here with joined table
        const catName = listing.categories?.name || 'Uncategorized';

        if (!categoryStats[catName]) {
            categoryStats[catName] = { totalSales: 0, count: 0, avgPrice: 0 };
        }
        categoryStats[catName].totalSales += listing.price_gbp || 0;
        categoryStats[catName].count += 1;
    });

    return Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        totalSales: stats.totalSales,
        itemsSold: stats.count,
        avgPrice: stats.count > 0 ? stats.totalSales / stats.count : 0
    })).sort((a, b) => b.totalSales - a.totalSales);
}

/**
 * Get top sellers by revenue
 */
export async function getTopSellers(limit: number = 10) {
    const supabase = await createAdminClient();

    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('seller_id, total_price_gbp, seller:profiles!seller_id(username, email)')
        .eq('payment_status', 'released');

    if (error) throw new Error('Failed to fetch seller data: ' + error.message);

    const sellerStats: Record<string, { username: string, email: string, revenue: number, sales: number }> = {};

    transactions?.forEach(tx => {
        const sellerId = tx.seller_id;
        if (!sellerStats[sellerId]) {
            sellerStats[sellerId] = {
                username: ((tx.seller as unknown) as Record<string, unknown>)?.username as string || 'Unknown',
                email: ((tx.seller as unknown) as Record<string, unknown>)?.email as string || '',
                revenue: 0,
                sales: 0
            };
        }
        sellerStats[sellerId].revenue += tx.total_price_gbp || 0;
        sellerStats[sellerId].sales += 1;
    });

    return Object.entries(sellerStats)
        .map(([id, stats]) => ({ sellerId: id, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
}

/**
 * Export financial data to CSV format
 */
export async function exportFinancialData(format: 'csv' = 'csv', filters?: Record<string, unknown>) {
    const supabase = await createAdminClient();

    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
            id,
            created_at,
            total_price_gbp,
            platform_fee_gbp,
            payment_status,
            buyer:profiles!buyer_id(username, email),
            seller:profiles!seller_id(username, email),
            listing:listings(title, category)
        `)
        .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to export data: ' + error.message);

    // Convert to CSV
    const headers = ['Date', 'Transaction ID', 'Buyer', 'Seller', 'Listing', 'Category', 'Amount', 'Platform Fee', 'Status'];
    const rows = transactions?.map(tx => [
        new Date(tx.created_at).toLocaleDateString(),
        tx.id.slice(0, 8),
        ((tx.buyer as unknown) as Record<string, unknown>)?.username as string || 'Unknown',
        ((tx.seller as unknown) as Record<string, unknown>)?.username as string || 'Unknown',
        ((tx.listing as unknown) as Record<string, unknown>)?.title as string || 'N/A',
        ((tx.listing as unknown) as Record<string, unknown>)?.category as string || 'N/A',
        `£${tx.total_price_gbp?.toFixed(2)}`,
        `£${tx.platform_fee_gbp?.toFixed(2)}`,
        tx.payment_status
    ]) || [];

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    return { csv, filename: `financial_report_${new Date().toISOString().split('T')[0]}.csv` };
}

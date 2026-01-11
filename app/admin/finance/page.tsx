import { createAdminClient } from '@/lib/supabase/server';
import FinanceClient from './FinanceClient';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
    const supabase = await createAdminClient();

    // Get summary stats
    const { data: transactions } = await supabase
        .from('transactions')
        .select('total_amount_gbp, platform_fee_gbp, payment_status, created_at')
        .eq('payment_status', 'released');

    const totalRevenue = transactions?.reduce((sum, tx) => sum + (tx.total_amount_gbp || 0), 0) || 0;
    const totalFees = transactions?.reduce((sum, tx) => sum + (tx.platform_fee_gbp || 0), 0) || 0;
    const transactionCount = transactions?.length || 0;

    // Get recent transactions
    const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
            id,
            created_at,
            total_amount_gbp,
            platform_fee_gbp,
            payment_status,
            buyer:profiles!buyer_id(username),
            seller:profiles!seller_id(username),
            listing:listings(title)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

    return (
        <FinanceClient
            totalRevenue={totalRevenue}
            totalFees={totalFees}
            transactionCount={transactionCount}
            recentTransactions={recentTransactions || []}
        />
    );
}

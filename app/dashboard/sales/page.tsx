import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/format';
import { redirect } from 'next/navigation';

export default async function SalesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const { data: sales } = await supabase
        .from('transactions')
        .select(`
            id,
            total_price_gbp,
            order_status,
            created_at,
            listings:listing_id (title),
            buyer:buyer_id (username)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-secondary-900">Sold Items</h1>

            {!sales || sales.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <p className="text-secondary-500">No sales yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary-50 text-secondary-600 font-medium border-b border-secondary-200">
                                <tr>
                                    <th className="px-6 py-4">Item</th>
                                    <th className="px-6 py-4">Buyer</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-100">
                                {sales.map((sale: any) => (
                                    <tr key={sale.id} className="hover:bg-primary-50/10 transition">
                                        <td className="px-6 py-4 font-medium text-secondary-900">{sale.listings?.title}</td>
                                        <td className="px-6 py-4 text-secondary-700 font-bold">{sale.buyer?.username}</td>
                                        <td className="px-6 py-4 text-secondary-500 text-sm">
                                            {format(new Date(sale.created_at), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-secondary-900">{formatCurrency(sale.total_price_gbp)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${sale.order_status === 'completed' ? 'bg-green-100 text-green-700' :
                                                sale.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {sale.order_status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

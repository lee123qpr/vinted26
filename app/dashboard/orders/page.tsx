'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/format';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('transactions')
                    .select(`
                        id,
                        total_price_gbp,
                        order_status,
                        created_at,
                        listings:listing_id (title, images),
                        seller:seller_id (username)
                    `)
                    .eq('buyer_id', user.id)
                    .order('created_at', { ascending: false });

                if (data) setOrders(data);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-secondary-900">My Orders</h1>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <p className="text-secondary-500">No orders yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary-50 text-secondary-600 font-medium border-b border-secondary-200">
                                <tr>
                                    <th className="px-6 py-4">Item</th>
                                    <th className="px-6 py-4">Seller</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-primary-50/10 transition">
                                        <td className="px-6 py-4 font-medium text-secondary-900">{order.listings?.title}</td>
                                        <td className="px-6 py-4 text-secondary-700 font-bold">{order.seller?.username}</td>
                                        <td className="px-6 py-4 text-secondary-500 text-sm">
                                            {format(new Date(order.created_at), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-secondary-900">{formatCurrency(order.total_price_gbp)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${order.order_status === 'completed' ? 'bg-green-100 text-green-700' :
                                                order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.order_status?.replace('_', ' ')}
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

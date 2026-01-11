import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/format';
import { redirect } from 'next/navigation';
import DashboardGreeting from './DashboardGreeting';
import Link from 'next/link';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Parallel data fetching for performance
    const [profileRes, listingsCountRes, recentSalesRes, recentOrdersRes] = await Promise.all([
        supabase
            .from('profiles')
            .select('full_name, username, total_carbon_saved_kg, total_sales')
            .eq('id', user.id)
            .single(),
        supabase
            .from('listings')
            .select('id', { count: 'exact', head: true })
            .eq('seller_id', user.id)
            .eq('status', 'active'),
        supabase
            .from('transactions')
            .select(`
                id,
                total_price_gbp,
                created_at,
                order_status,
                buyer:buyer_id(username)
            `)
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
        supabase
            .from('transactions')
            .select(`
                id,
                total_price_gbp,
                created_at,
                order_status,
                seller:seller_id(username),
                listings(title)
            `)
            .eq('buyer_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)
    ]);

    const profile = profileRes.data;
    const activeListingsCount = listingsCountRes.count || 0;
    const recentSales = recentSalesRes.data || [];
    const recentOrders = recentOrdersRes.data || [];

    // Fallback if total_earnings_gbp is not in profile (it wasn't in the snippet I saw, but total_sales was)
    // If not in profile, we might need to sum transactions myself or rely on hardcoded for now if schema unknown.
    // I saw total_sales (count) in ProfileClient. I didn't see total_earnings. 
    // I'll calculate total earnings from ALL transactions if profile field doesn't exist, but that's expensive.
    // Ideally I'd check the schema. For now, since sales page fetches transactions, I'll do a quick sum of all COMPLETED transactions if I can,
    // or just leave it placeholder if risky.
    // Actually, let's fetch sum of sales efficiently.
    const { data: earningsData } = await supabase
        .from('transactions') // Assuming transactions table has prices
        .select('total_price_gbp')
        .eq('seller_id', user.id)
        .eq('order_status', 'completed');

    const totalRevenue = earningsData?.reduce((acc, curr) => acc + (curr.total_price_gbp || 0), 0) || 0;

    const userName = profile?.full_name || profile?.username || 'User';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-secondary-900">Dashboard Overview</h1>
                <DashboardGreeting userName={userName} />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active Listings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-secondary-500 font-medium">Active Listings</h3>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-secondary-900">{activeListingsCount}</p>
                    <Link href="/dashboard/listings" className="text-sm text-blue-600 mt-2 flex items-center hover:underline">
                        Manage Listings
                    </Link>
                </div>

                {/* Total Sales */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-secondary-500 font-medium">Total Revenue</h3>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-secondary-900">{formatCurrency(totalRevenue)}</p>
                    <Link href="/dashboard/sales" className="text-sm text-secondary-500 mt-2 hover:text-green-600 transition">
                        {profile?.total_sales || 0} items sold
                    </Link>
                </div>

                {/* Carbon Saved */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-secondary-500 font-medium">Carbon Saved</h3>
                        <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-secondary-900">{profile?.total_carbon_saved_kg?.toFixed(1) || 0}kg</p>
                    <Link href="/dashboard/impact" className="text-sm text-secondary-500 mt-2 hover:text-teal-600 transition">
                        View impact report
                    </Link>
                </div>
            </div>

            {/* Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Sales (Sold Items) */}
                <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-secondary-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-secondary-900">Recent Sales</h3>
                        <Link href="/dashboard/sales" className="text-xs font-semibold text-primary-600 hover:text-primary-700">View All</Link>
                    </div>
                    <div className="divide-y divide-secondary-100 flex-1">
                        {recentSales.length > 0 ? (
                            recentSales.map((sale: any) => (
                                <div key={sale.id} className="p-4 hover:bg-secondary-50 transition flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0 font-bold">
                                            £
                                        </div>
                                        <div>
                                            <p className="font-medium text-secondary-900 capitalize text-sm">{sale.order_status?.replace(/_/g, ' ')}</p>
                                            <p className="text-xs text-secondary-500">Buyer: {sale.buyer?.username || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-green-600">+{formatCurrency(sale.total_price_gbp)}</span>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-secondary-400 text-sm">
                                No recent sales found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Orders (Purchases) */}
                <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-secondary-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-secondary-900">Recent Orders</h3>
                        <Link href="/dashboard/orders" className="text-xs font-semibold text-primary-600 hover:text-primary-700">View All</Link>
                    </div>
                    <div className="divide-y divide-secondary-100 flex-1">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order: any) => (
                                <div key={order.id} className="p-4 hover:bg-secondary-50 transition flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-secondary-900 truncate text-sm">{order.listings?.title || 'Unknown Item'}</p>
                                            <p className="text-xs text-secondary-500 capitalize">{order.order_status?.replace(/_/g, ' ')}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-secondary-900">-{formatCurrency(order.total_price_gbp)}</span>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-secondary-400 text-sm">
                                No recent orders found.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

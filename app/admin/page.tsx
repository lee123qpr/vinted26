
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const supabase = await createClient();

    // 1. Fetch Key Metrics
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    // Active Listings
    const { count: listingCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    // Sold Listings
    const { count: soldCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sold');

    // Pending Disputes
    const { count: disputeCount } = await supabase
        .from('disputes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

    // Flagged Users (suspended or warned)
    const { count: flaggedUserCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .or('account_status.eq.suspended,account_status.eq.warned');

    // Total Carbon Saved (Sum from listings)
    const { data: carbonData } = await supabase.from('listings').select('carbon_saved_kg');
    const totalCarbon = carbonData?.reduce((acc, curr) => acc + (curr.carbon_saved_kg || 0), 0) || 0;

    // Materials Diverted from Landfill (Sum of weights from sold listings)
    const { data: weightData } = await supabase
        .from('listings')
        .select('weight_kg')
        .eq('status', 'sold');
    const totalWeight = weightData?.reduce((acc, curr) => acc + (curr.weight_kg || 0), 0) || 0;

    // Platform Revenue (sum of platform fees from completed transactions)
    const { data: revenueData } = await supabase
        .from('transactions')
        .select('platform_fee_gbp')
        .eq('payment_status', 'released');
    const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.platform_fee_gbp || 0), 0) || 0;

    // Recent Users
    const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Platform Overview</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Users" value={userCount || 0} icon={<UsersIcon />} color="blue" />
                <StatCard title="Active Listings" value={listingCount || 0} icon={<TagIcon />} color="green" />
                <StatCard title="Carbon Saved (kg)" value={totalCarbon.toFixed(1)} icon={<LeafIcon />} color="emerald" />
                <StatCard title="Revenue" value={`£${totalRevenue.toFixed(2)}`} icon={<CurrencyIcon />} color="purple" />
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Sold Listings" value={soldCount || 0} icon={<CheckIcon />} color="blue" />
                <StatCard title="Pending Disputes" value={disputeCount || 0} icon={<AlertIcon />} color="orange" />
                <StatCard title="Flagged Users" value={flaggedUserCount || 0} icon={<FlagIcon />} color="red" />
                <StatCard title="Materials Diverted (kg)" value={totalWeight.toFixed(1)} icon={<RecycleIcon />} color="teal" />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickActionButton href="/admin/listings?status=flagged" icon={<AlertIcon />} label="Review Flagged Listings" color="orange" />
                    <QuickActionButton href="/admin/disputes?status=open" icon={<ScaleIcon />} label="Handle Disputes" color="red" />
                    <QuickActionButton href="/admin/users?verification_pending=true" icon={<ShieldIcon />} label="Verify Accounts" color="blue" />
                    <QuickActionButton href="/admin/finance" icon={<ChartIcon />} label="View Reports" color="purple" />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-800">Newest Members</h2>
                    <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
                </div>
                <div className="divide-y divide-slate-100">
                    {recentUsers?.map((user) => (
                        <div key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                    {user.full_name?.[0] || user.email?.[0] || '?'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{user.full_name || 'Unnamed'}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                            </div>
                            <span className="text-xs text-slate-400">
                                {new Date(user.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    ))}
                    {(!recentUsers || recentUsers.length === 0) && (
                        <div className="p-6 text-center text-slate-500 text-sm">No users found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: any, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600',
        teal: 'bg-teal-50 text-teal-600',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color] || 'bg-slate-100 text-slate-600'}`}>
                {icon}
            </div>
        </div>
    );
}

function QuickActionButton({ href, icon, label, color }: { href: string, icon: any, label: string, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
        orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200',
        red: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200',
        purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200',
    };

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${colorClasses[color]}`}
        >
            <div className="flex-shrink-0">
                {icon}
            </div>
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
}

// Icons
const UsersIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const TagIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
const LeafIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const CurrencyIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AlertIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const FlagIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>;
const RecycleIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const ScaleIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;
const ShieldIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const ChartIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

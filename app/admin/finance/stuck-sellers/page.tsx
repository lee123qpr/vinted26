import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import StuckSellerActions from './StuckSellerActions';

export const dynamic = 'force-dynamic';

export default async function StuckSellersPage() {
    const supabase = await createAdminClient();

    // Fetch sellers who initialized Stripe but are missing verification
    const { data: sellers, error } = await supabase
        .from('profiles')
        .select(`
            id,
            username,
            full_name,
            email,
            stripe_account_id,
            stripe_charges_enabled
        `)
        .not('stripe_account_id', 'is', null)
        .eq('stripe_charges_enabled', false)
        .order('created_at', { ascending: false });

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/finance" className="text-secondary-400 hover:text-secondary-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </Link>
                <h1 className="text-3xl font-bold text-slate-800">Stuck Stripe Sellers</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-5xl">
                <div className="p-6 border-b border-secondary-100 bg-orange-50/50">
                    <h2 className="text-lg font-bold text-orange-800 mb-1">Pending Verification</h2>
                    <p className="text-sm text-orange-600">These users have linked a Stripe account but have not finished Identity Verification. Any funds they earn will be held in escrow until they complete onboarding.</p>
                </div>
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-900">User</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Email</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Stripe Account ID</th>
                            <th className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sellers && sellers.length > 0 ? sellers.map((seller: any) => (
                            <tr key={seller.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-medium text-slate-900">{seller.full_name || seller.username}</p>
                                    <p className="text-xs text-slate-500">@{seller.username}</p>
                                </td>
                                <td className="px-6 py-4">
                                    {seller.email}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                                        {seller.stripe_account_id}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <StuckSellerActions 
                                        sellerId={seller.id} 
                                        email={seller.email} 
                                        name={seller.full_name || seller.username}
                                    />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                                    No stuck sellers found. Everyone is verified! 🎉
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

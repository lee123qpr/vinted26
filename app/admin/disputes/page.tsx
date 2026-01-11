
import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDisputesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
    const supabase = await createAdminClient();
    const params = await searchParams;
    const statusFilter = params?.status || '';

    // Fetch disputes
    let query = supabase
        .from('disputes')
        .select(`
            *,
            transaction:transactions(
                id,
                total_amount_gbp,
                buyer:profiles!buyer_id(username, email),
                seller:profiles!seller_id(username, email),
                listing:listings(title)
            )
        `)
        .order('created_at', { ascending: false });

    if (statusFilter) {
        query = query.eq('status', statusFilter);
    }

    const { data: disputes } = await query;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Dispute Management</h1>
                <div className="flex gap-2">
                    <Link
                        href="/admin/disputes"
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${!statusFilter ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                        All
                    </Link>
                    <Link
                        href="/admin/disputes?status=open"
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'open' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                        Open
                    </Link>
                    <Link
                        href="/admin/disputes?status=resolved"
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'resolved' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                        Resolved
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-900">Dispute ID</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Listing</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Buyer</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Seller</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Reason</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {disputes && disputes.length > 0 ? disputes.map((dispute: any) => (
                            <tr key={dispute.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-mono text-xs text-slate-600">{dispute.id.slice(0, 8)}...</p>
                                    <p className="text-xs text-slate-400">{new Date(dispute.created_at).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-medium text-slate-900">{dispute.transaction?.listing?.title || 'N/A'}</p>
                                    <p className="text-xs text-slate-500">£{dispute.transaction?.total_amount_gbp?.toFixed(2)}</p>
                                </td>
                                <td className="px-6 py-4 text-slate-700">
                                    {dispute.transaction?.buyer?.username || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 text-slate-700">
                                    {dispute.transaction?.seller?.username || 'Unknown'}
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-slate-900 font-medium">{dispute.reason}</p>
                                    <p className="text-xs text-slate-500 truncate max-w-xs">{dispute.description}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${dispute.status === 'open' ? 'bg-orange-100 text-orange-700' :
                                            dispute.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                'bg-slate-100 text-slate-600'
                                        }`}>
                                        {dispute.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={`/admin/disputes/${dispute.id}`}
                                        className="text-xs px-3 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                                    >
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-400 italic">
                                    No disputes found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

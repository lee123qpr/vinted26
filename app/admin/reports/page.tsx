
import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import EsgExportButton from './EsgExportButton';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
    const supabase = await createAdminClient();
    const params = await searchParams;
    const statusFilter = params?.status || '';

    let query = supabase
        .from('reports')
        .select(`
            *,
            listing:listings(
                id,
                title,
                price_gbp,
                images:listing_images(image_url),
                seller:profiles!seller_id(username)
            ),
            reporter:profiles!reporter_id(username)
        `)
        .order('created_at', { ascending: false });

    if (statusFilter) {
        query = query.eq('status', statusFilter);
    }

    const { data: reports } = await query;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-slate-800">User Reports & ESG</h1>
                    <EsgExportButton />
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/admin/reports"
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${!statusFilter ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                        All
                    </Link>
                    <Link
                        href="/admin/reports?status=pending"
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'pending' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                        Pending
                    </Link>
                    <Link
                        href="/admin/reports?status=resolved"
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
                            <th className="px-6 py-4 font-semibold text-slate-900">Reported Listing</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Reason</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Reporter</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Date</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reports && reports.length > 0 ? reports.map((report: any) => (
                            <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-200 rounded overflow-hidden">
                                            {report.listing?.images?.[0]?.image_url && (
                                                <img src={report.listing.images[0].image_url} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{report.listing?.title || 'Deleted Listing'}</p>
                                            <p className="text-xs text-slate-500">
                                                Seller: {report.listing?.seller?.username || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-slate-900 font-medium capitalize">{report.reason.replace('_', ' ')}</p>
                                </td>
                                <td className="px-6 py-4 text-slate-700">
                                    {report.reporter?.username || 'Anonymous'}
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(report.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${report.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                            report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                'bg-slate-100 text-slate-600'
                                        }`}>
                                        {report.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={`/admin/reports/${report.id}`}
                                        className="text-xs px-3 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                                    >
                                        Review
                                    </Link>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">
                                    No reports found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

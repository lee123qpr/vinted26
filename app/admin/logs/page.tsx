
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import Link from 'next/link';

export const metadata = {
    title: 'Admin Activity Logs',
};

export default async function AdminLogsPage({
    params,
    searchParams,
}: {
    params?: Promise<any>;
    searchParams: Promise<{ page?: string; type?: string }>;
}) {
    const supabase = await createClient();
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    // Build Query
    let query = supabase
        .from('admin_logs')
        .select(`
            id,
            action_type,
            target_type,
            target_id,
            details,
            created_at,
            admin:admin_id (
                id,
                username,
                full_name,
                email
            )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

    if (resolvedSearchParams.type) {
        query = query.eq('action_type', resolvedSearchParams.type);
    }

    const { data: logs, count, error } = await query;

    if (error) {
        console.error('Error fetching admin logs:', error);
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Activity Logs</h1>
                <div className="text-sm text-slate-500">
                    Total Events: <span className="font-mono font-bold text-slate-700">{count || 0}</span>
                </div>
            </div>

            {/* Filters could go here */}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Admin</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Target</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs && logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                            {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {(log.admin as any)?.username || (log.admin as any)?.email || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                                                ${log.action_type.includes('delete') ? 'bg-red-100 text-red-800' :
                                                    log.action_type.includes('update') ? 'bg-blue-100 text-blue-800' :
                                                        log.action_type.includes('create') ? 'bg-green-100 text-green-800' :
                                                            'bg-slate-100 text-slate-800'}`}>
                                                {log.action_type.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded mr-2">
                                                {log.target_type}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono truncate max-w-[100px] inline-block align-bottom">
                                                {log.target_id?.slice(0, 8)}...
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={JSON.stringify(log.details, null, 2)}>
                                            {log.details ? JSON.stringify(log.details) : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No activity logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                        <Link
                            href={page > 1 ? `/admin/logs?page=${page - 1}` : '#'}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border ${page > 1 ? 'bg-white text-slate-700 hover:bg-slate-50' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                        >
                            Previous
                        </Link>
                        <span className="text-sm text-slate-600">
                            Page {page} of {totalPages}
                        </span>
                        <Link
                            href={page < totalPages ? `/admin/logs?page=${page + 1}` : '#'}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border ${page < totalPages ? 'bg-white text-slate-700 hover:bg-slate-50' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                        >
                            Next
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

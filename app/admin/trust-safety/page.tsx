import { createAdminClient } from '@/lib/supabase/server';
import TrustActions from './TrustActions';

export const dynamic = 'force-dynamic';

export default async function TrustSafetyPage() {
    const supabase = await createAdminClient();

    // Fetch flagged messages
    const { data: flaggedMessages, error } = await supabase
        .from('messages')
        .select(`
            id,
            content,
            created_at,
            conversation_id,
            sender:profiles!sender_id ( id, username, email )
        `)
        .eq('is_flagged', true)
        .order('created_at', { ascending: false });

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Trust & Safety Scanner</h1>
            <p className="text-slate-500 mb-8">Automated flagging of messages that attempt to bypass platform fees (e.g. sharing phone numbers or PayPal).</p>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-red-50 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-red-900">Flagged Messages Queue</h2>
                        <p className="text-sm text-red-700">Review these interactions and suspend users if necessary.</p>
                    </div>
                    <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                        {flaggedMessages?.length || 0} Action Required
                    </span>
                </div>
                
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-900">Date</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Sender</th>
                            <th className="px-6 py-4 font-semibold text-slate-900 w-1/2">Flagged Content</th>
                            <th className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {flaggedMessages && flaggedMessages.length > 0 ? flaggedMessages.map((msg: any) => (
                            <tr key={msg.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-xs whitespace-nowrap">
                                    {new Date(msg.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-medium text-slate-900">{msg.sender?.username}</p>
                                    <p className="text-xs text-slate-500">{msg.sender?.email}</p>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs bg-red-50/30 text-red-900">
                                    "{msg.content}"
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <TrustActions messageId={msg.id} senderId={msg.sender?.id} />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    <svg className="w-12 h-12 mx-auto text-green-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p className="font-semibold text-slate-700">Inbox Zero!</p>
                                    <p className="text-sm">No flagged messages to review.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function DebugMessagingClient({ user }: { user: any }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [realtimeStatus, setRealtimeStatus] = useState('Disconnected');
    const [lastEvent, setLastEvent] = useState<any>(null);
    const [sessionStatus, setSessionStatus] = useState('Checking...');

    const fetchMessages = async () => {
        setLoading(true);
        setError(null);

        // Timeout promise
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out after 5 seconds')), 5000)
        );

        try {
            // Check Session First
            const { data: sessionData } = await supabase.auth.getSession();
            setSessionStatus(sessionData.session ? `Authenticated as ${sessionData.session.user.id}` : 'No Session found');

            // Fetch with race against timeout
            const fetchPromise = supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
                .order('created_at', { ascending: false })
                .limit(20);

            const result: any = await Promise.race([fetchPromise, timeout]);

            const { data, error } = result;

            if (error) throw error;
            setMessages(data || []);
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(err.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();

        const channel = supabase.channel('debug_msgs')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
                setLastEvent(payload);
                // Don't auto-fetch if we are stuck to avoid loops, but user can click refresh
                console.log('Realtime payload:', payload);
            })
            .subscribe((status) => {
                setRealtimeStatus(status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const runRawFetchTest = async () => {
        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            if (!url || !key) {
                alert('Missing Env Vars');
                return;
            }
            const res = await fetch(`${url}/rest/v1/messages?select=count`, {
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`
                }
            });
            alert(`Raw Fetch Status: ${res.status} ${res.statusText}`);
        } catch (e: any) {
            alert(`Raw Fetch Error: ${e.message}`);
        }
    };

    return (
        <div className="space-y-8">
            <div className="p-4 bg-gray-100 rounded-lg">
                <h2 className="font-bold mb-2">User Info</h2>
                <pre className="text-xs">{JSON.stringify({ id: user.id, email: user.email }, null, 2)}</pre>
            </div>

            <div className="p-4 bg-blue-50 border-blue-200 border rounded-lg">
                <h2 className="font-bold mb-2">Realtime Status</h2>
                <p>Status: <strong>{realtimeStatus}</strong></p>
                {lastEvent && (
                    <div className="mt-2">
                        <p className="text-sm font-semibold">Last Event Received:</p>
                        <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(lastEvent, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded shadow-sm">
                <h2 className="text-xl font-bold">Recent Messages (Client Fetch)</h2>
                <div className="space-x-2">
                    <button onClick={runRawFetchTest} className="btn-outline text-xs px-2 py-1">Test Connection</button>
                    <button onClick={fetchMessages} className="btn-secondary">Refresh</button>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={async () => {
                        // Force clear local storage
                        localStorage.clear();
                        // Try SDK signout (might hang)
                        supabase.auth.signOut().catch(console.error);
                        // Force hard redirect to clear state
                        window.location.href = '/auth/login';
                    }}
                    className="text-xs text-red-500 underline hover:text-red-700"
                >
                    Stuck? Force Sign Out
                </button>
            </div>

            {sessionStatus && <p className="text-xs text-secondary-500 mb-2">Auth Status: {sessionStatus}</p>}

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                    Error: {error}
                </div>
            )}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-2">ID</th>
                                <th className="p-2">Sender</th>
                                <th className="p-2">Recipient</th>
                                <th className="p-2">Text</th>
                                <th className="p-2">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map(msg => (
                                <tr key={msg.id} className="border-b">
                                    <td className="p-2 font-mono text-xs">{msg.id}</td>
                                    <td className="p-2 font-mono text-xs">
                                        {msg.sender_id === user.id ? <span className="text-green-600">ME</span> : msg.sender_id}
                                    </td>
                                    <td className="p-2 font-mono text-xs">
                                        {msg.recipient_id === user.id ? <span className="text-blue-600">ME</span> : msg.recipient_id}
                                    </td>
                                    <td className="p-2">{msg.message_text}</td>
                                    <td className="p-2 text-xs">{new Date(msg.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {messages.length === 0 && <p className="text-center py-4 text-gray-500">No messages found.</p>}
                </div>
            )}
        </div>
    );
}

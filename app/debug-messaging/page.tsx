import DebugMessagingClient from './DebugMessagingClient';
import { createClient } from '@/lib/supabase/server';

export default async function DebugMessagingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Server-side fetch test
    let serverMessages: any[] = [];
    let serverError = null;

    if (user) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) serverMessages = data;
            if (error) serverError = error.message;
        } catch (e: any) {
            serverError = e.message;
        }
    }

    return (
        <div className="container-custom py-12">
            <h1 className="text-3xl font-bold mb-8">Messaging Diagnostics</h1>

            <div className="mb-8 p-4 bg-gray-100 rounded border">
                <h2 className="font-bold text-lg mb-2">Server-Side Check</h2>
                {serverError ? (
                    <p className="text-red-500">Server Error: {serverError}</p>
                ) : (
                    <div>
                        <p>Found <strong>{serverMessages.length}</strong> messages for this user via Server verify.</p>
                        {serverMessages.length > 0 && (
                            <ul className="mt-2 text-xs space-y-1 font-mono">
                                {serverMessages.map(m => (
                                    <li key={m.id}>ID: {m.id} | To: {m.recipient_id} | Text: {m.message_text}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {user ? (
                <DebugMessagingClient user={user} />
            ) : (
                <p>Please log in to debug messaging.</p>
            )}
        </div>
    );
}

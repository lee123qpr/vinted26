
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function DebugAdmin() {
    const [status, setStatus] = useState<any>('Loading...');
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        async function check() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setStatus('Not Logged In');
                return;
            }

            setStatus(`Logged in as ${user.email} (${user.id})`);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                setProfile({ error: error.message, details: error });
            } else {
                setProfile(data);
            }
        }
        check();
    }, []);

    return (
        <div className="p-10 font-mono">
            <h1 className="text-xl font-bold mb-4">Admin Debugger</h1>
            <div className="mb-4 p-4 border rounded bg-gray-100">
                <p><strong>Auth Status:</strong> {status}</p>
            </div>
            <div className="mb-4 p-4 border rounded bg-gray-100">
                <p><strong>Profile Data (Database):</strong></p>
                <pre className="whitespace-pre-wrap">{JSON.stringify(profile, null, 2)}</pre>
            </div>

            {profile?.is_admin === true ? (
                <div className="p-4 bg-green-100 text-green-800 font-bold border border-green-300">
                    ✅ YOU ARE AN ADMIN. <br />
                    The button should be visible. <br />
                    Try forcing a hard refresh (Ctrl+F5).
                </div>
            ) : (
                <div className="p-4 bg-red-100 text-red-800 font-bold border border-red-300">
                    ❌ NOT AN ADMIN. <br />
                    Column 'is_admin' is {String(profile?.is_admin)}.
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getCategories, getSubcategories } from '@/app/actions/taxonomy';

export default function DebugCategoriesPage() {
    const [categories, setCategories] = useState<any[] | null>(null);
    const [rawData, setRawData] = useState<any[] | null>(null);
    const [serverData, setServerData] = useState<any[] | null>(null);
    const [error, setError] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function check() {
            try {
                console.log('Starting fetch...');

                // 1. Check Auth (fast)
                const { data: { session }, error: authError } = await supabase.auth.getSession();
                console.log('Session status:', session ? 'Logged In' : 'Anon', authError);

                // 2. Fetch with Timeout
                const fetchPromise = supabase.from('categories').select('*');
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out after 5s')), 5000));

                const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

                console.log('Fetch complete', { data, error });
                if (error) throw error;
                setCategories(data);
            } catch (err: any) {
                console.error("Raw Error", err);
                setError((prev: any) => ({ ...prev, raw: err.message }));
            }

            // Test 3: Server Action (Categories)
            try {
                console.log('Starting Server Action...');
                const { data, error } = await getCategories();
                if (error) throw new Error(error);
                setServerData(data);

                // Test 4: Server Action (Subcategories)
                if (data && data.length > 0) {
                    const firstCatId = data[0].id;
                    const { data: subData, error: subError } = await getSubcategories(firstCatId);
                    if (subError) console.error("Sub error", subError);
                    console.log("Sub Data:", subData);
                }

            } catch (err: any) {
                setError((prev: any) => ({ ...prev, server: err.message }));
            } finally {
                setLoading(false);
            }
        }
        check();
    }, []);

    const envStatus = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Category Debugger</h1>

            <div className="mb-4 bg-blue-50 p-4 rounded text-sm">
                <p><strong>URL:</strong> {envStatus.url}</p>
                <p><strong>Key:</strong> {envStatus.key}</p>
            </div>

            {loading && <div>Loading...</div>}

            <div className="grid grid-cols-2 gap-4">
                <div className="border p-4 rounded">
                    <h3 className="font-bold border-b mb-2">Supabase Client Library</h3>
                    {error.library ? (
                        <div className="text-red-600 font-mono text-xs">{error.library}</div>
                    ) : categories ? (
                        <div className="text-green-600">Success! Found {categories.length}</div>
                    ) : (
                        <div className="text-gray-500">Waiting...</div>
                    )}
                </div>

                <div className="border p-4 rounded">
                    <h3 className="font-bold border-b mb-2">Raw Fetch (Bypass Library)</h3>
                    {error.raw ? (
                        <div className="text-red-600 font-mono text-xs">{error.raw}</div>
                    ) : rawData ? (
                        <div>
                            <div className="text-green-600 mb-2">Success! Found {rawData.length}</div>
                            <pre className="bg-gray-100 p-2 text-[10px] overflow-auto h-40">
                                {JSON.stringify(rawData[0], null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <div className="text-gray-500">Waiting...</div>
                    )}
                </div>

                <div className="border p-4 rounded bg-green-50 border-green-200">
                    <h3 className="font-bold border-b mb-2 text-green-800">Server Action (Node.js)</h3>
                    {error.server ? (
                        <div className="text-red-600 font-mono text-xs">{error.server}</div>
                    ) : serverData ? (
                        <div>
                            <div className="text-green-600 mb-2">Success! Found {serverData.length}</div>
                            <pre className="bg-white p-2 text-[10px] overflow-auto h-40 border">
                                {JSON.stringify(serverData[0], null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <div className="text-gray-500">Waiting...</div>
                    )}
                </div>
            </div>
        </div>
    );
}

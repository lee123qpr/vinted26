'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function ImpactPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('total_carbon_saved_kg, total_sales, total_purchases')
                    .eq('id', user.id)
                    .single();

                if (data) setStats(data);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-secondary-900">Your Carbon Impact</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-medium opacity-90">Total CO₂ Saved</h3>
                    <p className="text-4xl font-bold mt-2">{stats?.total_carbon_saved_kg?.toFixed(1) || '0.0'} kg</p>
                    <p className="text-sm mt-4 opacity-75">Equivalent to planting {Math.round((stats?.total_carbon_saved_kg || 0) / 20)} trees</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100">
                    <h3 className="text-lg font-medium text-secondary-500">Items Diverted from Landfill</h3>
                    <p className="text-4xl font-bold text-secondary-900 mt-2">{(stats?.total_sales || 0) + (stats?.total_purchases || 0)}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100">
                    <h3 className="text-lg font-medium text-secondary-500">Community Rank</h3>
                    <p className="text-4xl font-bold text-secondary-900 mt-2"># --</p>
                    <p className="text-sm text-secondary-500 mt-4">Top 10% of savers</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 mt-8">
                <h2 className="text-lg font-bold text-secondary-900 mb-4">Why it matters</h2>
                <div className="prose prose-sm text-secondary-600 max-w-none">
                    <p>
                        Construction waste is a massive contributor to global landfill usage. By buying and selling surplus materials on Skipped,
                        you are directly contributing to the circular economy. Every kg of CO₂ saved helps combat climate change.
                    </p>
                </div>
            </div>
        </div>
    );
}

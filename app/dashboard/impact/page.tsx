import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ImpactPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch User Stats
    const { data: stats } = await supabase
        .from('profiles')
        .select('total_carbon_saved_kg, total_sales, total_purchases, total_landfill_saved_kg')
        .eq('id', user.id)
        .single();

    const totalSaved = stats?.total_carbon_saved_kg || 0;
    const totalDiverted = (stats?.total_sales || 0) + (stats?.total_purchases || 0);

    // Fetch Top Carbon Savers
    const { data: topCarbon } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, total_carbon_saved_kg')
        .order('total_carbon_saved_kg', { ascending: false })
        .limit(10);

    // Fetch Top Landfill Diverters
    const { data: topLandfill } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, total_landfill_saved_kg')
        .order('total_landfill_saved_kg', { ascending: false })
        .limit(10);

    // Calculate User Ranks
    const { count: rankCarbon } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gt('total_carbon_saved_kg', totalSaved);

    // Fallback for new column
    const userLandfill = stats?.total_landfill_saved_kg || 0;

    // Note: total_landfill_saved_kg might be null for old rows, treat as 0
    const { count: rankLandfill } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gt('total_landfill_saved_kg', userLandfill);

    const userRankCarbon = (rankCarbon || 0) + 1;
    const userRankLandfill = (rankLandfill || 0) + 1;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-secondary-900">Your Carbon Impact</h1>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl shadow-sm p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-medium opacity-90">Total CO₂ Saved</h3>
                        <p className="text-4xl font-bold mt-2">{totalSaved.toFixed(2)} kg</p>
                        <p className="text-sm mt-4 opacity-75">You are #{userRankCarbon} in the community!</p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 text-white opacity-10">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-xl shadow-sm p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-medium opacity-90">Landfill Diverted</h3>
                        <p className="text-4xl font-bold mt-2">{userLandfill.toFixed(0)} kg</p>
                        <p className="text-sm mt-4 opacity-75">You are #{userRankLandfill} in the community!</p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 text-white opacity-10">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 10a1 1 0 011-1h3a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm6-4a1 1 0 011-1h3a1 1 0 011 1v10a1 1 0 01-1 1h-3a1 1 0 01-1-1V6zm6 4a1 1 0 011-1h3a1 1 0 011 1v6a1 1 0 01-1 1h-3a1 1 0 01-1-1v-6z" clipRule="evenodd" /></svg>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-100 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg font-medium text-secondary-500">Items Recycled</h3>
                    <p className="text-4xl font-bold text-secondary-900 mt-2">{totalDiverted}</p>
                    <p className="text-sm text-secondary-400 mt-2">Active listings & Sold items</p>
                </div>
            </div>

            {/* League Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* CO2 Leaderboard */}
                <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden">
                    <div className="p-4 bg-green-50 border-b border-green-100 flex justify-between items-center">
                        <h2 className="font-bold text-green-900 flex items-center">
                            <span className="text-xl mr-2">🌿</span> Carbon Savers League
                        </h2>
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Top 10</span>
                    </div>
                    <div className="divide-y divide-secondary-100">
                        {topCarbon?.map((profile, index) => (
                            <div key={profile.id} className={`p-4 flex items-center justify-between ${profile.id === user.id ? 'bg-green-50/50' : 'hover:bg-secondary-50'}`}>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-secondary-100 text-secondary-500'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="font-medium text-secondary-900">
                                        {profile.username || 'Anonymous'}
                                        {profile.id === user.id && <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-normal">You</span>}
                                    </div>
                                </div>
                                <div className="font-bold text-green-700">
                                    {profile.total_carbon_saved_kg?.toFixed(1) || 0} kg
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Landfill Leaderboard */}
                <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden">
                    <div className="p-4 bg-teal-50 border-b border-teal-100 flex justify-between items-center">
                        <h2 className="font-bold text-teal-900 flex items-center">
                            <span className="text-xl mr-2">♻️</span> Landfill Diverters League
                        </h2>
                        <span className="text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-1 rounded-full">Top 10</span>
                    </div>
                    <div className="divide-y divide-secondary-100">
                        {topLandfill?.map((profile, index) => (
                            <div key={profile.id} className={`p-4 flex items-center justify-between ${profile.id === user.id ? 'bg-teal-50/50' : 'hover:bg-secondary-50'}`}>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-secondary-100 text-secondary-500'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="font-medium text-secondary-900">
                                        {profile.username || 'Anonymous'}
                                        {profile.id === user.id && <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-normal">You</span>}
                                    </div>
                                </div>
                                <div className="font-bold text-teal-700">
                                    {profile.total_landfill_saved_kg?.toFixed(1) || 0} kg
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

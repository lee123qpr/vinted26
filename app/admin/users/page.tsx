
import { createClient } from '@/lib/supabase/server';
import { toggleUserVerification, toggleUserBan } from '@/app/actions/admin';
import UserTable from './UserTable';

export const dynamic = 'force-dynamic';

export default async function UserManagementPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string; status?: string; date_from?: string; date_to?: string; location?: string; verification_pending?: string }>;
}) {
    const supabase = await createClient();
    const params = await searchParams;
    const query = params?.q || '';
    const statusFilter = params?.status || '';
    const dateFrom = params?.date_from || '';
    const dateTo = params?.date_to || '';
    const locationFilter = params?.location || '';
    const verificationPending = params?.verification_pending === 'true';

    // Fetch all profiles to calculate rank
    let dbQuery = supabase
        .from('profiles')
        .select('*')
        .order('total_carbon_saved_kg', { ascending: false });

    // Apply filters at database level for better performance
    if (statusFilter) {
        dbQuery = dbQuery.eq('account_status', statusFilter);
    }

    if (dateFrom) {
        dbQuery = dbQuery.gte('created_at', dateFrom);
    }

    if (dateTo) {
        dbQuery = dbQuery.lte('created_at', dateTo);
    }

    if (locationFilter) {
        dbQuery = dbQuery.ilike('location', `%${locationFilter}%`);
    }

    if (verificationPending) {
        dbQuery = dbQuery.eq('is_trade_verified', false);
    }

    const { data: allProfiles } = await dbQuery;

    // Calculate Rank Map
    const rankMap = new Map<string, number>();
    allProfiles?.forEach((p, index) => {
        rankMap.set(p.id, index + 1);
    });

    // Filter for search query (client-side for flexibility)
    let displayProfiles = allProfiles || [];
    if (query) {
        const lowerQ = query.toLowerCase();
        displayProfiles = displayProfiles.filter(p =>
            p.email?.toLowerCase().includes(lowerQ) ||
            p.full_name?.toLowerCase().includes(lowerQ) ||
            p.username?.toLowerCase().includes(lowerQ)
        );
    }

    // Attach Rank
    const usersWithRank = displayProfiles.map(p => ({
        ...p,
        rank: rankMap.get(p.id) || 0
    }));

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
            </div>

            {/* Enhanced Filters */}
            <form className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                        <input
                            name="q"
                            defaultValue={query}
                            placeholder="Name, email, username..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Account Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Account Status</label>
                        <select
                            name="status"
                            defaultValue={statusFilter}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="warned">Warned</option>
                            <option value="banned">Banned</option>
                        </select>
                    </div>

                    {/* Date From */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Registered From</label>
                        <input
                            type="date"
                            name="date_from"
                            defaultValue={dateFrom}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Registered To</label>
                        <input
                            type="date"
                            name="date_to"
                            defaultValue={dateTo}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                        <input
                            name="location"
                            defaultValue={locationFilter}
                            placeholder="City, region..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Verification Pending */}
                    <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="verification_pending"
                                value="true"
                                defaultChecked={verificationPending}
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700">Verification Pending</span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-end gap-2">
                        <button
                            type="submit"
                            className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                        >
                            Apply Filters
                        </button>
                        <a
                            href="/admin/users"
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Clear
                        </a>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                        Showing <span className="font-semibold">{usersWithRank.length}</span> users
                        {query && ` matching "${query}"`}
                    </p>
                </div>
            </form>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <UserTable users={usersWithRank} />
            </div>
        </div>
    );
}

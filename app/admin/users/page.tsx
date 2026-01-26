import { createClient } from '@/lib/supabase/server';
import UserTable from './UserTable';
import ExportUsersButton from './ExportUsersButton';

export const dynamic = 'force-dynamic';

export default async function UserManagementPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string; status?: string; date_from?: string; date_to?: string; location?: string; sort?: string }>;
}) {
    const supabase = await createClient();
    const params = await searchParams;
    const query = params?.q || '';
    const statusFilter = params?.status || '';
    const dateFrom = params?.date_from || '';
    const dateTo = params?.date_to || '';
    const locationFilter = params?.location || '';
    const sortOption = params?.sort || 'joined_desc'; // Default sort

    // Fetch all profiles
    let dbQuery = supabase
        .from('profiles')
        .select('*');

    // Apply Sorting
    switch (sortOption) {
        case 'joined_desc':
            dbQuery = dbQuery.order('created_at', { ascending: false });
            break;
        case 'joined_asc':
            dbQuery = dbQuery.order('created_at', { ascending: true });
            break;
        case 'sales_desc':
            dbQuery = dbQuery.order('total_sales', { ascending: false });
            break;
        case 'carbon_desc':
            dbQuery = dbQuery.order('total_carbon_saved_kg', { ascending: false });
            break;
        default:
            dbQuery = dbQuery.order('created_at', { ascending: false });
    }

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

    const { data: allProfiles, error } = await dbQuery;

    if (error) {
        console.error("Error fetching users:", error);
    }

    // Calculate Rank Map (Based on Carbon Saved, regardless of current sort)
    // We need a separate query or just sort the result in memory to determine rank?
    // Actually, rank is usually global. let&apos;s precise that rank = Carbon Rank.
    // For now, let&apos;s keep rank dynamic based on current view or purely cosmetic.
    // let&apos;s rely on index for now, or remove rank if it&apos;s confusing.
    // Re-introducing simple rank based on the current list for now.

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

    const usersWithRank = displayProfiles.map((p, index) => ({
        ...p,
        rank: index + 1 // Simple view rank
    }));

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage users, track activity, and export data.</p>
                </div>
                <ExportUsersButton />
            </div>

            {/* Enhanced Filters */}
            <form className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
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
                            <option value="deleted">Deleted</option>
                        </select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                        <select
                            name="sort"
                            defaultValue={sortOption}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="joined_desc">Joined: Newest First</option>
                            <option value="joined_asc">Joined: Oldest First</option>
                            <option value="sales_desc">Total Sales: High to Low</option>
                            <option value="carbon_desc">Carbon Saved: High to Low</option>
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

                    {/* Submit Button */}
                    <div className="flex items-end gap-2">
                        <button
                            type="submit"
                            className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                        >
                            Apply
                        </button>
                        <a
                            href="/admin/users"
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Reset
                        </a>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-600">
                    <p>
                        Showing <span className="font-semibold">{usersWithRank.length}</span> users
                        {query && ` matching "${query}"`}
                    </p>
                    {error && <p className="text-red-500">Error loading users. Please refresh.</p>}
                </div>
            </form>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <UserTable users={usersWithRank} />
            </div>
        </div>
    );
}

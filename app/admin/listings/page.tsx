
import { createAdminClient } from '@/lib/supabase/server';
import ListingTable from './ListingTable';

export const dynamic = 'force-dynamic';

export default async function AdminListingsPage({ searchParams }: {
    searchParams: Promise<{
        q?: string;
        seller_id?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
        price_min?: string;
        price_max?: string;
        sort?: string;
    }>
}) {
    const supabase = await createAdminClient();
    const params = await searchParams;
    const query = params.q || '';
    const sellerId = params.seller_id;
    const statusFilter = params.status || '';
    const dateFrom = params.date_from || '';
    const dateTo = params.date_to || '';
    const priceMin = params.price_min || '';
    const priceMax = params.price_max || '';
    const sortOption = params.sort || 'newest';

    let dbQuery = supabase
        .from('listings')
        .select('*, images:, seller:profiles(username, email)')
        .limit(100);

    // Sorting Logic
    switch (sortOption) {
        case 'newest':
            dbQuery = dbQuery.order('created_at', { ascending: false });
            break;
        case 'oldest':
            dbQuery = dbQuery.order('created_at', { ascending: true });
            break;
        case 'price_desc':
            dbQuery = dbQuery.order('price_gbp', { ascending: false });
            break;
        case 'price_asc':
            dbQuery = dbQuery.order('price_gbp', { ascending: true });
            break;
        default:
            dbQuery = dbQuery.order('created_at', { ascending: false });
    }

    if (query) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (sellerId) {
        dbQuery = dbQuery.eq('seller_id', sellerId);
    }

    if (statusFilter) {
        dbQuery = dbQuery.eq('status', statusFilter);
    }

    if (dateFrom) {
        dbQuery = dbQuery.gte('created_at', dateFrom);
    }

    if (dateTo) {
        dbQuery = dbQuery.lte('created_at', dateTo);
    }

    if (priceMin) {
        dbQuery = dbQuery.gte('price_gbp', parseFloat(priceMin));
    }

    if (priceMax) {
        dbQuery = dbQuery.lte('price_gbp', parseFloat(priceMax));
    }

    const { data: listings } = await dbQuery;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Listing Moderation</h1>

            {/* Enhanced Filters */}
            <form className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                        <input
                            name="q"
                            defaultValue={query}
                            placeholder="Title or description..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            suppressHydrationWarning
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                        <select
                            name="status"
                            defaultValue={statusFilter}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            suppressHydrationWarning
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="sold">Sold</option>
                            <option value="removed">Removed</option>
                            <option value="flagged">🚩 Flagged (Auto-Mod)</option>
                        </select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                        <select
                            name="sort"
                            defaultValue={sortOption}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            suppressHydrationWarning
                        >
                            <option value="newest">Newest Listed</option>
                            <option value="oldest">Oldest Listed</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="price_asc">Price: Low to High</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-end gap-2">
                        <button
                            type="submit"
                            className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                            suppressHydrationWarning
                        >
                            Apply
                        </button>
                        <a
                            href="/admin/listings"
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Reset
                        </a>
                    </div>

                    {/* Collapsible Advanced Filters could go here if needed, keeping it simple for now */}
                    <div className="md:col-span-2 lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                        {/* Date From */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Listed From</label>
                            <input
                                type="date"
                                name="date_from"
                                defaultValue={dateFrom}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Listed To</label>
                            <input
                                type="date"
                                name="date_to"
                                defaultValue={dateTo}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                            />
                        </div>

                        {/* Price Min */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Min Price (£)</label>
                            <input
                                type="number"
                                name="price_min"
                                defaultValue={priceMin}
                                placeholder="0"
                                className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                            />
                        </div>

                        {/* Price Max */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Max Price (£)</label>
                            <input
                                type="number"
                                name="price_max"
                                defaultValue={priceMax}
                                placeholder="1000"
                                className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                            />
                        </div>
                    </div>

                </div>

                {/* Results Count */}
                <div className="mt-4 pt-2 flex justify-between items-center text-sm text-slate-600">
                    <p>
                        Showing <span className="font-semibold">{listings?.length || 0}</span> listings
                        {query && ` matching "${query}"`}
                    </p>
                    {statusFilter === 'flagged' && <p className="text-red-600 font-bold">Reviewing Flagged Items</p>}
                </div>
            </form>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <ListingTable listings={listings || []} />
            </div>
        </div>
    );
}


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

    let dbQuery = supabase
        .from('listings')
        .select('*, images:, seller:profiles(username, email)')
        .order('created_at', { ascending: false })
        .limit(100);

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
                            <option value="flagged">Flagged</option>
                        </select>
                    </div>

                    {/* Date From */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Listed From</label>
                        <input
                            type="date"
                            name="date_from"
                            defaultValue={dateFrom}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            suppressHydrationWarning
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Listed To</label>
                        <input
                            type="date"
                            name="date_to"
                            defaultValue={dateTo}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            suppressHydrationWarning
                        />
                    </div>

                    {/* Price Min */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Min Price (£)</label>
                        <input
                            type="number"
                            name="price_min"
                            defaultValue={priceMin}
                            placeholder="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            suppressHydrationWarning
                        />
                    </div>

                    {/* Price Max */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Max Price (£)</label>
                        <input
                            type="number"
                            name="price_max"
                            defaultValue={priceMax}
                            placeholder="1000"
                            step="0.01"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            suppressHydrationWarning
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-end gap-2 md:col-span-2">
                        <button
                            type="submit"
                            className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                            suppressHydrationWarning
                        >
                            Apply Filters
                        </button>
                        <a
                            href="/admin/listings"
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Clear
                        </a>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                        Showing <span className="font-semibold">{listings?.length || 0}</span> listings
                        {query && ` matching "${query}"`}
                    </p>
                </div>
            </form>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <ListingTable listings={listings || []} />
            </div>
        </div>
    );
}

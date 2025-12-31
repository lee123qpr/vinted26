import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import FilterSidebar from '@/components/FilterSidebar';
import ListingGridWithMap from '@/components/ListingGridWithMap';

export const metadata = {
    title: 'Search Listings | Skipped',
    description: 'Find construction materials, tools, and more on Skipped.',
};

export default async function SearchPage(props: {
    searchParams: Promise<{
        q?: string;
        minPrice?: string;
        maxPrice?: string;
        condition?: string | string[];
        lat?: string;
        lng?: string;
        radius?: string;
        postcode?: string;
    }>
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();

    // 1. Fetch User Favourites (if logged in)
    const { data: { user } } = await supabase.auth.getUser();
    let favouritedIds: string[] = [];

    if (user) {
        const { data: favs } = await supabase
            .from('favourites')
            .select('listing_id')
            .eq('user_id', user.id);

        if (favs) {
            favouritedIds = favs.map(f => f.listing_id);
        }
    }

    // 2. Prepare RPC Parameters
    const rpcParams = {
        search_query: searchParams.q || null,
        category_filter: null, // Global search
        min_price: searchParams.minPrice ? parseFloat(searchParams.minPrice) : null,
        max_price: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : null,
        lat: searchParams.lat ? parseFloat(searchParams.lat) : null,
        lng: searchParams.lng ? parseFloat(searchParams.lng) : null,
        radius_miles: searchParams.radius ? parseInt(searchParams.radius) : null,
        limit_val: 50,
        offset_val: 0
    };

    // 3. Call RPC
    const { data: listings, error: listingsError } = await supabase.rpc('search_listings', rpcParams);

    if (listingsError) {
        console.error('Search RPC Error:', listingsError);
    }

    return (
        <div className="min-h-screen bg-secondary-50 pt-6 pb-12">
            <div className="container-custom">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <FilterSidebar />
                    </div>

                    {/* Results Grid */}
                    <div className="flex-1">
                        <ListingGridWithMap
                            listings={listings || []}
                            favouritedIds={favouritedIds}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import FilterSidebar from '@/components/FilterSidebar';
import ListingCard from '@/components/ListingCard';

import { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const supabase = await createClient();
    const { data: category } = await supabase.from('categories').select('name').eq('slug', params.slug).single();

    return {
        title: category ? `${category.name} | Skipped` : 'Category | Skipped',
        description: `Browse ${category?.name || 'construction materials'} for sale on Skipped.`,
    };
}

export default async function CategoryPage(props: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{
        subcategory?: string;
        detail?: string;
        minPrice?: string;
        maxPrice?: string;
        condition?: string | string[];
        lat?: string;
        lng?: string;
        radius?: string;
        postcode?: string;
        q?: string; // search query
    }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const supabase = await createClient();

    // 0. Fetch User Favourites (if logged in)
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

    // 1. Fetch Category Details to get ID
    const { data: category, error: catError } = await supabase
        .from('categories')
        .select(`
            id, 
            name, 
            slug,
            subcategories (
                id,
                name,
                slug,
                sub_subcategories (
                    id,
                    name,
                    slug,
                    sub_subcategories (
                        id,
                        name,
                        slug
                    )
                )
            )
        `)
        .eq('slug', params.slug)
        .single();

    // Note: The above query for sub_subcategories inside sub_subcategories is wrong (too deep/recursive error in my previous thought? 
    // Actual schema is Category -> Subcategory -> SubSubcategory. 
    // Let's fix the query structure to match schema:
    // categories -> subcategories -> sub_subcategories.

    // Correct query:
    const { data: categoryCorrected, error: catErrorCorrected } = await supabase
        .from('categories')
        .select(`
            id, 
            name, 
            slug,
            subcategories (
                id,
                name,
                slug,
                sub_subcategories (
                    id,
                    name,
                    slug
                )
            )
        `)
        .eq('slug', params.slug)
        .single();

    if (catErrorCorrected || !categoryCorrected) {
        notFound();
    }
    const catData = categoryCorrected;

    // 2. Determine Filter IDs based on slugs
    let selectedSubcategoryId: string | null = null;
    let selectedSubSubcategoryId: string | null = null;
    let currentSubcategoryName = null;
    let currentDetailName = null;

    if (searchParams.subcategory) {
        // @ts-ignore
        const sub = catData.subcategories.find((s: any) => s.slug === searchParams.subcategory);
        if (sub) {
            selectedSubcategoryId = sub.id;
            currentSubcategoryName = sub.name;

            if (searchParams.detail) {
                // @ts-ignore
                const detail = sub.sub_subcategories.find((d: any) => d.slug === searchParams.detail);
                if (detail) {
                    selectedSubSubcategoryId = detail.id;
                    currentDetailName = detail.name;
                }
            }
        }
    }

    // 3. Prepare RPC Parameters
    // We prioritize sub_subcategory, then subcategory, then category.
    // The RPC takes 'category_filter', which matches against all 3 ID columns.
    // So we pass the most specific ID we have.
    const categoryFilterId = selectedSubSubcategoryId || selectedSubcategoryId || catData.id;

    const rpcParams = {
        search_query: searchParams.q || null,
        category_filter: categoryFilterId,
        min_price: searchParams.minPrice ? parseFloat(searchParams.minPrice) : null,
        max_price: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : null,
        lat: searchParams.lat ? parseFloat(searchParams.lat) : null,
        lng: searchParams.lng ? parseFloat(searchParams.lng) : null,
        radius_miles: searchParams.radius ? parseInt(searchParams.radius) : null,
        limit_val: 50,
        offset_val: 0
    };

    // 4. Call RPC
    const { data: listings, error: listingsError } = await supabase.rpc('search_listings', rpcParams);

    if (listingsError) {
        console.error('Search RPC Error:', listingsError);
    }

    // 5. Breadcrumbs Logic
    const breadcrumbs = [
        { name: 'Home', href: '/' },
        { name: catData.name, href: `/category/${catData.slug}` },
    ];
    if (searchParams.subcategory && currentSubcategoryName) {
        breadcrumbs.push({ name: currentSubcategoryName, href: `/category/${catData.slug}?subcategory=${searchParams.subcategory}` });
    }
    if (searchParams.detail && currentDetailName) {
        breadcrumbs.push({ name: currentDetailName, href: '#' });
    }

    return (
        <div className="min-h-screen bg-secondary-50 pb-12">
            {/* Category Header */}
            <div className="bg-white border-b border-secondary-200">
                <div className="container-custom py-8">
                    {/* Breadcrumbs */}
                    <div className="flex items-center space-x-2 text-sm text-secondary-500 mb-4 overflow-x-auto whitespace-nowrap">
                        {breadcrumbs.map((crumb, index) => (
                            <div key={crumb.name} className="flex items-center">
                                {index > 0 && <span className="mx-2">/</span>}
                                {index === breadcrumbs.length - 1 ? (
                                    <span className="font-medium text-secondary-900">{crumb.name}</span>
                                ) : (
                                    <Link href={crumb.href} className="hover:text-primary-600 transition-colors">
                                        {crumb.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                        {currentDetailName || currentSubcategoryName || catData.name}
                    </h1>
                    <p className="text-secondary-600 max-w-2xl">
                        Browse surplus {currentDetailName || currentSubcategoryName || catData.name} available for collection or delivery.
                        Help reduce waste and find great deals.
                    </p>
                </div>
            </div>

            <div className="container-custom py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters (Desktop) or Horizontal Pills (Mobile/Simple) */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-8">

                        {/* Subcategories List */}
                        {!selectedSubcategoryId && (
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="font-bold text-secondary-900 mb-4">Categories</h3>
                                <ul className="space-y-2">
                                    {/* @ts-ignore */}
                                    {catData.subcategories.map((sub: any) => (
                                        <li key={sub.id}>
                                            <Link
                                                href={`/category/${catData.slug}?subcategory=${sub.slug}`}
                                                className="text-secondary-600 hover:text-primary-600 block text-sm"
                                            >
                                                {sub.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Sub-Subcategories List (if subcategory selected) */}
                        {selectedSubcategoryId && (
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-secondary-900">Type</h3>
                                    <Link href={`/category/${catData.slug}`} className="text-xs text-secondary-400 hover:text-primary-500">
                                        Clear
                                    </Link>
                                </div>

                                <ul className="space-y-2">
                                    {/* @ts-ignore */}
                                    {catData.subcategories.find(s => s.id === selectedSubcategoryId)?.sub_subcategories?.map((detail: any) => (
                                        <li key={detail.id}>
                                            <Link
                                                href={`/category/${catData.slug}?subcategory=${searchParams.subcategory}&detail=${detail.slug}`}
                                                className={`block text-sm ${searchParams.detail === detail.slug ? 'font-bold text-primary-600' : 'text-secondary-600 hover:text-primary-600'}`}
                                            >
                                                {detail.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <FilterSidebar />
                    </div>

                    {/* Listings Grid */}
                    <div className="flex-1">
                        {listings && listings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {listings.map((item: any) => (
                                    <ListingCard
                                        key={item.id}
                                        listing={item}
                                        isFavourited={favouritedIds.includes(item.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-secondary-300">
                                <span className="text-4xl mb-4 block">📦</span>
                                <h3 className="text-lg font-medium text-secondary-900 mb-2">No listings found</h3>
                                <p className="text-secondary-500">
                                    There are currently no items in this category matching your filters.
                                </p>
                                {(searchParams.minPrice || searchParams.lat || searchParams.condition) ? (
                                    <p className="text-sm text-secondary-400 mt-2">Try adjusting your price, distance, or condition filters.</p>
                                ) : null}
                                <Link href="/sell" className="btn-primary mt-6 inline-block">
                                    List an Item
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import ListingCard from '@/components/ListingCard';
import Link from 'next/link';

interface Props {
    listings: any[];
}

export default function FavouritesClient({ listings }: Props) {
    if (!listings || listings.length === 0) {
        return (
            <div className="min-h-screen bg-secondary-50 pt-6 pb-12">
                <div className="container-custom">
                    <h1 className="text-2xl font-bold mb-6 text-secondary-900">My Favourites</h1>
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-secondary-300 shadow-sm">
                        <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            ❤️
                        </div>
                        <h3 className="text-lg font-medium text-secondary-900 mb-2">No favourites yet</h3>
                        <p className="text-secondary-500 mb-6 max-w-sm mx-auto">
                            Save items you're interested in by clicking the heart icon on any listing.
                        </p>
                        <Link href="/search" className="btn-primary inline-flex items-center">
                            Browse Listings
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary-50 pt-6 pb-12">
            <div className="container-custom">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-secondary-900">My Favourites</h1>
                    <span className="text-secondary-500 font-medium">
                        {listings.length} item{listings.length !== 1 ? 's' : ''} saved
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {listings.map((item) => (
                        <ListingCard key={item.id} listing={item} isFavourited={true} />
                    ))}
                </div>
            </div>
        </div>
    );
}

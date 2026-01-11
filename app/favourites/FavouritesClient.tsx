'use client';

import ListingCard from '@/components/ListingCard';
import Link from 'next/link';

interface Props {
    listings: any[];
}

export default function FavouritesClient({ listings }: Props) {
    if (!listings || listings.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6 text-secondary-900">My Favourites</h1>
                <div className="text-center py-12 bg-secondary-50 rounded-xl">
                    <p className="text-secondary-600 mb-4">You haven't favourited any items yet.</p>
                    <Link href="/" className="btn-primary inline-block">
                        Browse Listings
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-secondary-900">My Favourites</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {listings.map((item) => (
                    <ListingCard key={item.id} listing={item} isFavourited={true} />
                ))}
            </div>
        </div>
    );
}

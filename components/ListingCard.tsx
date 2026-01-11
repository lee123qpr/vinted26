'use client';

import Link from 'next/link';
import Image from 'next/image';
import FavouritesButton from './FavouritesButton';
import { formatCurrency } from '@/lib/format';

interface Listing {
    id: string;
    title: string;
    price_gbp: number | null;
    is_free: boolean | null;
    postcode_area: string | null;
    condition: string | null;
    carbon_saved_kg?: number;
    include_carbon_certificate?: boolean;
    images?: any[]; // Keep flexible as RPC returns JSON, standard select returns specific shape
    listing_images?: { image_url: string }[]; // Alternative shape
    distance_miles?: number;
}

interface ListingCardProps {
    listing: Listing;
    isFavourited?: boolean;
}

export default function ListingCard({ listing, isFavourited = false }: ListingCardProps) {
    // Normalise image handling (RPC vs standard select)
    let imageUrl = 'https://placehold.co/400x400?text=No+Image';
    if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
        // RPC returns JSON array of objects or strings depending on query. 
        // Based on RPC definition: json_build_object('image_url', ...)
        const firstImg = listing.images[0];
        imageUrl = typeof firstImg === 'string' ? firstImg : firstImg.image_url;
    } else if (listing.listing_images && listing.listing_images.length > 0) {
        imageUrl = listing.listing_images[0].image_url;
    }

    // Normalise carbon saved (some queries might not return it)
    const carbonSaved = listing.carbon_saved_kg || 0;

    const conditionColors: Record<string, string> = {
        new_unused: 'bg-green-100 text-green-800 border-green-200',
        like_new: 'bg-blue-100 text-blue-800 border-blue-200',
        good: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        fair: 'bg-orange-100 text-orange-800 border-orange-200',
        for_parts: 'bg-red-100 text-red-800 border-red-200',
    };

    const conditionStyle = listing.condition ? (conditionColors[listing.condition] || 'bg-secondary-100 text-secondary-800 border-secondary-200') : 'bg-secondary-100 text-secondary-800 border-secondary-200';

    return (
        <div className="card group bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden hover:shadow-md transition-shadow block relative">
            <div className="relative aspect-square bg-secondary-100 overflow-hidden">
                <Link href={`/listing/${listing.id}`} className="block w-full h-full relative">
                    <Image
                        src={imageUrl}
                        alt={listing.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </Link>

                {/* Favourite Button - Top Right */}
                <div className="absolute top-2 right-2 z-10">
                    <FavouritesButton listingId={listing.id} initialIsFavourited={isFavourited} />
                </div>

                {/* Removed "Cert Included" tag as per user request */}

                {listing.distance_miles !== null && listing.distance_miles !== undefined && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center shadow-sm z-10 pointer-events-none">
                        📍 {Number(listing.distance_miles).toFixed(1)} miles
                    </div>
                )}
            </div>

            <Link href={`/listing/${listing.id}`} className="block p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {listing.title}
                    </h3>
                    <span className={`font-bold text-lg ${listing.is_free ? 'text-green-600' : 'text-primary-700'}`}>
                        {listing.is_free ? 'FREE' : formatCurrency(listing.price_gbp)}
                    </span>
                </div>

                <div className="text-sm text-secondary-500 mb-2">
                    {listing.postcode_area || 'Location n/a'}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-secondary-100">
                    <span className={`text-xs px-2 py-1 rounded border ${conditionStyle} capitalize font-medium`}>
                        {listing.condition?.replace('_', ' ') || 'Used'}
                    </span>

                    {carbonSaved > 0 && (
                        <span className="text-xs font-medium text-green-600 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {carbonSaved.toFixed(2)}kg CO₂ Saved
                        </span>
                    )}
                </div>
            </Link>
        </div>
    );
}

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import ListingCard from './ListingCard';

const MapView = dynamic(() => import('@/components/MapView'), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-secondary-100 animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>
});

interface ListingGridWithMapProps {
    listings: any[];
    favouritedIds: string[];
}

export default function ListingGridWithMap({ listings, favouritedIds }: ListingGridWithMapProps) {
    const [showMap, setShowMap] = useState(false);

    // Create a Set for O(1) lookups
    const favSet = new Set(favouritedIds);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-secondary-900">
                    {`Found ${listings.length} results`}
                </h1>

                {/* View Toggle */}
                <div className="flex items-center space-x-4">
                    <div className="bg-white rounded-lg border border-secondary-300 p-1 flex">
                        <button
                            onClick={() => setShowMap(false)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${!showMap ? 'bg-primary-50 text-primary-700' : 'text-secondary-600 hover:bg-secondary-50'}`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setShowMap(true)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${showMap ? 'bg-primary-50 text-primary-700' : 'text-secondary-600 hover:bg-secondary-50'}`}
                        >
                            Map
                        </button>
                    </div>
                </div>
            </div>

            {showMap ? (
                <div className="h-[600px] w-full">
                    <MapView listings={listings} />
                </div>
            ) : listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {listings.map((item) => (
                        <ListingCard
                            key={item.id}
                            listing={item}
                            isFavourited={favSet.has(item.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-secondary-300">
                    <span className="text-4xl mb-4 block">🔍</span>
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">No listings found</h3>
                    <p className="text-secondary-500 mb-4">Try adjusting your filters or search terms</p>
                </div>
            )}
        </div>
    );
}

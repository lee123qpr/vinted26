'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import ListingCard from '@/components/ListingCard';

export default function FavouritesPage() {
    const [favourites, setFavourites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data, error } = await supabase
                    .from('favourites')
                    .select(`
                        id,
                        created_at,
                        listing:listings (
                            id,
                            title,
                            price_gbp,
                            is_free,
                            condition,
                            category_id,
                            postcode_area,
                            include_carbon_certificate,
                            carbon_saved_kg,
                            listing_images (
                                image_url
                            )
                        )
                    `)
                    .order('created_at', { ascending: false });

                if (data) {
                    setFavourites(data);
                }
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-secondary-50 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-secondary-900 mb-4">Please Log In</h1>
                <p className="text-secondary-600 mb-6">You need to be logged in to view your favourites.</p>
                <Link href="/auth/login?redirectTo=/favourites" className="btn-primary">
                    Log In
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary-50 py-8">
            <div className="container-custom">
                <h1 className="text-3xl font-bold text-secondary-900 mb-8">My Favourites</h1>

                {favourites.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                        <div className="text-6xl mb-4">❤️</div>
                        <h2 className="text-xl font-semibold text-secondary-900 mb-2">No favourites yet</h2>
                        <p className="text-secondary-500 mb-6">Start browsing to save items you love!</p>
                        <Link href="/" className="btn-primary">
                            Browse Listings
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {favourites.map((fav) => {
                            return (
                                <ListingCard
                                    key={fav.id}
                                    listing={fav.listing}
                                    isFavourited={true}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

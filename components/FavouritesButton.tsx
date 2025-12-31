'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface FavouritesButtonProps {
    listingId: string;
    initialIsFavourited?: boolean;
    className?: string;
}

export default function FavouritesButton({ listingId, initialIsFavourited = false, className = '' }: FavouritesButtonProps) {
    const [isFavourited, setIsFavourited] = useState(initialIsFavourited);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const toggleFavourite = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation if inside a card link
        e.stopPropagation();

        if (isLoading) return;

        // Optimistic update
        const newState = !isFavourited;
        setIsFavourited(newState);
        setIsLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Redirect to login if not logged in
            router.push('/auth/login?redirectTo=' + window.location.pathname);
            return;
        }

        try {
            if (newState) {
                // Add to favourites
                const { error } = await supabase
                    .from('favourites')
                    .insert({ user_id: user.id, listing_id: listingId });
                
                if (error) throw error;
            } else {
                // Remove from favourites
                const { error } = await supabase
                    .from('favourites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('listing_id', listingId);

                if (error) throw error;
            }
            
            router.refresh(); // Refresh server components to update counts etc if needed
        } catch (error) {
            console.error('Error toggling favourite:', error);
            // Revert on error
            setIsFavourited(!newState);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavourite}
            className={`p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200 group ${className}`}
            aria-label={isFavourited ? "Remove from favourites" : "Add to favourites"}
        >
            <svg
                className={`w-5 h-5 transition-colors duration-200 ${isFavourited ? 'text-red-500 fill-current' : 'text-secondary-600 group-hover:text-red-500'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    );
}

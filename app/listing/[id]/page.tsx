import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ListingClient from './ListingClient';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import RelatedListings from './RelatedListings';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();

    const { data: listing } = await supabase
        .from('listings')
        .select('title, description, listing_images(image_url)')
        .eq('id', id)
        .single();

    if (!listing) {
        return {
            title: 'Listing Not Found | Skipped',
        };
    }

    const mainImage = listing.listing_images?.[0]?.image_url || '/placeholder-image.jpg';

    return {
        title: `${listing.title} | Skipped`,
        description: listing.description?.substring(0, 160) || `Buy ${listing.title} on Skipped.`,
        openGraph: {
            title: listing.title,
            description: listing.description?.substring(0, 160),
            images: [mainImage],
        },
    };
}

export default async function ListingPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    // Parallel Fetch: User + Listing
    const [
        { data: { user } },
        { data: listing, error }
    ] = await Promise.all([
        supabase.auth.getUser(),
        supabase
            .from('listings')
            .select(`
            *,
            profiles:seller_id (
                id,
                username,
                avatar_url,
                rating_average,
                created_at
            ),
            categories (
                id,
                name,
                slug
            ),
            listing_images (
                image_url,
                sort_order
            )
        `)
            .eq('id', id)
            .single()
    ]);

    if (error || !listing) {
        notFound();
    }

    // Pass data to Client Component
    return (
        <>
            <ListingClient
                listing={listing}
                user={user}
            />

            {/* Streaming Related Listings */}
            {listing.seller_id && (
                <section className="py-12 bg-secondary-50 border-t border-secondary-200">
                    <div className="container-custom">
                        <h3 className="text-2xl font-bold text-secondary-900 mb-6">More from this seller</h3>
                        <Suspense fallback={<div className="h-64 bg-secondary-200 rounded-xl animate-pulse"></div>}>
                            <RelatedListings sellerId={listing.seller_id} currentListingId={listing.id} />
                        </Suspense>
                    </div>
                </section>
            )}
        </>
    );
}

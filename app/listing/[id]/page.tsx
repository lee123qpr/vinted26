import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ListingClient from './ListingClient';
import { notFound } from 'next/navigation';

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

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Get Listing
    const { data: listing, error } = await supabase
        .from('listings')
        .select(`
            *,
            profiles:seller_id (
                id,
                username,
                avatar_url,
                rating_average,
                is_trade_verified,
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
        .single();

    if (error || !listing) {
        notFound();
    }

    // 3. Get Related Listings
    let relatedListings: any[] = [];
    if (listing.seller_id) {
        const { data: relatedData } = await supabase
            .from('listings')
            .select(`
                id,
                title,
                price_gbp,
                is_free,
                postcode_area,
                condition,
                carbon_saved_kg,
                include_carbon_certificate,
                created_at,
                listing_images (
                    image_url,
                    sort_order
                )
            `)
            .eq('seller_id', listing.seller_id)
            .eq('status', 'active')
            .neq('id', listing.id)
            .limit(4);

        if (relatedData) {
            relatedListings = relatedData;
        }
    }

    // Pass data to Client Component
    return (
        <ListingClient
            listing={listing}
            relatedListings={relatedListings}
            user={user}
        />
    );
}

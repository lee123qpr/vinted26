import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ListingClient from './ListingClient';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import RelatedListings from './RelatedListings';
import JsonLd from '@/components/JsonLd';

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

    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.skipped-uk.com';
    const mainImage = (listing as any).listing_images?.[0]?.image_url;

    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: listing.title,
        description: listing.description,
        ...(mainImage && { image: [mainImage] }),
        brand: { '@type': 'Brand', name: 'Skipped Marketplace' },
        ...(listing.condition && {
            itemCondition: listing.condition === 'new'
                ? 'https://schema.org/NewCondition'
                : listing.condition === 'used_good'
                ? 'https://schema.org/UsedCondition'
                : 'https://schema.org/DamagedCondition',
        }),
        offers: {
            '@type': 'Offer',
            price: (listing as any).is_free ? '0' : (listing as any).price_gbp,
            priceCurrency: 'GBP',
            availability: 'https://schema.org/InStock',
            url: `${BASE_URL}/listing/${listing.id}`,
            seller: {
                '@type': 'Person',
                name: (listing as any).profiles?.username || 'Skipped Seller',
            },
        },
        ...((listing as any).profiles?.rating_average && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: (listing as any).profiles.rating_average,
                bestRating: '5',
                worstRating: '1',
            },
        }),
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Search', item: `${BASE_URL}/search` },
            ...((listing as any).categories ? [{ '@type': 'ListItem', position: 3, name: (listing as any).categories.name, item: `${BASE_URL}/category/${(listing as any).categories.slug}` }] : []),
            { '@type': 'ListItem', position: (listing as any).categories ? 4 : 3, name: listing.title, item: `${BASE_URL}/listing/${listing.id}` },
        ],
    };

    // Pass data to Client Component
    return (
        <>
            <JsonLd data={productSchema} />
            <JsonLd data={breadcrumbSchema} />
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

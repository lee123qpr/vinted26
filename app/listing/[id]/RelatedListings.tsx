
import { createClient } from '@/lib/supabase/server';
import ListingCard from '@/components/ListingCard';

export default async function RelatedListings({ sellerId, currentListingId }: { sellerId: string, currentListingId: string }) {
    const supabase = await createClient();

    // Artificial delay to demonstrate streaming (Optional, remove in prod)
    // await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: relatedListings } = await supabase
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
        .eq('seller_id', sellerId)
        .eq('status', 'active')
        .neq('id', currentListingId)
        .limit(4);

    if (!relatedListings || relatedListings.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedListings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
            ))}
        </div>
    );
}

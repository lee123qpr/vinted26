import { createClient } from '@/lib/supabase/server';
import CheckoutClient from './CheckoutClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ listingId: string }>;
    searchParams?: Promise<{ [key: string]: string | undefined }>;
}

export default async function CheckoutPage(props: Props) {
    const { listingId } = await props.params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/auth/login?redirect=/checkout/${listingId}`);
    }

    const { data: listing, error } = await supabase
        .from('listings')
        .select('*, profiles:seller_id(*), listing_images(image_url)')
        .eq('id', listingId)
        .single();

    // Check for offer in searchParams
    const offerId = (await props.searchParams)?.offerId;
    let acceptedOffer = null;

    if (offerId) {
        const { data: offer } = await supabase
            .from('offers')
            .select('*')
            .eq('id', offerId)
            .eq('status', 'accepted')
            //.eq('buyer_id', user.id) // Ensure only the buyer uses it? Or seller can see? Let's check permissions in Client or just validation.
            // Strict security: buyer must match user.
            .eq('buyer_id', user.id)
            .single();

        if (offer) {
            acceptedOffer = offer;
        }
    }

    if (error || !listing) {
        // Handle error gracefully or redirect
        return <div>Listing not found.</div>;
    }

    // Normalize images structure if needed by client
    // The previous client code accessed `listing_images[0].url || ...image_url`. 
    // Supabase returns array of objects.

    return <CheckoutClient listing={listing} currentUser={user} offer={acceptedOffer} />;
}

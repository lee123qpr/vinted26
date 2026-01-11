import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OffersClient from './OffersClient';

export const dynamic = 'force-dynamic';

export default async function OffersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // 1. Fetch Sent Offers (User is buyer)
    const { data: sentOffers, error: sentError } = await supabase
        .from('offers')
        .select(`
            *,
            listings (
                id,
                title,
                price_gbp,
                status,
                listing_status:status,
                seller_id,
                profiles:seller_id (username, avatar_url)
            )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

    // 2. Fetch Received Offers (User is seller)
    // We need to find offers where the listing belongs to the user
    // Supabase nested filtering is tricky, usually easiest to filter on the joined relation if using inner join
    const { data: receivedOffers, error: receivedError } = await supabase
        .from('offers')
        .select(`
            *,
            listings!inner (
                id,
                title,
                price_gbp,
                status,
                seller_id,
                profiles:seller_id (username, avatar_url)     
            ),
            buyer_profiles:buyer_id (username, avatar_url)
        `)
        .eq('listings.seller_id', user.id)
        .order('created_at', { ascending: false });

    if (sentError) console.error('Error fetching sent offers:', sentError);
    if (receivedError) console.error('Error fetching received offers:', receivedError);

    return (
        <div className="space-y-12">
            <OffersClient
                offers={receivedOffers || []}
                type="received"
            />
            <OffersClient
                offers={sentOffers || []}
                type="sent"
            />
        </div>
    );
}

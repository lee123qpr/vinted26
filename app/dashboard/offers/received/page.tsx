import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OffersClient from '../OffersClient';

export default async function ReceivedOffersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Fetch Received Offers (User is seller)
    const { data: receivedOffers, error: receivedError } = await supabase
        .from('offers')
        .select(`
            *,
            listings!inner (
                id,
                title,
                price_gbp,
                seller_id,
                profiles:seller_id (username, avatar_url)     
            ),
            buyer_profiles:buyer_id (username, avatar_url)
        `)
        .eq('listings.seller_id', user.id)
        .order('created_at', { ascending: false });

    if (receivedError) console.error('Error fetching received offers:', receivedError);

    return (
        <OffersClient
            offers={receivedOffers || []}
            type="received"
        />
    );
}

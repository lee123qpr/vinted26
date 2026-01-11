import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OffersClient from '../OffersClient';

export default async function SentOffersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Fetch Sent Offers (User is buyer)
    const { data: sentOffers, error: sentError } = await supabase
        .from('offers')
        .select(`
            *,
            listings (
                id,
                title,
                price_gbp,
                seller_id,
                profiles:seller_id (username, avatar_url)
            )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

    if (sentError) console.error('Error fetching sent offers:', sentError);

    return (
        <OffersClient
            offers={sentOffers || []}
            type="sent"
        />
    );
}

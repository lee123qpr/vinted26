import { createClient } from '@/lib/supabase/server';
import FavouritesClient from './FavouritesClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function FavouritesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch favourited listings via the join table
    const { data: favourites } = await supabase
        .from('favourites')
        .select(`
            listing_id,
            listings:listing_id (
                *,
                listing_images (
                    image_url,
                    sort_order
                )
            )
        `)
        .eq('user_id', user.id);

    // Extract the actual listings from the join result
    const listings = favourites?.map(f => f.listings).filter(Boolean) || [];

    return <FavouritesClient listings={listings} />;
}

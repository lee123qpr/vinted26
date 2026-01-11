import { createClient } from '@/lib/supabase/server';
import ListingsClient from './ListingsClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MyListingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: listings } = await supabase
        .from('listings')
        .select(`
            *,
            listing_images (
                image_url,
                sort_order
            )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

    return <ListingsClient initialListings={listings || []} />;
}

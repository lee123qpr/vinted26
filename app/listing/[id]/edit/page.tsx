import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ListingForm from '@/components/ListingForm';

export default async function EditListingPage({ params }: { params: { id: string } }) {
    // Await params as required in Next.js 15+ (if using that, but here params is usually accessible directly in page components in 14. In 15 it's async props, but let's assume valid access for now or await if needed)
    // Actually, in standard NextJS data fetching inside component:

    const supabase = await createClient();
    const { id } = await params; // Await params just in case this is latest Next.js

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Fetch Listing
    const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !listing) {
        redirect('/404');
    }

    // Verify Ownership
    if (listing.seller_id !== user.id) {
        redirect('/'); // Or 403
    }

    return <ListingForm mode="edit" initialData={listing} />;
}

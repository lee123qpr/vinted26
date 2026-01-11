'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteAccount() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    try {
        // 1. Anonymize Profile
        // We append a timestamp/random string to username to maintain uniqueness if needed by schema, 
        // though "deleted_user_UUID" is safest.
        const anonymizedName = `Deleted User`;
        const uniqueDeletedUsername = `deleted_${user.id.substring(0, 8)}_${Date.now()}`;

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: anonymizedName,
                username: uniqueDeletedUsername,
                avatar_url: null,
                bio: null,
                location: null,
                postcode_area: null,
                // We keep the ID, so reviews still link to this 'Deleted User'
            })
            .eq('id', user.id);

        if (profileError) {
            console.error('Error anonymizing profile:', profileError);
            return { error: 'Failed to anonymize profile' };
        }

        // 2. Remove Listings
        // Soft delete all active listings
        const { error: listingsError } = await supabase
            .from('listings')
            .update({ status: 'removed' })
            .eq('seller_id', user.id)
            .eq('status', 'active');

        if (listingsError) {
            console.error('Error removing listings:', listingsError);
            // Continue anyway? Usually yes, to ensure account is mostly gone.
        }

        // 3. Sign Out (and ideally ban/disable user if we had Admin access)
        // Since we are running as the user, we can't delete our own Auth record easily without Admin functions.
        // But anonymizing the profile is the key "Public" deletion.

        await supabase.auth.signOut();

    } catch (error) {
        console.error('Delete account error:', error);
        return { error: 'Unexpected error during deletion' };
    }

    // Redirect to home
    redirect('/');
}

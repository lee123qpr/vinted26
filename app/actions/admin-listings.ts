
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function archiveListing(listingId: string) {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('listings')
        .update({ status: 'removed' })
        .eq('id', listingId);

    if (error) throw new Error('Failed to archive listing: ' + error.message);
    revalidatePath('/admin/listings');
}

export async function deleteListing(listingId: string) {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

    if (error) throw new Error('Failed to delete listing: ' + error.message);
    revalidatePath('/admin/listings');
}

export async function bulkArchiveListings(listingIds: string[]) {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('listings')
        .update({ status: 'removed' })
        .in('id', listingIds);

    if (error) throw new Error('Failed to archive listings: ' + error.message);
    revalidatePath('/admin/listings');
    return { success: true, count: listingIds.length };
}

export async function bulkDeleteListings(listingIds: string[]) {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('listings')
        .delete()
        .in('id', listingIds);

    if (error) throw new Error('Failed to delete listings: ' + error.message);
    revalidatePath('/admin/listings');
    return { success: true, count: listingIds.length };
}

export async function bulkUpdateStatus(listingIds: string[], status: string) {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('listings')
        .update({ status })
        .in('id', listingIds);

    if (error) throw new Error('Failed to update listing status: ' + error.message);
    revalidatePath('/admin/listings');
    return { success: true, count: listingIds.length };
}

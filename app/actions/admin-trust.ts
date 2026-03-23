'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function dismissMessageFlag(messageId: string) {
    const supabase = await createAdminClient();
    
    const { error } = await supabase
        .from('messages')
        .update({ is_flagged: false })
        .eq('id', messageId);

    if (error) {
        console.error('Dismiss flag error:', error);
        return { success: false, error: 'Failed to dismiss flag' };
    }

    revalidatePath('/admin/trust-safety');
    return { success: true };
}

export async function suspendUser(userId: string) {
    const supabase = await createAdminClient();
    
    // Suspend user profile
    const { error } = await supabase
        .from('profiles')
        .update({ account_status: 'suspended' })
        .eq('id', userId);

    // Also remove their active listings
    await supabase
        .from('listings')
        .update({ status: 'removed' })
        .eq('seller_id', userId)
        .eq('status', 'active');

    if (error) {
        console.error('Suspend user error:', error);
        return { success: false, error: 'Failed to suspend user' };
    }

    revalidatePath('/admin/trust-safety');
    return { success: true };
}

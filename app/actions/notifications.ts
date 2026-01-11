'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type NotificationType =
    | 'offer_received'
    | 'offer_accepted'
    | 'offer_rejected'
    | 'offer_countered'
    | 'payment_succeeded'
    | 'order_shipped'
    | 'order_completed'
    | 'order_cancelled'
    | 'dispute_raised';

interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    resourceId: string; // The Offer or Transaction ID
    resourceType?: 'offer' | 'transaction';
    data: {
        listingId?: string;
        listingTitle?: string;
        listingImage?: string | null;
        offerAmount?: number;
        message?: string; // Generic message support
        actor_username?: string; // For explicit actors
        counterpartUsername?: string; // Legacy support
        counterpartId?: string;
        link?: string; // Explicit navigation override
    };
}

export async function createNotification(params: CreateNotificationParams) {
    try {
        const admin = await createAdminClient();

        const { error } = await admin
            .from('notifications')
            .insert({
                user_id: params.userId,
                type: params.type,
                resource_id: params.resourceId,
                resource_type: params.resourceType || 'offer',
                data: params.data,
                is_read: false
            });

        if (error) throw error;

        console.log(`Notification created for user ${params.userId} type ${params.type}`);
        return { success: true };

    } catch (error) {
        console.error('Failed to create notification:', error);
        // We generally don't want to block the main flow if notification fails, 
        // but it's good to log.
        return { error: 'Failed to notify user' };
    }
}

export async function markNotificationAsRead(notificationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error reading notification:', error);
        return { error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true };
}

export async function markAllNotificationsAsRead() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true };
}

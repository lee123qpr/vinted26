'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function sendMessage(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to send a message.' };
    }

    const listing_id = (formData.get('listing_id') as string) || null;
    const recipient_id = formData.get('recipient_id') as string;
    const message_text = formData.get('message_text') as string;

    if (!recipient_id || !message_text) {
        return { error: 'Missing required fields' };
    }

    try {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                listing_id,
                sender_id: user.id,
                recipient_id,
                message_text,
                is_read: false
            })
            .select()
            .single();

        if (error) throw error;

        // We don't necessarily need to revalidate path if we rely on the return value to update UI optimistic,
        // but revalidating '/messages' is good practice for consistent state on refresh.
        revalidatePath('/messages');

        return { data };
    } catch (error: any) {
        console.error('Error sending message:', error);
        return { error: error.message };
    }
}

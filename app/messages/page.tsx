import { createClient } from '@/lib/supabase/server';
import MessagesClient from './MessagesClient';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';


interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function MessagesPage({ searchParams }: Props) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Await searchParams for Next.js 15+
    const params = await searchParams;
    const initListingId = params.listing_id as string;
    const initRecipientId = params.recipient_id as string;

    // Fetch messages to build conversations
    // We fetch all messages involving the user, then group them in memory
    const { data: messages } = await supabase
        .from('messages')
        .select(`
            id,
            listing_id,
            sender_id,
            recipient_id,
            message_text,
            created_at,
            is_read,
            listings:listings!listing_id (title, price_gbp),
            sender:profiles!sender_id (username, avatar_url),
            recipient:profiles!recipient_id (username, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });


    if (!messages) { // Simplified condition as the previous one was `!messages && !grouped` but `grouped` is defined later
        console.log("No messages found or error occurred");
    }

    // Grouping logic (same as was in client)
    const grouped = new Map();

    if (messages) {
        messages.forEach(msg => {
            // Debug individual message relations
            if (!msg.listings || !msg.sender || !msg.recipient) {
                console.log('Incomplete message relation:', {
                    id: msg.id,
                    hasListing: !!msg.listings,
                    hasSender: !!msg.sender,
                    hasRecipient: !!msg.recipient
                });
            }
            const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
            const key = `${msg.listing_id}-${otherId}`;

            if (!grouped.has(key)) {
                grouped.set(key, {
                    key,
                    listing_id: msg.listing_id,
                    listing: msg.listings,
                    other_user_id: otherId,
                    other_user: msg.sender_id === user.id ? msg.recipient : msg.sender,
                    last_message: msg,
                    messages: []
                });
            }
            grouped.get(key).messages.push(msg);
        });
    }

    // Handle initialization from URL params
    if ((initListingId || initRecipientId) && user) {
        // Construct the key depending on if it's a listing chat or general DM (null listing_id)
        // If listing_id is missing, we use 'null' string in key to match client logic
        const key = `${initListingId || 'null'}-${initRecipientId}`;

        if (!grouped.has(key)) {
            // New conversation - fetch details
            const promises: PromiseLike<any>[] = [
                supabase.from('profiles').select('username, avatar_url').eq('id', initRecipientId).single()
            ];

            if (initListingId) {
                promises.push(supabase.from('listings').select('title, price_gbp').eq('id', initListingId).single());
            }

            const results = await Promise.all(promises);
            const recipient = results[0].data;
            const listing = initListingId ? results[1]?.data : null;

            if (recipient) {
                const newConvo = {
                    key,
                    listing_id: initListingId || null,
                    listing: listing ? {
                        title: listing.title,
                        price_gbp: listing.price_gbp,
                        images: []
                    } : null,
                    other_user_id: initRecipientId,
                    other_user: recipient,
                    last_message: null, // No messages yet
                    messages: [],
                    isNew: true
                };
                // Prepend (conceptually) - we will add it to the array
                grouped.set(key, newConvo);
            }
        }
    }

    // Convert map to array, ensuring the new one (if created) is at the top if it's new
    let conversArray = Array.from(grouped.values());

    // Sort: New ones (no last message) or most recent message first
    conversArray.sort((a, b) => {
        if (!a.last_message) return -1;
        if (!b.last_message) return 1;
        return new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime();
    });

    // Reverse messages within each conversation to be Chronological (Oldest First) for the chat UI
    conversArray.forEach(c => {
        if (c.messages) {
            c.messages.reverse();
        }
    });

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
            <MessagesClient currentUser={user} initialConversations={conversArray} />
        </Suspense>
    );
}


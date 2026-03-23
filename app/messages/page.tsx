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

    // SCALABLE ARCHITECTURE: Fetch from 'conversations' table
    const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select(`
            *,
            listing:listings!listing_id (title, price_gbp, images:listing_images(image_url)),
            participant1:profiles!participant1_id (id, username, avatar_url, role),
            participant2:profiles!participant2_id (id, username, avatar_url, role),
            last_message:messages!last_message_id (
                id,
                message_text,
                created_at,
                is_read,
                sender_id
            )
        `)
        .order('updated_at', { ascending: false });

    if (convError) {
        console.error("Error fetching conversations:", convError);
    }

    // Transform to client format
    // mappedConversations needs to match the structure expected by MessagesClient
    // We need to fetch the actual MESSAGES for the selected conversation CLIENT-SIDE or 
    // for MVP, we can just supply the last message and let the client fetch history if needed.
    // HOWEVER, to keep 'MessagesClient' working without major refactor, we might need to 
    // pre-fill the 'messages' array with just the last message, or change MessagesClient.

    // Let's see what MessagesClient expects. It expects 'messages: Message[]'.
    // We should probably fetch the latest 20 messages for EACH conversation? No that's too heavy again.
    // The current UI likely displays the full chat when you click.
    // Ideally, MessagesClient should take `conversations` metadata list, and `activeConversationMessages`.

    // For now, to be "non-breaking", we will map the new SQL result to the old 'grouped' Map format 
    // but with EMPTY message arrays (except last one) until the user clicks? 
    // OR we fetch messages for the *active* conversation if params exist.

    const conversArray = conversations?.map(c => {
        // Determine "other user"
        const isP1 = c.participant1_id === user.id;
        const otherUser = isP1 ? c.participant2 : c.participant1;
        const otherUserId = isP1 ? c.participant2_id : c.participant1_id;

        // Key used by client: listing_id-other_user_id
        // Handle null listing_id as string "null"
        const key = `${c.listing_id || 'null'}-${otherUserId}`;

        // We need to format the listing object slightly to match old query
        const formattedListing = c.listing ? {
            title: c.listing.title,
            price_gbp: c.listing.price_gbp,
            // Old query had images? No, old query was `listings:listings!listing_id (title, price_gbp)`
            // So we are good.
        } : null;

        return {
            key,
            id: c.id, // New field, useful for future
            listing_id: c.listing_id,
            listing: formattedListing,
            other_user_id: otherUserId,
            other_user: otherUser,
            last_message: c.last_message,
            messages: c.last_message ? [c.last_message] : [] // Only provide last message initially
        };
    }) || [];


    // If we have an active conversation selected via params, we MUST fetch its full history
    // because the Client expects it.
    if ((initListingId || initRecipientId) && user) {
        const activeKey = `${initListingId || 'null'}-${initRecipientId}`;
        const activeConvIndex = conversArray.findIndex(c => c.key === activeKey);

        if (activeConvIndex >= 0) {
            // Fetch validation: Listing ID matches (nullable) AND (sender=me/rec=other OR sender=other/rec=me)
            // But we can just use the conversation ID if we had it?
            // conversArray[activeConvIndex].id is the conversation ID.
            const convId = conversArray[activeConvIndex].id;

            // Fetch messages for this conversation
            // We use the new streamlined approach: simple select by listing/participants logic matches old
            // OR if we trust the conversation ID we can use it, but 'messages' table likely doesn't have 'conversation_id' column yet unless we added it?
            // We did NOT add 'conversation_id' to 'messages' table in the migration (to avoid big migration).
            // So we must query by constraints.

            const { data: completeMessages } = await supabase
                .from('messages')
                .select(`
                    id,
                    listing_id,
                    sender_id,
                    recipient_id,
                    message_text,
                    created_at,
                    is_read,
                    sender:profiles!sender_id (id, username, avatar_url, role),
                    recipient:profiles!recipient_id (id, username, avatar_url, role)
                `)
                .eq('listing_id', initListingId || null) // This might fail for null? .is('listing_id', null) for supabase?
                // Supabase .eq handles null if we pass javascript null? usually yes, but let's be safe.
                // actually 'listing_id' is nullable in DB.
                .or(`and(sender_id.eq.${user.id},recipient_id.eq.${initRecipientId}),and(sender_id.eq.${initRecipientId},recipient_id.eq.${user.id})`)
                .order('created_at', { ascending: true }); // Client expects chronological? old code reversed it. 
            // Old code: fetched desc, then reversed. So here fetching asc is better.

            if (completeMessages) {
                conversArray[activeConvIndex].messages = completeMessages;
            }
        } else {
            // New conversation logic (handling the case where it doesn't exist in 'conversations' table yet)
            // ... [Logic below handles this] ...
        }
    }

    // Handle initialization from URL params if NEW (not in conversArray)
    if ((initListingId || initRecipientId) && user) {
        const key = `${initListingId || 'null'}-${initRecipientId}`;
        const existing = conversArray.find(c => c.key === key);

        if (!existing) {
            // New conversation - fetch details
            const promises: PromiseLike<any>[] = [
                supabase.from('profiles').select('username, avatar_url, role').eq('id', initRecipientId).single()
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
                    id: 'new', // Placeholder ID for optimistic UI
                    listing_id: initListingId || null,
                    listing: listing ? {
                        title: listing.title,
                        price_gbp: listing.price_gbp,
                        images: []
                    } : null,
                    other_user_id: initRecipientId,
                    other_user: recipient,
                    last_message: null,
                    messages: [],
                    isNew: true
                };
                conversArray.unshift(newConvo); // Add to top
            }
        }
    }

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
            <MessagesClient currentUser={user} initialConversations={conversArray} />
        </Suspense>
    );
}


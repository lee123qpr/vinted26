'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

function MessagesContent() {
    const searchParams = useSearchParams();
    const initListingId = searchParams.get('listing_id');
    const initRecipientId = searchParams.get('recipient_id');

    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Fetch User and Conversations
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Fetch unique conversations (grouped by listing and other party)
                // This is complex in standard SQL without a distinct ON, so we fetch all messages and group client side or use a view.
                // For simplicity, let's fetch my messages and group them.
                const { data, error } = await supabase
                    .from('messages')
                    .select(`
                        id,
                        listing_id,
                        sender_id,
                        recipient_id,
                        message_text,
                        created_at,
                        is_read,
                        listings:listing_id (title, images, price_gbp),
                        sender:sender_id (username, avatar_url),
                        recipient:recipient_id (username, avatar_url)
                    `)
                    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });

                if (data) {
                    // Group by listing_id and the "other" user
                    const grouped = new Map();

                    data.forEach(msg => {
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
                        grouped.get(key).messages.push(msg); // Store raw messages
                    });

                    const convos = Array.from(grouped.values());
                    setConversations(convos);

                    // Check if we need to start/open a specific conversation based on query params
                    if (initListingId && initRecipientId) {
                        const targetKey = `${initListingId}-${initRecipientId}`;
                        const existing = convos.find(c => c.key === targetKey);
                        if (existing) {
                            setActiveConversationId(targetKey);
                        } else {
                            // New conversation logic (removed for brevity, handled by simple "if active but no ID, show empty chat")
                            // We can synthesize a temporary conversation object
                            setActiveConversationId(targetKey);
                            setConversations(prev => [{
                                key: targetKey,
                                listing_id: initListingId,
                                listing: null, // Will fetch or just wait
                                other_user_id: initRecipientId,
                                other_user: null, // Should fetch or wait
                                last_message: { message_text: 'Draft', created_at: new Date().toISOString() },
                                messages: [],
                                isNew: true
                            }, ...prev]);
                        }
                    } else if (convos.length > 0) {
                        setActiveConversationId(convos[0].key);
                    }
                }
            }
            setLoading(false);
        };
        init();
    }, [initListingId, initRecipientId]);

    // Fetch messages for active conversation (or filter from already fetched)
    // Actually, we already grouped them above.

    const activeConversation = conversations.find(c => c.key === activeConversationId);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || !user) return;

        const { listing_id, other_user_id } = activeConversation;

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    listing_id: listing_id, // can be null? Schema allows it? Check schema. Yes nullable. But we prefer scoped to listing.
                    sender_id: user.id,
                    recipient_id: other_user_id,
                    message_text: newMessage
                })
                .select()
                .single();

            if (data) {
                // Update simple state
                setNewMessage('');
                // Ideally refresh data or append to local state
                window.location.reload(); // Brute force refresh for now to be safe
            }
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-secondary-50 flex flex-col items-center justify-center p-4">
                <p className="text-secondary-600 mb-6">Please log in to view messages.</p>
                <Link href="/auth/login" className="btn-primary">Log In</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary-50 py-8">
            <div className="container-custom h-[calc(100vh-8rem)]">
                <div className="bg-white rounded-xl shadow-sm h-full flex overflow-hidden">
                    {/* Sidebar List */}
                    <div className="w-1/3 border-r border-secondary-100 flex flex-col">
                        <div className="p-4 border-b border-secondary-100">
                            <h2 className="text-xl font-bold text-secondary-900">Messages</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {conversations.length === 0 ? (
                                <p className="p-4 text-secondary-500 text-center">No messages yet.</p>
                            ) : (
                                conversations.map(conv => (
                                    <button
                                        key={conv.key}
                                        onClick={() => setActiveConversationId(conv.key)}
                                        className={`w-full p-4 text-left border-b border-secondary-50 hover:bg-primary-50 transition ${activeConversationId === conv.key ? 'bg-primary-50' : ''}`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between">
                                                    <span className="font-semibold text-secondary-900 truncate">
                                                        {conv.other_user?.username || 'User'}
                                                    </span>
                                                    <span className="text-xs text-secondary-500 whitespace-nowrap">
                                                        {conv.last_message.created_at && formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-secondary-500 truncate">
                                                    {conv.listing?.title && <span className="font-medium text-secondary-700">[{conv.listing.title}] </span>}
                                                    {conv.last_message.message_text}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col">
                        {activeConversation ? (
                            <>
                                <div className="p-4 border-b border-secondary-100 flex items-center justify-between bg-white">
                                    <div>
                                        <h3 className="font-bold text-secondary-900">
                                            {activeConversation.other_user?.username || 'Chat'}
                                        </h3>
                                        {activeConversation.listing && (
                                            <Link href={`/listing/${activeConversation.listing_id}`} className="text-sm text-primary-600 hover:underline">
                                                re: {activeConversation.listing.title}
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-50">
                                    {[...activeConversation.messages].reverse().map((msg: any) => (
                                        <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender_id === user.id
                                                    ? 'bg-primary-600 text-white rounded-br-sm'
                                                    : 'bg-white border border-secondary-200 text-secondary-900 rounded-bl-sm'
                                                }`}>
                                                <p>{msg.message_text}</p>
                                                <p className={`text-xs mt-1 ${msg.sender_id === user.id ? 'text-primary-100' : 'text-secondary-400'}`}>
                                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-secondary-100">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        <button type="submit" className="btn-primary" disabled={!newMessage.trim()}>
                                            Send
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-secondary-500">
                                Select a conversation to start chatting
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div>Loading messages...</div>}>
            <MessagesContent />
        </Suspense>
    );
}

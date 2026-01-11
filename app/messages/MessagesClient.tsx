'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/lib/format';
import { sendMessage } from '@/app/actions/messages';

interface Props {
    currentUser: any;
    initialConversations: any[];
}

export default function MessagesClient({ currentUser: user, initialConversations }: Props) {
    const searchParams = useSearchParams();
    const initListingId = searchParams.get('listing_id');
    const initRecipientId = searchParams.get('recipient_id');

    const [conversations, setConversations] = useState<any[]>(initialConversations);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [connectionError, setConnectionError] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeConversationId, conversations]);

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('messages_global')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `recipient_id=eq.${user.id}`,
                },
                async (payload) => {
                    const newMsg = payload.new;

                    setConversations((currentConvos) => {
                        const convoKey = `${newMsg.listing_id || 'null'}-${newMsg.sender_id}`;
                        const existingConvoIndex = currentConvos.findIndex(c => c.key === convoKey);

                        if (existingConvoIndex > -1) {
                            const updatedConvos = [...currentConvos];
                            const convo = updatedConvos[existingConvoIndex];

                            updatedConvos[existingConvoIndex] = {
                                ...convo,
                                last_message: newMsg,
                                messages: [...convo.messages, newMsg],
                            };

                            const [movedConvo] = updatedConvos.splice(existingConvoIndex, 1);
                            updatedConvos.unshift(movedConvo);
                            return updatedConvos;
                        } else {
                            return currentConvos;
                        }
                    });

                    fetchMissingConversation(newMsg);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user.id]);

    const fetchMissingConversation = async (msg: any) => {
        const key = `${msg.listing_id || 'null'}-${msg.sender_id}`;

        const promises: PromiseLike<any>[] = [
            supabase.from('profiles').select('username, avatar_url').eq('id', msg.sender_id).single()
        ];
        if (msg.listing_id) {
            promises.push(supabase.from('listings').select('title, price_gbp').eq('id', msg.listing_id).single());
        }

        const results = await Promise.all(promises);
        const senderProfile = results[0].data;
        const listing = msg.listing_id ? results[1]?.data : null;


        if (senderProfile) {
            const newConvo = {
                key,
                listing_id: msg.listing_id || null,
                listing: listing ? {
                    title: listing.title,
                    price_gbp: listing.price_gbp,
                    images: listing.listing_images
                } : null,
                other_user_id: msg.sender_id,
                other_user: senderProfile,
                last_message: msg,
                messages: [msg],
                is_read: false
            };

            setConversations(prev => {
                if (prev.find(c => c.key === key)) return prev;
                return [newConvo, ...prev];
            });
        }
    };

    // Mark as read
    useEffect(() => {
        if (activeConversationId && user) {
            const activeConvo = conversations.find(c => c.key === activeConversationId);
            if (activeConvo) {
                let query = supabase.from('messages')
                    .update({ is_read: true })
                    .eq('sender_id', activeConvo.other_user_id)
                    .eq('recipient_id', user.id)
                    .eq('is_read', false); // Added is_read check to optimize

                if (activeConvo.listing_id) {
                    query = query.eq('listing_id', activeConvo.listing_id);
                } else {
                    query = query.is('listing_id', null);
                }

                query.then(({ error }) => {
                    if (error) console.error("Error marking read", error);
                });
            }
        }
    }, [activeConversationId, user, conversations]);

    // Initialization Logic
    useEffect(() => {
        if ((initListingId || initRecipientId) && user) {
            const targetKey = `${initListingId || 'null'}-${initRecipientId}`;

            setConversations(prev => {
                const existing = prev.find(c => c.key === targetKey);
                if (existing) {
                    setActiveConversationId(targetKey);
                    return prev;
                }
                return prev;
            });

            const checkAndFetch = async () => {
                const key = `${initListingId || 'null'}-${initRecipientId}`;
                const exists = initialConversations.some(c => c.key === key);

                if (!exists) {
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
                                images: listing.listing_images
                            } : null,
                            other_user_id: initRecipientId,
                            other_user: recipient,
                            last_message: { message_text: '', created_at: new Date().toISOString() },
                            messages: [],
                            isNew: true
                        };
                        setConversations(prev => {
                            if (prev.some(c => c.key === key)) return prev;
                            return [newConvo, ...prev];
                        });
                        setActiveConversationId(key);
                    }
                } else {
                    setActiveConversationId(key);
                }
            };
            checkAndFetch();

        } else if (initialConversations.length > 0 && !activeConversationId) {
            setActiveConversationId(initialConversations[0].key);
        }
    }, [initListingId, initRecipientId, initialConversations, activeConversationId, user.id]);

    const activeConversation = conversations.find(c => c.key === activeConversationId);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || !user) return;

        const { listing_id, other_user_id } = activeConversation;

        const formData = new FormData();
        if (listing_id) formData.append('listing_id', listing_id); // Only append if exists
        formData.append('recipient_id', other_user_id);
        formData.append('message_text', newMessage);

        try {
            const result = await sendMessage(formData);

            if (result.data) {
                setNewMessage('');
                const data = result.data;
                setConversations(prev => {
                    const updatedConvos = prev.map(c => {
                        if (c.key === activeConversation.key) {
                            return {
                                ...c,
                                last_message: data,
                                messages: [...c.messages, data]
                            };
                        }
                        return c;
                    });
                    const [movedConvo] = updatedConvos.splice(updatedConvos.findIndex(c => c.key === activeConversation.key), 1);
                    updatedConvos.unshift(movedConvo);
                    return updatedConvos;
                });
            } else if (result.error) {
                alert('Failed to send message: ' + result.error);
            }
        } catch (err) {
            alert('Failed to send message. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50 py-8">
            <div className="container-custom h-[calc(100vh-8rem)]">
                <div className="bg-white rounded-xl shadow-sm h-full flex overflow-hidden border border-secondary-200">
                    {/* Sidebar List */}
                    <div className="w-1/3 border-r border-secondary-200 flex flex-col bg-white">
                        <div className="p-4 border-b border-secondary-200">
                            <h2 className="text-xl font-bold text-secondary-900">Messages</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {conversations.length === 0 ? (
                                <div className="p-8 text-center text-secondary-500">
                                    <p>No messages yet.</p>
                                </div>
                            ) : (
                                conversations.map(conv => (
                                    <button
                                        key={conv.key}
                                        onClick={() => setActiveConversationId(conv.key)}
                                        className={`w-full p-4 text-left border-b border-secondary-100 hover:bg-primary-50 transition relative ${activeConversationId === conv.key ? 'bg-primary-50 ring-inset ring-2 ring-primary-500' : ''}`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-secondary-100 rounded-full flex-shrink-0 overflow-hidden relative border border-secondary-200">
                                                {conv.other_user?.avatar_url ? (
                                                    <Image
                                                        src={conv.other_user.avatar_url}
                                                        alt={conv.other_user.username}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-secondary-400 font-bold">
                                                        {conv.other_user?.username?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <span className="font-bold text-secondary-900 truncate text-sm">
                                                        {conv.other_user?.username || 'User'}
                                                    </span>
                                                    <span className="text-[10px] text-secondary-500 whitespace-nowrap ml-2">
                                                        {conv.last_message?.created_at && formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-secondary-500 truncate font-medium mb-1">
                                                    {conv.listing?.title || 'Direct Message'}
                                                </div>
                                                <p className={`text-xs truncate ${conv.last_message?.sender_id !== user.id && !conv.last_message?.is_read ? 'text-secondary-900 font-bold' : 'text-secondary-500'}`}>
                                                    {conv.last_message?.sender_id === user.id && 'You: '}
                                                    {conv.last_message?.message_text || 'Draft'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-secondary-50">
                        {activeConversation ? (
                            <>
                                {/* Conversation Header */}
                                <div className="p-4 border-b border-secondary-200 flex items-center justify-between bg-white shadow-sm z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-secondary-100 rounded-md overflow-hidden relative border border-secondary-200 flex-shrink-0 flex items-center justify-center">
                                            {/* Listing Image or Default Icon */}
                                            {activeConversation.listing?.images?.[0]?.image_url ? (
                                                <Image
                                                    src={activeConversation.listing.images[0].image_url}
                                                    alt={activeConversation.listing.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="text-secondary-400">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-secondary-900 text-lg leading-tight">
                                                {activeConversation.listing?.title || 'Direct Message'}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm">
                                                {activeConversation.listing && (
                                                    <>
                                                        <span className="font-semibold text-primary-600">
                                                            {activeConversation.listing.price_gbp ? formatCurrency(activeConversation.listing.price_gbp) : '£-'}
                                                        </span>
                                                        <span className="text-secondary-300">•</span>
                                                        <Link href={`/listing/${activeConversation.listing_id}`} className="text-secondary-500 hover:text-secondary-800 hover:underline">
                                                            View Listing
                                                        </Link>
                                                        <span className="text-secondary-300">•</span>
                                                    </>
                                                )}
                                                <span className="text-secondary-500">
                                                    Chatting with <span className="font-semibold text-secondary-700">{activeConversation.other_user?.username}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages List */}
                                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {activeConversation.messages.map((msg: any) => {
                                        const isMe = msg.sender_id === user.id;
                                        return (
                                            <div key={msg.id || 'draft'} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                                        ? 'bg-primary-600 text-white rounded-br-sm'
                                                        : 'bg-white border border-secondary-200 text-secondary-800 rounded-bl-sm'
                                                        }`}>
                                                        {msg.message_text}
                                                    </div>
                                                    {msg.created_at && (
                                                        <span className="text-[10px] text-secondary-400 mt-1 px-1">
                                                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {activeConversation.messages.length === 0 && (
                                        <div className="text-center py-10 text-secondary-400">
                                            <p>Start a new conversation!</p>
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-secondary-200">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder={`Message ${activeConversation.other_user?.username || 'user'}...`}
                                            className="flex-1 px-5 py-3 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-secondary-50 text-secondary-900 placeholder:text-secondary-400 transition-shadow"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="btn-primary py-3 px-6 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-secondary-400">
                                <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                </div>
                                <p className="text-lg font-medium text-secondary-500">Select a conversation to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

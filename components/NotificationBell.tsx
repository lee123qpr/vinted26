'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/notifications';

interface Notification {
    id: string;
    type: 'offer_received' | 'offer_accepted' | 'offer_rejected' | 'offer_countered' | 'payment_succeeded' | 'order_shipped' | 'order_completed' | 'order_cancelled' | 'dispute_raised';
    resource_id: string;
    data: any;
    is_read: boolean;
    created_at: string;
}

export default function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10); // Show last 10

        if (data) {
            setNotifications(data as Notification[]);
            setUnreadCount(data.filter((n: any) => !n.is_read).length);
        }
    };

    // Subscriptions
    useEffect(() => {
        fetchNotifications();

        const channel = supabase
            .channel('user_notifications')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('Realtime notification:', payload);
                    fetchNotifications();
                    router.refresh(); // Refresh page data too (e.g. offers list)
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, router]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            await markNotificationAsRead(notification.id);
        }
        setIsOpen(false);
        // Navigation logic based on type could go here, or simple link in render
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        await markAllNotificationsAsRead();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'offer_received': return <span className="text-blue-500">📥</span>;
            case 'offer_accepted': return <span className="text-green-500">✅</span>;
            case 'offer_rejected': return <span className="text-red-500">❌</span>;
            case 'offer_countered': return <span className="text-yellow-500">💬</span>;
            case 'payment_succeeded': return <span className="text-green-600">💰</span>; // Seller: Paid
            case 'order_shipped': return <span className="text-blue-600">🚚</span>; // Buyer: Shipped
            case 'order_completed': return <span className="text-teal-600">🎉</span>;
            case 'order_cancelled': return <span className="text-gray-500">🚫</span>;
            case 'dispute_raised': return <span className="text-orange-500">🚨</span>;
            default: return <span>🔔</span>;
        }
    };

    const getLink = (n: Notification) => {
        // Explicit link override
        if (n.data?.link) return n.data.link;

        // Accepted offers -> specific checkout logic or generic offers page
        if (n.type === 'offer_accepted') {
            return `/dashboard/offers/sent`;
        }
        if (n.type === 'payment_succeeded') return '/dashboard/sales';
        if (n.type === 'order_shipped') return '/dashboard/orders';
        // Fallback for older notifications or missing link
        if (n.type === 'order_completed') return '/dashboard/orders';
        if (n.type === 'dispute_raised') return '/dashboard/sales'; // Seller sees dispute

        return n.type.includes('received') ? '/dashboard/offers/received' : '/dashboard/offers/sent';
    };

    const getMessage = (n: Notification) => {
        const name = n.data?.counterpartUsername || n.data?.actor_username || 'Someone';
        const title = n.data?.listingTitle || n.data?.listing_title || 'item';
        const message = n.data?.message;

        if (message) return message; // Use generic message if available

        switch (n.type) {
            case 'offer_received': return `${name} sent an offer on ${title}`;
            case 'offer_accepted': return `${name} accepted your offer on ${title}!`;
            case 'offer_rejected': return `${name} declined your offer on ${title}`;
            case 'offer_countered': return `${name} sent a counter-offer on ${title}`;
            case 'payment_succeeded': return `Great news! ${title} has been purchased. Ship it now.`;
            case 'order_shipped': return `${title} is on its way!`;
            case 'order_completed': return `Transaction for ${title} complete. Funds released.`;
            case 'order_cancelled': return `Order for ${title} was cancelled.`;
            default: return 'New notification';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-secondary-600 hover:text-primary-600 transition p-1 relative"
                aria-label="Notifications"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-secondary-100 overflow-hidden z-[2001] animate-fade-in-down origin-top-right">
                    <div className="px-4 py-3 border-b border-secondary-100 flex justify-between items-center bg-secondary-50/50">
                        <h3 className="font-bold text-sm text-secondary-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-secondary-400">
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-secondary-50">
                                {notifications.map(n => (
                                    <Link
                                        key={n.id}
                                        href={getLink(n)}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`block px-4 py-3 hover:bg-secondary-50 transition ${!n.is_read ? 'bg-primary-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-0.5 text-lg">{getIcon(n.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!n.is_read ? 'font-semibold text-secondary-900' : 'text-secondary-700'}`}>
                                                    {getMessage(n)}
                                                </p>
                                                <p className="text-xs text-secondary-400 mt-1">
                                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                            {!n.is_read && (
                                                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-2 border-t border-secondary-100 text-center bg-secondary-50/30">
                        <Link href="/dashboard/offers/received" onClick={() => setIsOpen(false)} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                            View all offers
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/format';
import { formatDistanceToNow } from 'date-fns';
import { updateOfferStatus } from '@/app/actions/offers';
import { getListingStatusAdmin } from '@/app/actions/listings';
import CountdownTimer from '@/components/CountdownTimer';
import CounterOfferModal from '@/components/CounterOfferModal';

interface Offer {
    id: string;
    amount_gbp: number;
    counter_amount_gbp?: number;
    status: 'pending' | 'accepted' | 'rejected' | 'countered';
    created_at: string;
    expires_at?: string;
    listing_id: string;
    buyer_id: string;
    listings: {
        id: string;
        title: string;
        price_gbp: number;
        status: string;
        listing_status?: string;
        seller_id: string;
        listing_images: { image_url: string }[];
        profiles: { username: string; avatar_url: string | null };
    };
    buyer_profiles?: { username: string; avatar_url: string | null };
}

interface OffersClientProps {
    offers: Offer[];
    type: 'sent' | 'received';
}

export default function OffersClient({ offers, type }: OffersClientProps) {
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [selectedOfferForCounter, setSelectedOfferForCounter] = useState<Offer | null>(null);
    const router = useRouter();

    useEffect(() => {
        const channel = supabase
            .channel('offers_updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'offers'
                },
                (payload) => {
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);

    const handleRespond = async (offerId: string, status: 'accepted' | 'rejected') => {
        if (loadingMap[offerId]) return;

        setLoadingMap(prev => ({ ...prev, [offerId]: true }));
        try {
            const result = await updateOfferStatus(offerId, status);
            if (result?.error) {
                alert(result.error);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        } finally {
            setLoadingMap(prev => ({ ...prev, [offerId]: false }));
        }
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        accepted: 'bg-green-100 text-green-800 border-green-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
        countered: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-secondary-900 capitalize">{type} Offers</h1>

            {/* Content */}
            {offers.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-secondary-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary-50 text-secondary-600 border-b border-secondary-200">
                                <tr>
                                    <th className="px-6 py-4 w-[40%] text-xs font-semibold uppercase tracking-wider">Item</th>
                                    <th className="px-6 py-4 w-[15%] text-xs font-semibold uppercase tracking-wider">
                                        {type === 'sent' ? 'Seller' : 'Buyer'}
                                    </th>
                                    <th className="px-6 py-4 w-[15%] text-xs font-semibold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 w-[15%] text-xs font-semibold uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 w-[15%] text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-100">
                                {offers.map((offer) => {
                                    const isBuyer = type === 'sent';
                                    const isSeller = type === 'received';
                                    const needsAction = (isSeller && offer.status === 'pending') || (isBuyer && offer.status === 'countered');

                                    // RPC Fallback for status
                                    // Keeping the logic inline but simplified for table
                                    const [verifiedStatus, setVerifiedStatus] = useState<string | null>(offer.listings.status || null);
                                    useEffect(() => {
                                        if (offer.status === 'accepted' && !verifiedStatus) {
                                            getListingStatusAdmin(offer.listing_id).then((s: string | null) => s && setVerifiedStatus(s));
                                        }
                                    }, [offer.listing_id, offer.status, verifiedStatus]);

                                    return (
                                        <tr key={offer.id} className="hover:bg-primary-50/10 transition group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative w-12 h-12 bg-secondary-100 rounded-lg overflow-hidden flex-shrink-0 border border-secondary-200">
                                                        {offer.listings?.listing_images?.[0]?.image_url ? (
                                                            <Image src={offer.listings.listing_images[0].image_url} alt={offer.listings.title} fill className="object-cover" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-secondary-400">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">
                                                        <Link href={`/listing/${offer.listing_id}`}>
                                                            {offer.listings.title}
                                                        </Link>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-secondary-600">
                                                {type === 'sent'
                                                    ? offer.listings.profiles?.username || 'Unknown'
                                                    : offer.buyer_profiles?.username || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize border ${statusColors[offer.status] || 'bg-gray-100 text-gray-800'}`}>
                                                        {offer.status}
                                                    </span>
                                                    {offer.status !== 'accepted' && offer.status !== 'rejected' && offer.expires_at && (
                                                        <div className="text-xs text-secondary-500">
                                                            <CountdownTimer expiresAt={offer.expires_at} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {offer.counter_amount_gbp ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-blue-600">{formatCurrency(offer.counter_amount_gbp)}</span>
                                                        <span className="text-xs text-secondary-400 line-through">{formatCurrency(offer.amount_gbp)}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-secondary-900">{formatCurrency(offer.amount_gbp)}</span>
                                                        <span className="text-xs text-secondary-400 line-through">{formatCurrency(offer.listings.price_gbp)}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {needsAction ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleRespond(offer.id, 'accepted')}
                                                                disabled={loadingMap[offer.id]}
                                                                className="px-2 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedOfferForCounter(offer)}
                                                                disabled={loadingMap[offer.id]}
                                                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                                            >
                                                                Counter
                                                            </button>
                                                            <button
                                                                onClick={() => handleRespond(offer.id, 'rejected')}
                                                                disabled={loadingMap[offer.id]}
                                                                className="px-2 py-1 border border-red-200 text-red-600 rounded text-xs font-semibold hover:bg-red-50 transition disabled:opacity-50"
                                                            >
                                                                Decline
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Checkout Button if Accepted & Buyer */}
                                                            {offer.status === 'accepted' && isBuyer && verifiedStatus?.toLowerCase() === 'active' && (
                                                                <Link
                                                                    href={`/checkout/${offer.listing_id}?offerId=${offer.id}`}
                                                                    className="px-3 py-1 bg-primary-600 text-white rounded text-xs font-bold hover:bg-primary-700 transition shadow-sm"
                                                                >
                                                                    Checkout
                                                                </Link>
                                                            )}
                                                            <Link
                                                                href={`/messages?listing_id=${offer.listing_id}&recipient_id=${isBuyer ? offer.listings.seller_id : offer.buyer_id}`}
                                                                className="px-3 py-1 border border-secondary-300 text-secondary-700 rounded text-xs font-semibold hover:bg-secondary-50 transition"
                                                            >
                                                                Chat
                                                            </Link>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-secondary-200 border-dashed">
                    <div className="w-16 h-16 bg-secondary-50 text-secondary-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        {type === 'sent' ? (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        ) : (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 capitalize">No {type} offers</h3>
                    <p className="text-secondary-500 mb-6">
                        {type === 'sent' ? "You haven't made any offers on items yet." : "You haven't received any offers yet."}
                    </p>
                    {type === 'sent' && (
                        <Link href="/" className="btn-primary inline-flex items-center">
                            Browse Listings
                        </Link>
                    )}
                </div>
            )}

            {/* Counter Offer Modal */}
            {
                selectedOfferForCounter && (
                    <CounterOfferModal
                        offerId={selectedOfferForCounter.id}
                        listingTitle={selectedOfferForCounter.listings.title}
                        counterpartName={
                            type === 'sent'
                                ? selectedOfferForCounter.listings.profiles?.username || 'Seller'
                                : selectedOfferForCounter.buyer_profiles?.username || 'Buyer'
                        }
                        currentOfferAmount={
                            // If buyer is countering, they are countering the seller's counter price
                            type === 'sent' && selectedOfferForCounter.status === 'countered'
                                ? selectedOfferForCounter.counter_amount_gbp || 0
                                : selectedOfferForCounter.amount_gbp
                        }
                        isOpen={!!selectedOfferForCounter}
                        onClose={() => setSelectedOfferForCounter(null)}
                        isBuyer={type === 'sent'}
                    />
                )
            }
        </div >
    );
}

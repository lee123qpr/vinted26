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
            <div className="space-y-4">
                {offers.length > 0 ? (
                    offers.map((offer) => {
                        const isBuyer = type === 'sent';
                        const isSeller = type === 'received';

                        // Determine who needs to act based on status
                        // Pending: Seller needs to act
                        // Countered: Buyer needs to act
                        const needsAction = (isSeller && offer.status === 'pending') || (isBuyer && offer.status === 'countered');
                        const waitingForOther = (isBuyer && offer.status === 'pending') || (isSeller && offer.status === 'countered');

                        if (offer.status === 'accepted') {
                            // console.log(`Offer ${offer.id} accepted. Listing status: ${offer.listings.status}`, offer.listings);
                        }

                        // RPC Fallback for status
                        const [verifiedStatus, setVerifiedStatus] = useState<string | null>(offer.listings.status || null);

                        useEffect(() => {
                            if (offer.status === 'accepted' && !verifiedStatus) {
                                // Use Server Action (Admin Client) to bypass RLS
                                getListingStatusAdmin(offer.listing_id)
                                    .then((status: string | null) => {
                                        if (status) {
                                            console.log('Admin Status Success:', status);
                                            setVerifiedStatus(status);
                                        } else {
                                            console.error('Admin Status returned null');
                                            setVerifiedStatus('error');
                                        }
                                    })
                                    .catch((err: any) => {
                                        console.error('Admin Status Action Error:', err);
                                        setVerifiedStatus('error');
                                    });
                            }
                        }, [offer.listing_id, offer.status, verifiedStatus]);

                        return (
                            <div key={offer.id} className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 flex flex-col md:flex-row gap-4 items-start md:items-center hover:shadow-md transition-shadow">

                                {/* Listing Image */}
                                <div className="w-20 h-20 bg-secondary-100 rounded-lg overflow-hidden flex-shrink-0 relative border border-secondary-100">
                                    {offer.listings?.listing_images?.[0]?.image_url ? (
                                        <Image
                                            src={offer.listings.listing_images[0].image_url}
                                            alt={offer.listings.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-secondary-400">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    )}
                                </div>

                                {/* Offer Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <Link href={`/listing/${offer.listing_id}`} className="font-bold text-lg text-secondary-900 hover:text-primary-600 truncate block mb-1">
                                            {offer.listings.title}
                                        </Link>
                                        {offer.status !== 'accepted' && offer.status !== 'rejected' && (
                                            // Timer moved to badges section
                                            null
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-secondary-500 mb-2">
                                        <div className="flex items-center gap-1">
                                            {type === 'sent' ? (
                                                <>
                                                    <span>Seller:</span>
                                                    <span className="font-semibold text-secondary-700">{offer.listings.profiles?.username || 'Unknown'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Buyer:</span>
                                                    <span className="font-semibold text-secondary-700">{offer.buyer_profiles?.username || 'Unknown'}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${statusColors[offer.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {offer.status}
                                        </span>
                                        {offer.status !== 'accepted' && offer.status !== 'rejected' && offer.expires_at && (
                                            <CountdownTimer expiresAt={offer.expires_at} />
                                        )}
                                    </div>
                                </div>

                                {/* Price & Actions */}
                                <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-2 md:mt-0">
                                    <div className="text-right">
                                        {offer.counter_amount_gbp ? (
                                            <>
                                                <p className="text-xs text-secondary-500 mb-0.5 font-medium uppercase tracking-wider">Counter Offer</p>
                                                <p className="text-3xl font-black text-blue-600 tracking-tight">{formatCurrency(offer.counter_amount_gbp)}</p>
                                                <p className="text-xs text-secondary-400 mt-1">Initial Offer: <span className="line-through">{formatCurrency(offer.amount_gbp)}</span></p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-xs text-secondary-500 mb-0.5 font-medium uppercase tracking-wider">Offer Price</p>
                                                <p className="text-3xl font-black text-secondary-900 tracking-tight">{formatCurrency(offer.amount_gbp)}</p>
                                                <p className="text-xs text-secondary-400 mt-1">Listed: <span className="line-through">{formatCurrency(offer.listings.price_gbp)}</span></p>
                                            </>
                                        )}
                                    </div>

                                    {needsAction ? (
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <button
                                                onClick={() => handleRespond(offer.id, 'accepted')}
                                                disabled={loadingMap[offer.id]}
                                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                            >
                                                {offer.counter_amount_gbp ? 'Accept Counter' : 'Accept'}
                                            </button>
                                            <button
                                                onClick={() => setSelectedOfferForCounter(offer)}
                                                disabled={loadingMap[offer.id]}
                                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                            >
                                                Counter
                                            </button>
                                            <button
                                                onClick={() => handleRespond(offer.id, 'rejected')}
                                                disabled={loadingMap[offer.id]}
                                                className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50"
                                            >
                                                Decline
                                            </button>
                                            <Link
                                                href={`/messages?listing_id=${offer.listing_id}&recipient_id=${isBuyer ? offer.listings.seller_id : offer.buyer_id}`}
                                                className="px-3 py-1.5 border border-secondary-300 text-secondary-700 rounded-lg text-sm font-semibold hover:bg-secondary-50 transition"
                                            >
                                                Chat
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="flex flex-row items-center gap-2">
                                            {/* Accepted Offer Actions */}
                                            {offer.status === 'accepted' && isBuyer ? (
                                                (verifiedStatus?.toLowerCase() === 'active') ? (
                                                    <Link
                                                        href={`/checkout/${offer.listing_id}?offerId=${offer.id}`}
                                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition shadow-sm hover:shadow-md animate-pulse-slow w-full md:w-auto text-center"
                                                    >
                                                        Checkout Now
                                                    </Link>
                                                ) : (
                                                    <span className="px-4 py-2 bg-secondary-100 text-secondary-500 rounded-lg text-sm font-bold border border-secondary-200 w-full md:w-auto text-center cursor-not-allowed">
                                                        {verifiedStatus === 'sold' ? 'Sold' : `Unavailable (${verifiedStatus ?? 'Loading'})`}
                                                    </span>
                                                )
                                            ) : offer.status === 'accepted' && isSeller ? (
                                                <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${verifiedStatus === 'sold'
                                                    ? 'text-green-600 bg-green-50 border-green-100'
                                                    : 'text-yellow-600 bg-yellow-50 border-yellow-100'
                                                    }`}>
                                                    {verifiedStatus === 'sold' ? 'Sold via Offer' : 'Awaiting Payment'}
                                                </span>
                                            ) : null}

                                            <Link
                                                href={`/messages?listing_id=${offer.listing_id}&recipient_id=${isBuyer ? offer.listings.seller_id : offer.buyer_id}`}
                                                className="btn-outline px-4 py-2 text-sm w-full md:w-auto text-center"
                                            >
                                                Chat
                                            </Link>
                                        </div>
                                    )}
                                </div>

                            </div>
                        );
                    })
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
            </div>

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

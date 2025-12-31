'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/lib/format';

export default function CheckoutPage({ params }: { params: Promise<{ listingId: string }> }) {
    const { listingId } = use(params);
    const router = useRouter();

    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [deliveryMethod, setDeliveryMethod] = useState<'collection' | 'delivery'>('collection');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push(`/auth/login?redirect=/checkout/${listingId}`);
                    return;
                }
                setUser(user);

                // Fetch listing details
                const { data: listingData, error: listingError } = await supabase
                    .from('listings')
                    .select('*, profiles:seller_id(*)')
                    .eq('id', listingId)
                    .single();

                if (listingError) throw listingError;
                setListing(listingData);

                // Set initial delivery method based on availability
                if (listingData.offers_delivery && !listingData.offers_collection) {
                    setDeliveryMethod('delivery');
                }
            } catch (err: any) {
                console.error('Error fetching checkout data:', err);
                setError(err.message || 'Failed to load checkout details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [listingId, router]);

    const calculateTotal = () => {
        if (!listing) return null;
        let total = listing.price_gbp;
        const platformFee = total * 0.05; // 5% platform fee
        const deliveryFee = deliveryMethod === 'delivery' ? (listing.delivery_charge_gbp || 0) : 0;

        return {
            subtotal: total,
            platformFee,
            deliveryFee,
            total: total + platformFee + deliveryFee
        };
    };

    const handlePurchase = async () => {
        if (!user || !listing) return;
        setProcessing(true);
        setError(null);

        try {
            const totals = calculateTotal();
            if (!totals) throw new Error("Could not calculate totals");

            // 1. Create Transaction Record
            const { data: transaction, error: txError } = await supabase
                .from('transactions')
                .insert({
                    listing_id: listing.id,
                    buyer_id: user.id,
                    seller_id: listing.seller_id,
                    quantity: 1, // Assuming quantity 1 for now
                    total_price_gbp: totals.total,
                    platform_fee_gbp: totals.platformFee,
                    delivery_fee_gbp: totals.deliveryFee,
                    delivery_method: deliveryMethod,
                    delivery_address: deliveryMethod === 'delivery' ? deliveryAddress : null,
                    payment_status: 'pending', // Would be 'held_in_escrow' after Stripe
                    order_status: 'pending'
                })
                .select()
                .single();

            if (txError) throw txError;

            // 2. Mark listing as sold (simple version for now)
            // In a real app we might verify payment first
            const { error: updateError } = await supabase
                .from('listings')
                .update({ status: 'sold' })
                .eq('id', listing.id);

            if (updateError) throw updateError;

            // 3. Redirect to Success/Order page
            // For now, redirect to dashboard or a success page
            alert('Purchase successful! (Mock Payment)');
            router.push('/dashboard');

        } catch (err: any) {
            console.error('Purchase failed:', err);
            setError(err.message || 'Purchase failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-secondary-50 pt-24 pb-12 px-4">
                <div className="container-custom text-center">
                    <h1 className="text-2xl font-bold text-secondary-900 mb-4">Error Loading Checkout</h1>
                    <p className="text-red-500 mb-6">{error || 'Listing not found'}</p>
                    <Link href="/" className="btn-primary">Return Home</Link>
                </div>
            </div>
        );
    }

    const totals = calculateTotal();

    return (
        <div className="min-h-screen bg-secondary-50 pt-8 pb-12">
            <div className="container-custom">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-secondary-900 mb-8">Checkout</h1>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column: Delivery & Payment Details */}
                        <div className="flex-1 space-y-6">

                            {/* Delivery Method */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-200">
                                <h2 className="text-lg font-semibold text-secondary-900 mb-4">Delivery Method</h2>
                                <div className="space-y-3">
                                    {listing.offers_collection && (
                                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${deliveryMethod === 'collection' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-secondary-200 hover:border-secondary-300'}`}>
                                            <input
                                                type="radio"
                                                name="delivery"
                                                value="collection"
                                                checked={deliveryMethod === 'collection'}
                                                onChange={() => setDeliveryMethod('collection')}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
                                            />
                                            <span className="ml-3 flex-1">
                                                <span className="block font-medium text-secondary-900">Collection</span>
                                                <span className="block text-sm text-secondary-500">Collect in person from {listing.postcode_area}</span>
                                            </span>
                                            <span className="font-semibold text-secondary-900">Free</span>
                                        </label>
                                    )}

                                    {listing.offers_delivery && (
                                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${deliveryMethod === 'delivery' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-secondary-200 hover:border-secondary-300'}`}>
                                            <input
                                                type="radio"
                                                name="delivery"
                                                value="delivery"
                                                checked={deliveryMethod === 'delivery'}
                                                onChange={() => setDeliveryMethod('delivery')}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
                                            />
                                            <span className="ml-3 flex-1">
                                                <span className="block font-medium text-secondary-900">Delivery</span>
                                                <span className="block text-sm text-secondary-500">Delivered to your address</span>
                                            </span>
                                            <span className="font-semibold text-secondary-900">{formatCurrency(listing.delivery_charge_gbp)}</span>
                                        </label>
                                    )}
                                </div>

                                {deliveryMethod === 'delivery' && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">Delivery Address</label>
                                        <textarea
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            rows={3}
                                            className="input-field w-full"
                                            placeholder="Enter your full delivery address..."
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Payment Method Stub */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-200">
                                <h2 className="text-lg font-semibold text-secondary-900 mb-4">Payment</h2>
                                <div className="p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                                    <p className="text-sm text-secondary-600 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Secure payment via Stripe (Test Mode)
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="w-full lg:w-96">
                            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 sticky top-24">
                                <div className="p-6 border-b border-secondary-100">
                                    <h2 className="text-lg font-semibold text-secondary-900 mb-4">Order Summary</h2>
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 bg-secondary-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                            {listing.listing_images && listing.listing_images[0] ? (
                                                <Image
                                                    src={listing.listing_images[0].url || listing.listing_images[0].image_url}
                                                    alt={listing.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-secondary-400">
                                                    No Img
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-secondary-900 line-clamp-2">{listing.title}</h3>
                                            <p className="text-sm text-secondary-500 mt-1">{listing.category}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-3">
                                    <div className="flex justify-between text-secondary-600">
                                        <span>Item Price</span>
                                        <span>{formatCurrency(totals?.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-secondary-600">
                                        <span>Delivery</span>
                                        <span>{totals?.deliveryFee === 0 ? 'Free' : formatCurrency(totals?.deliveryFee)}</span>
                                    </div>
                                    <div className="flex justify-between text-secondary-600">
                                        <span>Platform Fee (5%)</span>
                                        <span>{formatCurrency(totals?.platformFee)}</span>
                                    </div>
                                    <div className="pt-3 border-t border-secondary-200 flex justify-between font-bold text-lg text-secondary-900">
                                        <span>Total</span>
                                        <span>{formatCurrency(totals?.total)}</span>
                                    </div>
                                </div>

                                <div className="p-6 pt-0">
                                    <button
                                        onClick={handlePurchase}
                                        disabled={processing || (deliveryMethod === 'delivery' && !deliveryAddress)}
                                        className="w-full btn-primary py-3 text-lg shadow-lg flex justify-center items-center"
                                    >
                                        {processing ? (
                                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        ) : (
                                            'Confirm & Pay'
                                        )}
                                    </button>
                                    <p className="text-xs text-center text-secondary-500 mt-3">
                                        By confirming, you agree to our Terms of Service.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

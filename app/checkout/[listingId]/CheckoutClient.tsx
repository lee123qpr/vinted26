'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { formatCurrency } from '@/lib/format';
import CheckoutForm from '@/components/CheckoutForm';

interface Props {
    listing: any;
    currentUser: any;
    offer?: any;
}

export default function CheckoutClient({ listing, currentUser, offer }: Props) {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Delivery State
    const [selectedMethod, setSelectedMethod] = useState<'collection' | 'local' | 'courier'>('collection');
    const [deliveryAddress, setDeliveryAddress] = useState('');

    // Payment State
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [stripePromise] = useState(() => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!));

    // Initialize delivery method
    useEffect(() => {
        if (!listing) return;
        if (listing.offers_collection) {
            setSelectedMethod('collection');
        } else if (listing.offers_delivery) {
            setSelectedMethod('local');
        } else if (listing.courier_delivery_available && listing.offers_delivery) {
            setSelectedMethod('courier');
        }
    }, [listing]);

    const calculateTotal = () => {
        if (!listing) return null;

        // Use offer price if available
        let itemPrice = listing.price_gbp;
        if (offer) {
            itemPrice = offer.counter_amount_gbp || offer.amount_gbp;
        }

        const platformFee = 0; // Fee is now deducted from seller payout, not added to buyer charge

        let deliveryFee = 0;
        if (selectedMethod === 'local') {
            deliveryFee = listing.delivery_charge_gbp || 0;
        } else if (selectedMethod === 'courier') {
            deliveryFee = listing.courier_delivery_cost_gbp || 0;
        }

        return {
            subtotal: itemPrice,
            platformFee,
            deliveryFee,
            total: itemPrice + deliveryFee
        };
    };

    const initializePayment = async () => {
        if (!currentUser || !listing) return;
        setLoading(true);
        try {
            const deliveryMethod = selectedMethod === 'collection' ? 'collection' : 'delivery';
            const deliveryType = selectedMethod === 'collection' ? null : (selectedMethod === 'local' ? 'local' : 'courier');

            const res = await fetch('/api/stripe/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: listing.id,
                    offerId: offer?.id, // Send offer ID
                    deliveryMethod: deliveryMethod,
                    deliveryType: deliveryType,
                    deliveryAddress: deliveryAddress
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');

            setClientSecret(data.clientSecret);
        } catch (err: any) {
            console.error('Payment Init Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-secondary-50 pt-24 pb-12 px-4">
                <div className="container-custom text-center">
                    <h1 className="text-2xl font-bold text-secondary-900 mb-4">Error Loading Checkout</h1>
                    <p className="text-red-500 mb-6">{error}</p>
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
                        {/* Left Column */}
                        <div className="flex-1 space-y-6">

                            {/* Delivery Method */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-200">
                                <h2 className="text-lg font-semibold text-secondary-900 mb-4">Delivery Method</h2>
                                <div className="space-y-3">
                                    {listing.offers_collection && (
                                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${selectedMethod === 'collection' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-secondary-200 hover:border-secondary-300'}`}>
                                            <input
                                                type="radio"
                                                name="delivery"
                                                value="collection"
                                                checked={selectedMethod === 'collection'}
                                                onChange={() => { setSelectedMethod('collection'); setClientSecret(null); }}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
                                            />
                                            <span className="ml-3 flex-1">
                                                <span className="block font-medium text-secondary-900">Collection</span>
                                                <span className="block text-sm text-secondary-500">Collect from {listing.postcode_area}</span>
                                            </span>
                                            <span className="font-semibold text-secondary-900">Free</span>
                                        </label>
                                    )}

                                    {listing.offers_delivery && listing.delivery_charge_gbp !== null && (
                                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${selectedMethod === 'local' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-secondary-200 hover:border-secondary-300'}`}>
                                            <input
                                                type="radio"
                                                name="delivery"
                                                value="local"
                                                checked={selectedMethod === 'local'}
                                                onChange={() => { setSelectedMethod('local'); setClientSecret(null); }}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
                                            />
                                            <span className="ml-3 flex-1">
                                                <span className="block font-medium text-secondary-900">
                                                    Local Delivery {listing.delivery_radius_miles ? `(up to ${listing.delivery_radius_miles} miles)` : ''}
                                                </span>
                                                <span className="block text-sm text-secondary-500">Local delivery by seller</span>
                                            </span>
                                            <span className="font-semibold text-secondary-900">{formatCurrency(listing.delivery_charge_gbp)}</span>
                                        </label>
                                    )}

                                    {listing.courier_delivery_available && (
                                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${selectedMethod === 'courier' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-secondary-200 hover:border-secondary-300'}`}>
                                            <input
                                                type="radio"
                                                name="delivery"
                                                value="courier"
                                                checked={selectedMethod === 'courier'}
                                                onChange={() => { setSelectedMethod('courier'); setClientSecret(null); }}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
                                            />
                                            <span className="ml-3 flex-1">
                                                <span className="block font-medium text-secondary-900">Nationwide Courier</span>
                                                <span className="block text-sm text-secondary-500">Flat rate delivery UK-wide</span>
                                            </span>
                                            <span className="font-semibold text-secondary-900">{formatCurrency(listing.courier_delivery_cost_gbp)}</span>
                                        </label>
                                    )}
                                </div>

                                {(selectedMethod === 'local' || selectedMethod === 'courier') && (
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

                            {/* Payment Section */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary-200">
                                <h2 className="text-lg font-semibold text-secondary-900 mb-4">Payment</h2>

                                {clientSecret ? (
                                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                        <CheckoutForm
                                            listing={listing}
                                            totals={totals}
                                            deliveryMethod={selectedMethod === 'collection' ? 'collection' : 'delivery'}
                                            deliveryAddress={deliveryAddress}
                                        />
                                    </Elements>
                                ) : (
                                    <div className="text-center py-6">
                                        {(selectedMethod === 'local' || selectedMethod === 'courier') && !deliveryAddress ? (
                                            <p className="text-orange-500 mb-4">Please enter a delivery address to pay.</p>
                                        ) : (
                                            <p className="text-secondary-500 mb-4">Confirm order details to proceed to secure payment.</p>
                                        )}

                                        <button
                                            onClick={initializePayment}
                                            disabled={loading || ((selectedMethod === 'local' || selectedMethod === 'courier') && !deliveryAddress)}
                                            className="btn-primary w-full py-3"
                                        >
                                            {loading ? 'Loading...' : 'Proceed to Payment'}
                                        </button>
                                    </div>
                                )}
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
                                            <Link href={`/listing/${listing.id}`} className="font-medium text-secondary-900 line-clamp-2 hover:text-primary-600 hover:underline">
                                                {listing.title}
                                            </Link>
                                            <p className="text-sm text-secondary-500 mt-1">{listing.category}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-3">
                                    <div className="flex justify-between text-secondary-600">
                                        <span className="flex items-center gap-2">
                                            Item Price
                                            {offer && (
                                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border border-green-200">
                                                    Offer Applied
                                                </span>
                                            )}
                                        </span>
                                        <span className={offer ? "font-bold text-green-600" : ""}>
                                            {formatCurrency(totals?.subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-secondary-600">
                                        <span className="flex items-center gap-1">
                                            Delivery
                                            <span className="text-[10px] bg-secondary-100 text-secondary-600 px-1 rounded uppercase">
                                                {selectedMethod === 'collection' ? 'Collect' : (selectedMethod === 'local' ? 'Local' : 'Courier')}
                                            </span>
                                        </span>
                                        <span>{totals?.deliveryFee === 0 ? 'Free' : formatCurrency(totals?.deliveryFee)}</span>
                                    </div>
                                    <div className="pt-3 border-t border-secondary-200 flex justify-between font-bold text-lg text-secondary-900">
                                        <span>Total</span>
                                        <span>{formatCurrency(totals?.total)}</span>
                                    </div>
                                </div>

                                <div className="p-6 pt-0">
                                    <p className="text-xs text-center text-secondary-500 mt-3">
                                        Secure payment powered by Stripe.
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

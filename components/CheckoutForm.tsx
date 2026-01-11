'use client';

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { formatCurrency } from '@/lib/format';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function CheckoutForm({ listing, totals, deliveryMethod, deliveryAddress }: { listing: any, totals: any, deliveryMethod: string, deliveryAddress: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard/orders`, // Redirect after success
            },
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message || 'Payment failed');
            setProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            try {
                // Call Server Action to securely record order and mark listing sold
                const { recordSuccessfulPayment } = await import('@/app/actions/checkout');

                const result = await recordSuccessfulPayment({
                    listingId: listing.id,
                    paymentIntentId: paymentIntent.id,
                    totalAmount: totals.total,
                    platformFee: totals.platformFee,
                    deliveryFee: totals.deliveryFee,
                    deliveryMethod: deliveryMethod,
                    deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : null
                });

                if (result.error) {
                    setMessage(result.error);
                    setProcessing(false);
                } else if (result.orderId) {
                    router.push(`/checkout/success?orderId=${result.orderId}`);
                } else {
                    router.push('/dashboard/orders');
                }
            } catch (err) {
                console.error('Post-payment error:', err);
                setMessage('Payment succeeded but failed to verify order. Please contact support.');
                setProcessing(false);
            }
        } else {
            setMessage('Payment status: ' + paymentIntent?.status);
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {message && <div className="text-red-500 text-sm">{message}</div>}

            {/* Totals Review inside Form */}
            <div className="pt-4 border-t border-secondary-100 mt-4">
                <div className="flex justify-between font-bold text-lg text-secondary-900 mb-4">
                    <span>Total to Pay</span>
                    <span>{formatCurrency(totals.total)}</span>
                </div>

                <button
                    type="submit"
                    disabled={!stripe || processing}
                    className="w-full btn-primary py-3 text-lg shadow-lg"
                >
                    {processing ? 'Processing...' : `Pay ${formatCurrency(totals.total)}`}
                </button>
            </div>
        </form>
    );
}

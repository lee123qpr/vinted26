'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { createOffer } from '@/app/actions/offers';

interface OfferModalProps {
    listingId: string;
    listingTitle: string;
    price: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function OfferModal({ listingId, listingTitle, price, isOpen, onClose }: OfferModalProps) {
    const [offerAmount, setOfferAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const amount = parseFloat(offerAmount);
        if (!amount || amount <= 0) {
            setError('Please enter a valid amount.');
            setLoading(false);
            return;
        }

        try {
            const result = await createOffer(listingId, amount);

            if (result.error) {
                throw new Error(result.error);
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setOfferAmount('');
            }, 2000);

        } catch (err: any) {
            console.error('Offer Submision Error:', err);
            if (err.message && err.message.includes('must be logged in')) {
                router.push(`/auth/login?redirect=/listing/${listingId}`);
            }
            setError(err.message || 'Failed to submit offer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-fade-in-up">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 transition"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-secondary-900 mb-2">Offer Sent!</h3>
                        <p className="text-secondary-500">The seller has been notified.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-secondary-900 mb-1">Make an Offer</h2>
                        <p className="text-sm text-secondary-500 mb-6">
                            Price listed: <span className="font-semibold text-secondary-900">£{price.toFixed(2)}</span> for "{listingTitle}"
                        </p>

                        {error && (
                            <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Your Price (£)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 font-semibold">£</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={offerAmount}
                                        onChange={(e) => setOfferAmount(e.target.value)}
                                        className="input-field pl-8 text-lg font-bold text-primary-900"
                                        placeholder={(price || 0).toFixed(2)}
                                        autoFocus
                                    />
                                </div>

                                {/* Quick Discount Options */}
                                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                    {[5, 10, 15].map((percent) => {
                                        const discountedPrice = (price * (1 - percent / 100)).toFixed(2);
                                        return (
                                            <button
                                                key={percent}
                                                type="button"
                                                onClick={() => setOfferAmount(discountedPrice)}
                                                className="flex-shrink-0 text-xs px-3 py-1.5 bg-secondary-100 text-secondary-700 rounded-full hover:bg-secondary-200 hover:text-secondary-900 transition-colors border border-secondary-200 font-medium"
                                            >
                                                {percent}% Off (£{discountedPrice})
                                            </button>
                                        );
                                    })}
                                </div>

                                <p className="text-xs text-secondary-400 mt-2">
                                    Offers are binding for 24 hours. The seller can accept, reject, or counter your offer.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3 text-lg shadow-lg"
                            >
                                {loading ? 'Sending...' : 'Send Offer'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

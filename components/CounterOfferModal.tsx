'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { counterOffer } from '@/app/actions/offers';

interface CounterOfferModalProps {
    offerId: string;
    listingTitle: string;
    counterpartName: string;
    currentOfferAmount: number;
    isOpen: boolean;
    onClose: () => void;
    isBuyer?: boolean;
}

export default function CounterOfferModal({ offerId, listingTitle, counterpartName, currentOfferAmount, isOpen, onClose, isBuyer = false }: CounterOfferModalProps) {
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    // Reset state when opening a new offer
    useEffect(() => {
        if (isOpen) {
            // Default to current offer? user can change.
            setAmount(currentOfferAmount.toFixed(2));
            setSuccess(false);
            setError(null);
        }
    }, [isOpen, currentOfferAmount]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const val = parseFloat(amount);
        if (!val || val <= 0) {
            setError('Please enter a valid amount.');
            setLoading(false);
            return;
        }

        try {
            const result = await counterOffer(offerId, val);

            if (result?.error) {
                throw new Error(result.error);
            }

            setSuccess(true);
            router.refresh();

            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err: any) {
            console.error('Counter Offer Error:', err);
            setError(err.message || 'Failed to send counter offer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
                        <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-secondary-900 mb-2">Counter Offer Sent!</h3>
                        <p className="text-secondary-500">The {isBuyer ? 'seller' : 'buyer'} has been notified.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-secondary-900 mb-1">Counter Offer</h2>
                        <p className="text-sm text-secondary-500 mb-6">
                            Responding to <span className="font-semibold text-secondary-900">{counterpartName}'s</span> offer of <span className="font-semibold text-secondary-900">£{currentOfferAmount.toFixed(2)}</span> for "{listingTitle}"
                        </p>

                        {error && (
                            <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Your Counter Price (£)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 font-semibold">£</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-bold text-secondary-900"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-secondary-400 mt-2">
                                    The {isBuyer ? 'seller' : 'buyer'} will be able to accept, reject, or counter this price.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3 text-lg shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? 'Sending...' : 'Send Counter Offer'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

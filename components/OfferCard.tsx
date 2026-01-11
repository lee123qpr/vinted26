'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/lib/format';
import Link from 'next/link';

interface OfferCardProps {
    offer: any;
}

export default function OfferCard({ offer }: OfferCardProps) {
    const [status, setStatus] = useState(offer.status);
    const [loading, setLoading] = useState(false);
    const [showCounterInput, setShowCounterInput] = useState(false);
    const [counterAmount, setCounterAmount] = useState('');

    const handleAction = async (action: 'accept' | 'reject' | 'counter') => {
        if (action === 'counter' && !showCounterInput) {
            setShowCounterInput(true);
            return; // Wait for input
        }

        setLoading(true);
        try {
            const res = await fetch('/api/offers/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    offerId: offer.id,
                    action,
                    counterAmount: action === 'counter' ? parseFloat(counterAmount) : null
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setStatus(data.status); // 'accepted', 'rejected', 'countered'
            setShowCounterInput(false);
        } catch (err) {
            console.error('Action failed:', err);
            alert('Failed to update offer');
        } finally {
            setLoading(false);
        }
    };

    if (status !== 'pending') {
        // Optionally hide card or show status
        // For now, let's just show the status
        return (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-secondary-100 flex justify-between items-center opacity-75">
                <div>
                    <h3 className="font-semibold text-secondary-900">{offer.listings?.title}</h3>
                    <p className="text-sm text-secondary-500">Offer from {offer.buyer?.username}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize 
                    ${status === 'accepted' ? 'bg-green-100 text-green-700' :
                        status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {status}
                </span>
            </div>
        );
    }

    const discountPercent = Math.round(((offer.listings.price_gbp - offer.amount_gbp) / offer.listings.price_gbp) * 100);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 transition hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <Link href={`/listing/${offer.listing_id}`} className="font-bold text-lg text-secondary-900 hover:underline">
                        {offer.listings?.title}
                    </Link>
                    <p className="text-sm text-secondary-500">
                        Listed for {formatCurrency(offer.listings?.price_gbp)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-secondary-400">Offer received</p>
                    <p className="text-sm font-medium">{formatDistanceToNow(new Date(offer.created_at), { addSuffix: true })}</p>
                </div>
            </div>

            <div className="flex items-end justify-between mb-6">
                <div>
                    <p className="text-3xl font-bold text-primary-700">{formatCurrency(offer.amount_gbp)}</p>
                    {discountPercent > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                            {discountPercent}% below asking price
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-sm text-secondary-600">
                        by <span className="font-semibold text-secondary-900">{offer.buyer?.username || 'Buyer'}</span>
                    </p>
                    <div className="text-yellow-400 text-xs mt-1">
                        {'★'.repeat(5)} {/* Mock rating for now */}
                    </div>
                </div>
            </div>

            {showCounterInput ? (
                <div className="bg-secondary-50 p-4 rounded-lg animate-fade-in-up">
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Counter Offer Amount (£)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            step="0.01"
                            value={counterAmount}
                            onChange={(e) => setCounterAmount(e.target.value)}
                            className="input-field flex-1"
                            placeholder="e.g. 40.00"
                            autoFocus
                        />
                        <button
                            onClick={() => handleAction('counter')}
                            disabled={loading || !counterAmount}
                            className="btn-primary px-4 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Send
                        </button>
                        <button
                            onClick={() => setShowCounterInput(false)}
                            className="btn-secondary px-3"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => handleAction('accept')}
                        disabled={loading}
                        className="btn-primary bg-green-600 hover:bg-green-700 text-white py-2"
                    >
                        Accept
                    </button>
                    <button
                        onClick={() => handleAction('counter')}
                        disabled={loading}
                        className="btn-primary bg-purple-600 hover:bg-purple-700 text-white py-2"
                    >
                        Counter
                    </button>
                    <button
                        onClick={() => handleAction('reject')}
                        disabled={loading}
                        className="btn-outline text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 py-2"
                    >
                        Reject
                    </button>
                </div>
            )}
        </div>
    );
}

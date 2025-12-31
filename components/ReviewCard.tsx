'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface Review {
    id: string;
    rating: number;
    review_text: string | null;
    created_at: string;
    reviewer: {
        username: string;
        avatar_url: string | null;
    };
    transaction?: {
        listing?: {
            title: string;
        }
    }
}

export default function ReviewCard({ review }: { review: Review }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-secondary-100 shadow-sm">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-secondary-100">
                        {review.reviewer.avatar_url ? (
                            <Image
                                src={review.reviewer.avatar_url}
                                alt={review.reviewer.username}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-secondary-500 font-bold">
                                {review.reviewer.username[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-secondary-900">{review.reviewer.username}</p>
                        <p className="text-xs text-secondary-500">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </p>
                    </div>
                </div>
                <div className="flex text-yellow-400 text-sm">
                    {'★'.repeat(review.rating)}
                    <span className="text-secondary-300">{'★'.repeat(5 - review.rating)}</span>
                </div>
            </div>

            {review.review_text && (
                <p className="text-secondary-700 text-sm mt-2">{review.review_text}</p>
            )}

            {review.transaction?.listing?.title && (
                <div className="mt-3 pt-3 border-t border-secondary-50 text-xs text-secondary-500">
                    Purchased: <span className="font-medium">{review.transaction.listing.title}</span>
                </div>
            )}
        </div>
    );
}

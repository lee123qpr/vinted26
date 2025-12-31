'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import ReviewCard from '@/components/ReviewCard';
import { format } from 'date-fns';

interface ProfileClientProps {
    profile: any;
    listings: any[];
    reviews: any[];
}

export default function ProfileClient({ profile, listings, reviews }: ProfileClientProps) {
    const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

    if (!profile) {
        return (
            <div className="min-h-screen bg-secondary-50 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-secondary-900">User not found</h1>
                <Link href="/" className="text-primary-600 hover:underline mt-4">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="bg-secondary-50 min-h-screen pb-12">
            {/* Header / Identity Section */}
            <div className="bg-white border-b border-secondary-200">
                <div className="container-custom py-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-secondary-100">
                            {profile.avatar_url ? (
                                <Image src={profile.avatar_url} alt={profile.username} fill sizes="(max-width: 768px) 96px, 128px" className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary-300">
                                    {profile.username[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-2">
                                <h1 className="text-3xl font-bold text-secondary-900">{profile.username}</h1>
                                {profile.is_trade_verified && (
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold flex items-center mb-1">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        Verified Trade Seller
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-center md:justify-start text-yellow-400 space-x-2">
                                <div className="flex text-lg">
                                    {'★'.repeat(Math.round(profile.rating_average || 0))}
                                    <span className="text-secondary-300">{'★'.repeat(5 - Math.round(profile.rating_average || 0))}</span>
                                </div>
                                <span className="text-secondary-500 text-sm">({reviews.length} reviews)</span>
                            </div>

                            <p className="text-secondary-600 max-w-lg mx-auto md:mx-0">{profile.bio || "No bio added yet."}</p>

                            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-secondary-500 pt-2">
                                <span>📍 {profile.postcode_area || 'UK'}</span>
                                <span>📅 Member since {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                            </div>
                        </div>

                        {/* Impact Stats Card */}
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100 min-w-[200px]">
                            <h3 className="font-semibold text-green-900 mb-3 border-b border-green-200 pb-2">Community Impact</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-green-700 uppercase font-bold tracking-wider">Carbon Saved</p>
                                    <p className="text-2xl font-bold text-green-800">{profile.total_carbon_saved_kg?.toFixed(0) || 0}kg</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-green-700 uppercase font-bold tracking-wider">Sold</p>
                                        <p className="text-lg font-bold text-green-800">{profile.total_sales || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-700 uppercase font-bold tracking-wider">Bought</p>
                                        <p className="text-lg font-bold text-green-800">{profile.total_purchases || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="container-custom mt-4">
                    <div className="flex space-x-8 border-b border-secondary-200">
                        <button
                            onClick={() => setActiveTab('listings')}
                            className={`pb-4 px-2 font-medium transition-colors border-b-2 ${activeTab === 'listings'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-secondary-500 hover:text-secondary-800'
                                }`}
                        >
                            Active Listings ({listings.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`pb-4 px-2 font-medium transition-colors border-b-2 ${activeTab === 'reviews'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-secondary-500 hover:text-secondary-800'
                                }`}
                        >
                            Reviews ({reviews.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container-custom py-8">
                {activeTab === 'listings' ? (
                    listings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {listings.map((item) => (
                                <ListingCard key={item.id} listing={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-secondary-500 bg-white rounded-xl shadow-sm">
                            <p className="text-lg">No active listings at the moment.</p>
                        </div>
                    )
                ) : (
                    reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-secondary-500 bg-white rounded-xl shadow-sm">
                            <p className="text-lg">No reviews yet.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

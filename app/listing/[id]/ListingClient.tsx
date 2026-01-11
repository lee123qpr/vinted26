'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import ListingCard from '@/components/ListingCard';
import ImageGallery from '@/components/ImageGallery';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/format';

const MapView = dynamic(() => import('@/components/MapView'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-secondary-100 animate-pulse flex items-center justify-center text-secondary-400">Loading Map...</div>
});

import OfferModal from '@/components/OfferModal';

// ... other imports ...

export default function ListingClient({ listing, relatedListings, user }: { listing: any, relatedListings: any[], user: any }) {
    const router = useRouter();
    const [isFavourite, setIsFavourite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    useEffect(() => {
        const trackView = async () => {
            // Don't count views if the user is the seller
            if (user?.id === listing.seller_id) return;

            if (listing && listing.status === 'active') {
                await supabase.rpc('increment_view_count', { listing_id: listing.id });
            }
        };
        trackView();
    }, [listing, user]);

    // Initial check for favourite could be done here if needed, or passed as prop
    // For now we will keep the toggle logic local as it depends on client interaction

    const handleToggleFavourite = async () => {
        if (!user) {
            router.push(`/auth/login?redirectTo=/listing/${listing.id}`);
            return;
        }
        if (favLoading) return;

        setFavLoading(true);
        try {
            if (isFavourite) {
                // Remove
                await supabase
                    .from('favourites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('listing_id', listing.id);
                setIsFavourite(false);
            } else {
                // Add
                await supabase
                    .from('favourites')
                    .insert({ user_id: user.id, listing_id: listing.id });
                setIsFavourite(true);
            }
            router.refresh();
        } catch (err) {
            console.error('Error toggling favourite', err);
        } finally {
            setFavLoading(false);
        }
    };

    // Safely handle images array from joined table or fallback
    const images = listing.listing_images && listing.listing_images.length > 0
        ? listing.listing_images.sort((a: any, b: any) => a.sort_order - b.sort_order).map((img: any) => img.image_url)
        : ['/placeholder-image.jpg']; // Fallback image

    const isOwner = user?.id === listing.seller_id;

    const conditionColors: Record<string, string> = {
        new_unused: 'bg-green-100 text-green-800 border-green-200',
        like_new: 'bg-blue-100 text-blue-800 border-blue-200',
        good: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        fair: 'bg-orange-100 text-orange-800 border-orange-200',
        for_parts: 'bg-red-100 text-red-800 border-red-200',
    };

    const conditionStyle = listing.condition ? (conditionColors[listing.condition] || 'bg-secondary-100 text-secondary-800 border-secondary-200') : 'bg-secondary-100 text-secondary-800 border-secondary-200';

    return (
        <div className="bg-secondary-50 min-h-screen pb-12">
            <div className="container-custom py-6">

                {/* Breadcrumbs & Actions */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2 text-sm text-secondary-500">
                        <Link href="/" className="hover:text-primary-600">Home</Link>
                        <span>/</span>
                        <Link href={`/category/${listing.categories?.slug || listing.category_id}`} className="hover:text-primary-600 capitalize">
                            {listing.categories?.name || 'Category'}
                        </Link>
                        <span>/</span>
                        <span className="text-secondary-900 truncate max-w-xs">{listing.title}</span>
                    </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Images & Description */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <ImageGallery
                                images={images}
                                alt={listing.title}
                                renderOverlay={() => (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                if (navigator.share) {
                                                    navigator.share({
                                                        title: listing.title,
                                                        text: `Check out this ${listing.title} on Skipped!`,
                                                        url: window.location.href,
                                                    }).catch(console.error);
                                                } else {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    alert('Link copied to clipboard!');
                                                }
                                            }}
                                            className="p-2 rounded-full bg-white/80 text-secondary-600 hover:text-primary-600 hover:bg-white transition shadow-sm"
                                            aria-label="Share listing"
                                            title="Share listing"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={handleToggleFavourite}
                                            className={`p-2 rounded-full transition shadow-sm ${isFavourite
                                                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                                : 'bg-white/80 text-secondary-600 hover:text-red-500 hover:bg-white'
                                                }`}
                                            aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
                                        >
                                            <svg className={`w-6 h-6 ${isFavourite ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            />
                        </div>

                        {/* Description & Details */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-2xl font-bold ${listing.is_free ? 'text-green-600' : 'text-primary-700'}`}>
                                    {listing.is_free ? 'FREE' : formatCurrency(listing.price_gbp)}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full capitalize border ${conditionStyle}`}>
                                    Condition - {listing.condition?.replace('_', ' ')}
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold text-secondary-900 mb-4">{listing.title}</h1>

                            <div className="prose prose-blue max-w-none text-secondary-700 mb-8 whitespace-pre-line">
                                <p>{listing.description}</p>
                            </div>

                            <div className="border-t border-secondary-100 pt-6">
                                <h3 className="font-semibold text-secondary-900 mb-4">Specifications</h3>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    {listing.brand && (
                                        <div>
                                            <span className="text-secondary-500 block">Brand</span>
                                            <span className="font-medium">{listing.brand}</span>
                                        </div>
                                    )}
                                    {listing.dimensions_length_mm && (
                                        <div>
                                            <span className="text-secondary-500 block">Dimensions</span>
                                            <span className="font-medium">{listing.dimensions_length_mm} x {listing.dimensions_width_mm} x {listing.dimensions_height_mm} mm</span>
                                        </div>
                                    )}
                                    {listing.weight_kg && (
                                        <div>
                                            <span className="text-secondary-500 block">Weight</span>
                                            <span className="font-medium">{listing.weight_kg?.toFixed(2)}kg</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-secondary-500 block">Quantity</span>
                                        <span className="font-medium">{listing.quantity_available}</span>
                                    </div>
                                    <div>
                                        <span className="text-secondary-500 block">Posted</span>
                                        <span className="font-medium">
                                            {listing.created_at ? formatDistanceToNow(new Date(listing.created_at), { addSuffix: true }) : 'Recently'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {listing.include_carbon_certificate ? (
                                <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                                    <div className="p-2 bg-white rounded-full text-green-600 shadow-sm">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-900">Carbon Certificate Included</h4>
                                        <p className="text-sm text-green-800 mt-1">
                                            Buying this item prevents <span className="font-bold">{listing.carbon_saved_kg?.toFixed(2)}kg</span> of CO₂ emissions and diverts <span className="font-bold">{listing.weight_kg?.toFixed(2)}kg</span> from landfill. You will receive a verified certificate with your purchase.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-8 bg-secondary-50 border border-secondary-200 rounded-lg p-4 flex items-start space-x-3">
                                    <div className="p-2 bg-white rounded-full text-secondary-400 shadow-sm">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-secondary-900">No Carbon Certificate</h4>
                                        <p className="text-sm text-secondary-600 mt-1">
                                            A carbon savings certificate is not available for this item because the necessary data (weight/material) was not provided by the seller.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Map View */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="font-bold text-secondary-900 mb-4">Location</h3>
                            <div className="h-64 w-full bg-secondary-100 rounded-lg overflow-hidden relative">
                                {listing.location_lat && listing.location_lng ? (
                                    <MapView
                                        listings={[listing]}
                                        center={[listing.location_lat, listing.location_lng]}
                                        zoom={13}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-secondary-500 gap-2">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="font-medium text-lg">{listing.postcode_area || 'Location hidden'}</span>
                                        <span className="text-sm">Location coordinates unavailable</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Seller Info & Actions */}
                    <div className="space-y-6">
                        {/* Buy Action */}
                        <div className="bg-white rounded-xl shadow-sm p-6 relative">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-sm text-secondary-500">Total Price</p>
                                    <p className={`text-3xl font-bold ${listing.is_free ? 'text-green-600' : 'text-primary-700'}`}>
                                        {listing.is_free ? 'FREE' : formatCurrency(listing.price_gbp)}
                                    </p>
                                </div>
                            </div>

                            {listing.status === 'sold' ? (
                                <div className="bg-secondary-100 border-2 border-secondary-300 rounded-lg p-6 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-200 rounded-full mb-3">
                                        <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-secondary-900 mb-1">SOLD</h3>
                                    <p className="text-sm text-secondary-600">This item is no longer available</p>
                                </div>
                            ) : isOwner ? (
                                <div className="bg-secondary-50 border-2 border-secondary-200 rounded-lg p-6 text-center">
                                    <h3 className="text-lg font-bold text-secondary-900 mb-2">This is your listing</h3>
                                    <p className="text-sm text-secondary-600 mb-4">You can manage this item from your dashboard.</p>
                                    <Link href={`/listing/${listing.id}/edit`} className="inline-block w-full btn-secondary text-center py-2">
                                        Edit Details
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <Link href={`/checkout/${listing.id}`} className="block w-full btn-primary text-center py-3 text-lg">
                                            Buy Now
                                        </Link>
                                        <button
                                            onClick={() => setIsOfferModalOpen(true)}
                                            className="block w-full btn-secondary text-center py-3"
                                        >
                                            Make Offer
                                        </button>
                                    </div>

                                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 text-green-800 font-bold mb-1">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            <h3>Buyer Protection</h3>
                                        </div>
                                        <p className="text-sm text-green-700">
                                            Your payment is held securely by us until you confirm you've received the item and are happy with it.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Seller Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            {listing.profiles ? (
                                <>
                                    <div className="flex items-center space-x-4 mb-4">
                                        {listing.profiles.avatar_url ? (
                                            <div className="w-16 h-16 rounded-full overflow-hidden relative">
                                                <Image src={listing.profiles.avatar_url} alt={listing.profiles.username} fill className="object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xl font-bold">
                                                {listing.profiles.username?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-secondary-900 flex items-center">
                                                {listing.profiles.username}
                                                {listing.profiles.is_trade_verified && (
                                                    <span className="ml-1 text-blue-500" title="Verified Trade Seller">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
                                                )}
                                            </h3>
                                            <div className="flex items-center text-sm text-secondary-600 space-x-2 mt-1">
                                                <div className="flex text-yellow-400">
                                                    {'★'.repeat(Math.round(listing.profiles.rating_average || 5))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-secondary-100">
                                        <Link
                                            href={`/messages?listing_id=${listing.id}&recipient_id=${listing.profiles.id}`}
                                            className="block w-full btn-outline text-center py-2"
                                        >
                                            Message Seller
                                        </Link>

                                        <Link href={`/profile/${listing.profiles.id}`} className="block text-center text-sm text-secondary-500 hover:text-primary-600">
                                            View full profile
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="text-secondary-500 italic">Seller information unavailable</div>
                            )}
                        </div>

                        {/* Delivery/Collection */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="font-bold text-secondary-900 mb-4">Delivery & Collection</h3>
                            <div className="space-y-4">
                                {listing.offers_collection && (
                                    <div className="flex items-start space-x-3">
                                        <span className="p-2 bg-green-50 text-green-600 rounded-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </span>
                                        <div>
                                            <p className="font-medium text-secondary-900">Collection Available</p>
                                            <p className="text-sm text-secondary-500">Location: {listing.postcode_area || 'Seller location'}</p>
                                        </div>
                                    </div>
                                )}
                                {listing.offers_delivery && (
                                    <div className="flex items-start space-x-3">
                                        <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </span>
                                        <div>
                                            <p className="font-medium text-secondary-900">Local Delivery Available</p>
                                            <p className="text-sm text-secondary-500">
                                                Up to {listing.delivery_radius_miles} miles (+{formatCurrency(listing.delivery_charge_gbp)})
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {listing.courier_delivery_available && (
                                    <div className="flex items-start space-x-3">
                                        <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                            {/* Truck/Courier Icon */}
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                            </svg>
                                        </span>
                                        <div>
                                            <p className="font-medium text-secondary-900">Nationwide Courier</p>
                                            <p className="text-sm text-secondary-500">
                                                Flat rate (+{formatCurrency(listing.courier_delivery_cost_gbp)})
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {listing.collection_notes && (
                                <div className="pt-3 border-t border-secondary-100">
                                    <p className="font-medium text-secondary-900 text-sm mb-1">Seller Notes:</p>
                                    <p className="text-sm text-secondary-600 italic bg-secondary-50 p-3 rounded-lg">
                                        "{listing.collection_notes}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            </div>

            {
                relatedListings.length > 0 && (
                    <div className="container-custom pt-8 pb-12 border-t border-secondary-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-secondary-900">More from {listing.profiles?.username || 'this seller'}</h2>
                            <Link href={`/profile/${listing.seller_id}`} className="text-primary-600 font-semibold hover:text-primary-700">
                                View all items
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedListings.map((item) => (
                                <ListingCard key={item.id} listing={item} />
                            ))}
                        </div>
                    </div>
                )
            }
            {/* Offer Modal */}
            <OfferModal
                isOpen={isOfferModalOpen}
                onClose={() => setIsOfferModalOpen(false)}
                listingId={listing.id}
                listingTitle={listing.title}
                price={listing.price_gbp}
            />
        </div >
    );
}

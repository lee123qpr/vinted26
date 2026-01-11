'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/format';
import { useEffect, useRef } from 'react';

interface MapViewProps {
    listings: any[];
    center?: [number, number];
    zoom?: number;
}

// Internal component to handle map updates safely
function MapUpdater({ locations }: { locations: [number, number][] }) {
    const map = useMap();

    useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations);
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 13
            });
            map.invalidateSize();
        }
    }, [locations, map]);

    return null;
}

export default function MapView({ listings, center = [53.4808, -2.2426], zoom = 10 }: MapViewProps) {
    useEffect(() => {
        // Fix Leaflet marker icons
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    const validListings = listings.map(l => {
        let imageUrl = null;
        if (l.images && l.images.length > 0) {
            // Handle RPC format or flat array
            imageUrl = typeof l.images[0] === 'string' ? l.images[0] : l.images[0].image_url;
        } else if (l.listing_images && l.listing_images.length > 0) {
            imageUrl = l.listing_images[0].image_url;
        }

        return {
            ...l,
            lat: l.location_lat ?? l.latitude,
            lng: l.location_lng ?? l.longitude,
            displayImage: imageUrl
        };
    }).filter(l => l.lat && l.lng);

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater locations={validListings.map(l => [l.lat, l.lng] as [number, number])} />
            {validListings.map(listing => (
                <Marker
                    key={listing.id}
                    position={[listing.lat, listing.lng]}
                >
                    <Popup className="custom-popup" closeButton={false}>
                        <div className="w-64 p-0 overflow-hidden rounded-lg shadow-lg bg-white font-sans">
                            <div className="relative h-40 w-full bg-gray-100">
                                {listing.displayImage ? (
                                    <Image
                                        src={listing.displayImage}
                                        alt={listing.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 bg-secondary-50">
                                        <span className="text-2xl">📦</span>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                                    {listing.is_free ? (
                                        <span className="text-green-600">FREE</span>
                                    ) : (
                                        <span className="text-primary-700">{formatCurrency(listing.price_gbp)}</span>
                                    )}
                                </div>
                            </div>

                            <div className="p-3">
                                <Link
                                    href={`/listing/${listing.id}`}
                                    className="text-base font-bold text-secondary-900 hover:text-primary-600 transition-colors line-clamp-1 mb-1 block"
                                >
                                    {listing.title}
                                </Link>

                                <div className="flex justify-between items-center text-xs text-secondary-500 mb-3">
                                    <span className="flex items-center">
                                        📍 {listing.postcode_area}
                                    </span>
                                    {listing.condition && (
                                        <span className="capitalize bg-secondary-100 px-1.5 py-0.5 rounded text-secondary-700">
                                            {listing.condition.replace(/_/g, ' ')}
                                        </span>
                                    )}
                                </div>

                                <Link
                                    href={`/listing/${listing.id}`}
                                    className="block w-full text-center bg-primary-600 hover:bg-primary-700 !text-white text-sm font-semibold py-2 rounded transition-colors"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

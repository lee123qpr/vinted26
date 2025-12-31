'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/format';

// Fix Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
    listings: any[];
    center?: [number, number];
    zoom?: number;
}

export default function MapView({ listings, center = [53.4808, -2.2426], zoom = 10 }: MapViewProps) {
    // Filter listings that have coordinates
    const validListings = listings.filter(l => l.location_lat && l.location_lng);

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
            {validListings.map(listing => (
                <Marker
                    key={listing.id}
                    position={[listing.location_lat, listing.location_lng]}
                >
                    <Popup>
                        <div className="w-48">
                            <div className="relative h-32 w-full mb-2 bg-gray-100 rounded overflow-hidden">
                                {listing.listing_images?.[0]?.image_url ? (
                                    <Image
                                        src={listing.listing_images[0].image_url}
                                        alt={listing.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <Link href={`/listing/${listing.id}`} className="font-bold text-sm hover:underline block mb-1">
                                {listing.title}
                            </Link>
                            <div className="flex justify-between items-center">
                                <span className={`font-bold ${listing.is_free ? 'text-green-600' : 'text-blue-600'}`}>
                                    {listing.is_free ? 'FREE' : formatCurrency(listing.price_gbp)}
                                </span>
                                <span className="text-xs text-gray-500">{listing.postcode_area}</span>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function FilterSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initial state from URL
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [conditions, setConditions] = useState<string[]>(searchParams.getAll('condition'));
    const [postcode, setPostcode] = useState(searchParams.get('postcode') || '');
    const [radius, setRadius] = useState(searchParams.get('radius') || '');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Update state when URL changes
    useEffect(() => {
        setMinPrice(searchParams.get('minPrice') || '');
        setMaxPrice(searchParams.get('maxPrice') || '');
        setConditions(searchParams.getAll('condition'));
        setPostcode(searchParams.get('postcode') || '');
        setRadius(searchParams.get('radius') || '');
        setSearchQuery(searchParams.get('q') || '');
    }, [searchParams]);

    const applyFilters = async () => {
        const params = new URLSearchParams(searchParams.toString());

        if (minPrice) params.set('minPrice', minPrice);
        else params.delete('minPrice');

        if (searchQuery) params.set('q', searchQuery);
        else params.delete('q');

        if (maxPrice) params.set('maxPrice', maxPrice);
        else params.delete('maxPrice');

        // Handle multiple condition params
        params.delete('condition');
        conditions.forEach(c => params.append('condition', c));

        // Handle Location
        if (postcode && radius) {
            setIsGeocoding(true);
            try {
                const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
                const data = await res.json();

                if (data.status === 200) {
                    params.set('lat', data.result.latitude);
                    params.set('lng', data.result.longitude);
                    params.set('radius', radius);
                    params.set('postcode', postcode);
                } else {
                    alert('Invalid postcode. Please check and try again.');
                    setIsGeocoding(false);
                    return; // Stop if invalid location
                }
            } catch (error) {
                console.error('Geocoding error:', error);
                alert('Could not verify location. Please try again.');
                setIsGeocoding(false);
                return;
            }
            setIsGeocoding(false);
        } else {
            // Remove location params if cleared
            params.delete('lat');
            params.delete('lng');
            params.delete('radius');
            params.delete('postcode');
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    const handleConditionChange = (condition: string) => {
        setConditions(prev =>
            prev.includes(condition)
                ? prev.filter(c => c !== condition)
                : [...prev, condition]
        );
    };

    const handleReset = () => {
        setMinPrice('');
        setMaxPrice('');
        setConditions([]);
        setPostcode('');
        setRadius('');
        setSearchQuery('');

        const params = new URLSearchParams(searchParams.toString());
        params.delete('minPrice');
        params.delete('maxPrice');
        params.delete('condition');
        params.delete('lat');
        params.delete('lng');
        params.delete('radius');
        params.delete('postcode');
        params.delete('q');

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg text-secondary-900">Filters</h2>
                <button
                    onClick={handleReset}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                    Reset
                </button>
            </div>

            {/* Keywords */}
            <div className="mb-6 pb-6 border-b border-secondary-100">
                <h3 className="font-semibold text-secondary-900 mb-3">Keywords</h3>
                <input
                    type="text"
                    placeholder="Search terms..."
                    aria-label="Filter by keywords"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full input-field text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                />
            </div>

            {/* Location Filter */}
            <div className="mb-6 pb-6 border-b border-secondary-100">
                <h3 className="font-semibold text-secondary-900 mb-3">Location</h3>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Postcode (e.g. SW1A 1AA)"
                        aria-label="Filter by postcode"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                        className="w-full input-field text-sm"
                    />
                    <select
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        aria-label="Filter by radius"
                        className="w-full input-field text-sm"
                    >
                        <option value="">Any distance</option>
                        <option value="5">Within 5 miles</option>
                        <option value="10">Within 10 miles</option>
                        <option value="25">Within 25 miles</option>
                        <option value="50">Within 50 miles</option>
                        <option value="100">Within 100 miles</option>
                    </select>
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
                <h3 className="font-semibold text-secondary-900 mb-3">Price (£)</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        aria-label="Minimum price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full input-field text-sm"
                    />
                    <span className="text-secondary-400">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        aria-label="Maximum price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full input-field text-sm"
                    />
                </div>
            </div>

            {/* Condition */}
            <div className="mb-6">
                <h3 className="font-semibold text-secondary-900 mb-3">Condition</h3>
                <div className="space-y-2">
                    {['new_unused', 'like_new', 'good', 'fair', 'for_parts'].map((condition) => (
                        <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={conditions.includes(condition)}
                                onChange={() => handleConditionChange(condition)}
                                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-secondary-700 capitalize">{condition.replace('_', ' ')}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t border-secondary-100">
                <button
                    className="w-full btn-primary disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={applyFilters}
                    disabled={isGeocoding}
                >
                    {isGeocoding ? 'Updating...' : 'Apply Filters'}
                </button>
            </div>
        </div>
    );
}

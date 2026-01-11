'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Category, SubCategory, SubSubCategory } from '@/types';
import { getCategories, getSubcategories, getSubSubcategories, getMaterials } from '@/app/actions/taxonomy';
import { createListing, updateListing } from '@/app/actions/listings';

interface ListingFormProps {
    mode: 'create' | 'edit';
    initialData?: any; // We can refine this type based on the DB schema
}

export default function ListingForm({ mode, initialData }: ListingFormProps) {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [subSubcategories, setSubSubcategories] = useState<any[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);

    const [materials, setMaterials] = useState<any[]>([]);
    const [selectedMaterialId, setSelectedMaterialId] = useState('');
    const [calculatedWeight, setCalculatedWeight] = useState<number | null>(null);
    const [carbonSaved, setCarbonSaved] = useState<number | null>(null);

    // State for managing images (both existing URLs and new Files)
    // We'll store them as an array where each item is either a string (URL) or File
    const [imageFiles, setImageFiles] = useState<(File | string)[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        subcategoryId: '',
        subSubcategoryId: '',
        brand: '',
        condition: '',
        quantity: 1,
        dimensionsLength: '',
        dimensionsWidth: '',
        dimensionsHeight: '',
        weight: '',
        price: '',
        offersCollection: true,
        offersDelivery: false,
        deliveryRadius: '',
        deliveryCharge: '',
        deliveryChargeType: 'flat_rate',
        courierAvailable: false,
        courierCost: '',
        postcode: '',
        includeCarbonCertificate: false,
        isFree: false,
        collectionNotes: '',
    });

    const conditions = [
        { value: 'new_unused', label: 'New' },
        { value: 'like_new', label: 'Like New' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' },
        { value: 'for_parts', label: 'For Parts' },
    ];

    const [coordinates, setCoordinates] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });

    // --- Data Fetching (Categories & Materials) ---
    useEffect(() => {
        const fetchData = async () => {
            setLoadingCategories(true);

            // Parallel Fetch using Server Actions
            const [catRes, matRes] = await Promise.all([
                getCategories(),
                getMaterials()
            ]);

            if (catRes.error) {
                console.error('Error fetching categories:', catRes.error);
            } else if (catRes.data) {
                setCategories(catRes.data);
            }

            if (matRes.error) {
                console.error('Error fetching materials:', matRes.error);
            } else if (matRes.data) {
                setMaterials(matRes.data);
            }

            setLoadingCategories(false);
        };
        fetchData();
    }, []);

    // --- Initialize Data for Edit Mode ---
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                categoryId: initialData.category_id || '',
                subcategoryId: initialData.subcategory_id || '',
                subSubcategoryId: initialData.sub_subcategory_id || '',
                brand: initialData.brand || '',
                condition: initialData.condition || '',
                quantity: initialData.quantity_available || 1,
                // Map from DB MM columns to form state
                dimensionsLength: initialData.dimensions_length_mm?.toString() || '',
                dimensionsWidth: initialData.dimensions_width_mm?.toString() || '',
                dimensionsHeight: initialData.dimensions_height_mm?.toString() || '',
                weight: initialData.weight_kg ? Number(initialData.weight_kg).toFixed(2) : '',
                price: initialData.price_gbp ? Number(initialData.price_gbp).toFixed(2) : '',
                offersCollection: initialData.offers_collection || false,
                offersDelivery: initialData.offers_delivery || false,
                deliveryRadius: initialData.delivery_radius_miles?.toString() || '',
                deliveryCharge: initialData.delivery_charge_gbp?.toString() || '',
                deliveryChargeType: initialData.delivery_charge_type || 'flat_rate',
                courierAvailable: initialData.courier_delivery_available || false,
                courierCost: initialData.courier_delivery_cost_gbp?.toString() || '',
                postcode: (initialData.postcode_area || '') + ' (verify)',
                includeCarbonCertificate: initialData.include_carbon_certificate || false,
                isFree: initialData.is_free || false,
                collectionNotes: initialData.collection_notes || '',
            });

            if (initialData.listing_material_id) {
                setSelectedMaterialId(initialData.listing_material_id);
            }
            if (initialData.location_lat && initialData.location_lng) {
                setCoordinates({ lat: initialData.location_lat, lng: initialData.location_lng });
                setLocationVerified(true);
            }

            const fetchImages = async () => {
                const { data: imgData } = await supabase.from('listing_images').select('image_url').eq('listing_id', initialData.id).order('sort_order');
                if (imgData) {
                    setImageFiles(imgData.map(i => i.image_url));
                }
            };
            fetchImages();
        }
    }, [mode, initialData]);

    // ... (Geocoding omitted for brevity in match, unchanged) ...
    // Note: Since I am replacing a huge chunk, I should be careful to include the unchanged parts or narrow the range.
    // The instructions say "specify start/end lines". I'll narrow the chunks.

    // ... [Chunk 1: InitialData and Carbon Calc] ... 

    // ... [Chunk 2: Payload] ...

    // ... [Chunk 3: UI Brand & Dimensions Label] ...

    // Wait, the tool only allows ONE contiguous block or MultiReplace. 
    // I should use `multi_replace_file_content` for this distributed change.
    // I will switch to multi_replace_file_content.



    // --- Geocoding Helper ---
    const [isLocating, setIsLocating] = useState(false);
    const [locationVerified, setLocationVerified] = useState(false);

    const getCoordinates = async (postcode: string) => {
        if (!postcode) return null;
        try {
            const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
            const data = await response.json();
            if (data.status === 200 && data.result) {
                return {
                    lat: data.result.latitude,
                    lng: data.result.longitude
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            return null;
        }
    };

    const handlePostcodeBlur = async (postcode: string) => {
        if (!postcode) return;
        setIsLocating(true);
        setLocationVerified(false);
        const coords = await getCoordinates(postcode);
        if (coords) {
            setCoordinates(coords);
            setLocationVerified(true);
        } else {
            console.warn('Could not find coordinates for postcode');
        }
        setIsLocating(false);
    };

    const [subsCache, setSubsCache] = useState<Record<string, SubCategory[]>>({});

    useEffect(() => {
        // Only reset subs if user is manually changing category in create mode or interacting
        // In edit mode initialization, we don't want to wipe them immediately.
        // We can check if formData.categoryId matches initialData.category_id to avoid reset?
        // Simpler: Just fetch subs when categoryId changes.
        // But we need to be careful not to reset subId if it's the initial load.

        if (!formData.categoryId) { setSubcategories([]); return; }

        if (subsCache[formData.categoryId]) {
            setSubcategories(subsCache[formData.categoryId]);
            return;
        }

        const fetchSubcategories = async () => {
            console.log('Fetching subcategories for:', formData.categoryId);
            try {
                setLoadingSubcategories(true);
                // Switch to Server Action here too? 
                // Wait, logic below still uses supabase.from... 
                // I need to SWITCH this to use getSubcategories(formData.categoryId) as per my Plan!
                // I thought I did that? 
                // Looking at the view_file output from Step 2273, lines 208-211 behave like this:
                // const { data, error } = await supabase.from('subcategories')...
                // I MUST HAVE FAILED TO APPLY THE EDIT TO LISTINGFORM BEFORE!

                const { data, error } = await getSubcategories(formData.categoryId);

                if (error) throw error;
                if (data) {
                    console.log('Subs loaded:', data.length);
                    setSubcategories(data);
                    setSubsCache(prev => ({ ...prev, [formData.categoryId]: data }));
                }
            } catch (err) {
                console.error('Error fetching subcategories:', err);
            } finally {
                setLoadingSubcategories(false);
            }
        };
        fetchSubcategories();
    }, [formData.categoryId]);

    useEffect(() => {
        if (!formData.subcategoryId) { setSubSubcategories([]); return; }

        const fetchSubSubcategories = async () => {
            const { data, error } = await getSubSubcategories(formData.subcategoryId);
            if (data) setSubSubcategories(data);
        };
        fetchSubSubcategories();
    }, [formData.subcategoryId]);


    // --- Carbon Calculation Engine ---
    useEffect(() => {
        const calculate = () => {
            const sub = subcategories.find(s => s.id === formData.subcategoryId);
            if (!sub) {
                setCalculatedWeight(null);
                setCarbonSaved(null);
                return;
            }

            let density = sub.default_density_kg_per_m3;
            let carbonFactor = sub.embodied_carbon_kg_per_kg;

            // Handle Ambiguous Materials
            if (sub.is_material_ambiguous && selectedMaterialId) {
                const mat = materials.find(m => m.id === selectedMaterialId);
                if (mat) {
                    density = mat.density_kg_per_m3;
                    if (mat.embodied_carbon_kg_per_kg) {
                        carbonFactor = mat.embodied_carbon_kg_per_kg;
                    }
                }
            }

            // Calculate Volume (mm -> m)
            if (formData.dimensionsLength && formData.dimensionsWidth && formData.dimensionsHeight && density) {
                const l = parseFloat(formData.dimensionsLength) / 1000;
                const w = parseFloat(formData.dimensionsWidth) / 1000;
                const h = parseFloat(formData.dimensionsHeight) / 1000;
                const volumeM3 = l * w * h;

                const totalVolume = volumeM3 * formData.quantity;
                const weight = totalVolume * density;

                setCalculatedWeight(parseFloat(weight.toFixed(2)));
                setCarbonSaved(parseFloat((weight * carbonFactor).toFixed(2)));
            }
            // Fallback: Manual weight
            else if (formData.weight) {
                const w = parseFloat(formData.weight);
                setCalculatedWeight(w);
                setCarbonSaved(parseFloat((w * carbonFactor).toFixed(2)));
            } else {
                setCalculatedWeight(null);
                setCarbonSaved(null);
            }
        };
        calculate();
    }, [formData.dimensionsLength, formData.dimensionsWidth, formData.dimensionsHeight, formData.quantity, formData.weight, formData.subcategoryId, selectedMaterialId, subcategories, materials]);


    // --- Handlers ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...newImages].slice(0, 8));
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        try {
            setUploading(true);
            setError(null);

            // Client-side auth check removed to rely on Server Action & Middleware
            // This prevents "ghost" logouts where client SDK might be out of sync with cookies
            // const { data: { user } } = await supabase.auth.getUser();
            // if (!user) {
            //    setError('You must be logged in.');
            //    router.push('/auth/login');
            //    return;
            // }

            // Validation
            if (!formData.categoryId) throw new Error("Please select a category");
            // Validation
            if (!formData.categoryId) throw new Error("Please select a category");
            if (!formData.title || formData.title.length < 5) throw new Error("Title must be at least 5 characters long");
            if (!formData.description) throw new Error("Description is required");
            if (!formData.description) throw new Error("Description is required");
            if (!formData.isFree && !formData.price) throw new Error("Price is required (or list as Free)");
            if (!formData.condition) throw new Error("Condition is required");

            // Allow empty postcode in edit mode if coordinates are already set (from DB)
            if (mode === 'create' && !formData.postcode) throw new Error("Postcode is required");
            if (mode === 'edit' && !coordinates.lat && !formData.postcode) throw new Error("Postcode/Location is required");

            // Carbon / Weight Validation
            if (!calculatedWeight && !formData.isFree) {
                if (!formData.dimensionsLength && !formData.weight) {
                    throw new Error("Please enter Dimensions OR manual Weight.");
                }
            }

            // Geocoding
            let finalLat = coordinates.lat;
            let finalLng = coordinates.lng;

            if (formData.postcode) {
                // Try to fetch only if postcode provided (it overrides existing)
                // or if we didn't have coords.
                // Ideally if user types postcode, onBlur fires. 
                // But if they just type and submit...
                const fetched = await getCoordinates(formData.postcode);
                if (fetched) {
                    finalLat = fetched.lat;
                    finalLng = fetched.lng;
                }
            }
            if (!finalLat || !finalLng) throw new Error("Could not verify location. Please check postcode.");


            // 1. Prepare FormData
            const payload = new FormData();
            payload.append('categoryId', formData.categoryId);
            payload.append('title', formData.title);
            payload.append('description', formData.description);
            payload.append('condition', formData.condition);
            payload.append('price', formData.price);
            payload.append('quantity', formData.quantity.toString());
            payload.append('isFree', formData.isFree.toString());

            // Optional fields
            if (formData.subcategoryId) payload.append('subcategoryId', formData.subcategoryId);
            if (formData.subSubcategoryId) payload.append('subSubcategoryId', formData.subSubcategoryId);
            if (formData.brand) payload.append('brand', formData.brand);
            if (formData.collectionNotes) payload.append('collectionNotes', formData.collectionNotes);
            if (selectedMaterialId) payload.append('materialId', selectedMaterialId);

            // Dimensions & Weight
            if (formData.weight) payload.append('weight', formData.weight);
            if (formData.dimensionsLength) payload.append('dimensionsLength', formData.dimensionsLength);
            if (formData.dimensionsWidth) payload.append('dimensionsWidth', formData.dimensionsWidth);
            if (formData.dimensionsHeight) payload.append('dimensionsHeight', formData.dimensionsHeight);

            // Carbon
            payload.append('includeCarbonCertificate', (!!calculatedWeight).toString());
            if (carbonSaved) payload.append('carbonSaved', carbonSaved.toString());
            if (calculatedWeight) payload.append('calculatedWeight', calculatedWeight.toString());

            // Logistics
            payload.append('offersCollection', formData.offersCollection.toString());
            payload.append('offersDelivery', formData.offersDelivery.toString());
            if (formData.deliveryRadius) payload.append('deliveryRadius', formData.deliveryRadius);
            if (formData.deliveryCharge) payload.append('deliveryCharge', formData.deliveryCharge);
            payload.append('deliveryChargeType', formData.deliveryChargeType);
            payload.append('courierAvailable', formData.courierAvailable.toString());
            if (formData.courierCost) payload.append('courierCost', formData.courierCost);

            // Location
            if (formData.postcode) payload.append('postcodeArea', formData.postcode.split(' ')[0].trim().toUpperCase());
            if (finalLat) payload.append('lat', finalLat.toString());
            if (finalLng) payload.append('lng', finalLng.toString());

            // Image Handling: Separate existing URLs from new Files
            // NOTE: createListing Server Action currently mainly handles NEW files.
            // Dealing with mixed existing/new images in Edit mode via Server Action is complex (we'd need to tell server which existing URLs to keep).
            // For CREATE mode (which is blocking the user), we just send files.
            // Refinement: Ideally ListingForm handles image state differently. 
            // Let's send ALL files. If it's a File object, append it. If it's a string (URL), we might need logic to keep it (Server Action doesn't support that yet).
            // MVP Fix for "Post Item" (Create Mode):
            if (mode === 'create') {
                // For Create, all images in imageFiles are new Files (or should be).
                // Existing logic ensures they are appended to 'images'.
                for (const img of imageFiles) {
                    if (typeof img !== 'string') {
                        payload.append('images', img);
                    }
                }

                const result = await createListing(payload);
                if (result.error) throw new Error(result.error);
                router.push(`/listing/${result.listingId}`);
            } else {
                // EDIT MODE
                if (!initialData?.id) throw new Error("Missing listing ID for update.");

                // Separate existing URLs (strings) from new Files
                const keepUrls = imageFiles.filter(img => typeof img === 'string') as string[];
                const newFiles = imageFiles.filter(img => typeof img !== 'string') as File[];

                for (const url of keepUrls) payload.append('keepUrls', url);
                for (const file of newFiles) payload.append('images', file);

                const result = await updateListing(initialData.id, payload);
                if (result.error) throw new Error(result.error);

                router.refresh();
                router.push(`/listing/${result.listingId}`);
            }

        } catch (err: any) {
            console.error('Error submitting form:', err);
            // ... error handling ...
            setError(err.message || 'Failed to submit.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50 py-8">
            <div className="container-custom max-w-5xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-secondary-900">{mode === 'edit' ? 'Edit Listing' : 'List an Item'}</h1>
                </div>

                {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Main Inputs */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Photos */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-3">Photos</h2>
                            <div className="flex flex-wrap gap-3">
                                {imageFiles.map((img, index) => (
                                    <div key={index} className="relative w-24 h-24 bg-secondary-100 rounded-lg overflow-hidden border border-secondary-200">
                                        <img
                                            src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button onClick={() => removeImage(index)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 text-xs">×</button>
                                    </div>
                                ))}
                                {imageFiles.length < 8 && (
                                    <label className="w-24 h-24 border-2 border-dashed border-secondary-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 bg-secondary-50 text-secondary-500 hover:text-primary-600 transition-colors">
                                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        <span className="text-xs font-medium">Add Photo</span>
                                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                                    </label>
                                )}
                            </div>
                            <p className="text-xs text-secondary-500 mt-2">First photo is cover. Max 8 photos. Supports JPG, PNG.</p>
                        </div>

                        {/* 2. Details */}
                        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="label text-xs">Title <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="input-field" placeholder="e.g. 50x Red Bricks" maxLength={100} />
                                    <p className="text-[10px] text-secondary-500 mt-1">Minimum 5 characters. Be descriptive!</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="label text-xs">Description <span className="text-red-500">*</span></label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input-field h-24 text-sm" placeholder="Describe condition, history..." maxLength={2000} />
                                    <p className="text-[10px] text-secondary-500 mt-1">Include details about condition, age, and any defects.</p>
                                </div>

                                {/* Category Row */}
                                <div>
                                    <label className="label text-xs">Category <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="input-field text-sm"
                                        disabled={loadingCategories}
                                    >
                                        <option value="">{loadingCategories ? 'Loading...' : 'Select Category...'}</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label text-xs">Subcategory</label>
                                    <select
                                        value={formData.subcategoryId}
                                        disabled={!formData.categoryId || loadingSubcategories}
                                        onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })}
                                        className="input-field text-sm disabled:bg-secondary-50"
                                    >
                                        <option value="">{loadingSubcategories ? 'Loading...' : 'Select...'}</option>
                                        {subcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                                    </select>
                                </div>
                                {subSubcategories.length > 0 && (
                                    <div className="md:col-span-2">
                                        <label className="label text-xs">Specific Type</label>
                                        <select value={formData.subSubcategoryId} onChange={e => setFormData({ ...formData, subSubcategoryId: e.target.value })} className="input-field text-sm">
                                            <option value="">Select...</option>
                                            {subSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="label text-xs">Brand</label>
                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={e => {
                                            // Capitalise first letter of each word
                                            const val = e.target.value.replace(/\b\w/g, l => l.toUpperCase());
                                            setFormData({ ...formData, brand: val });
                                        }}
                                        className="input-field text-sm"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <label className="label text-xs">Condition <span className="text-red-500">*</span></label>
                                    <select value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="input-field text-sm">
                                        <option value="">Select...</option>
                                        {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 3. Specifications */}
                        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                            <div className="flex justify-between items-end border-b pb-2 mb-2">
                                <h2 className="text-lg font-semibold">Item Specifications</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <label className="label text-xs">Dimensions (mm)</label>
                                    <div className="flex space-x-2">
                                        <input type="number" placeholder="L" value={formData.dimensionsLength} onChange={e => setFormData({ ...formData, dimensionsLength: e.target.value })} className="input-field text-sm px-2 text-center" />
                                        <span className="self-center text-secondary-400">x</span>
                                        <input type="number" placeholder="W" value={formData.dimensionsWidth} onChange={e => setFormData({ ...formData, dimensionsWidth: e.target.value })} className="input-field text-sm px-2 text-center" />
                                        <span className="self-center text-secondary-400">x</span>
                                        <input type="number" placeholder="H" value={formData.dimensionsHeight} onChange={e => setFormData({ ...formData, dimensionsHeight: e.target.value })} className="input-field text-sm px-2 text-center" />
                                    </div>
                                </div>

                                <div>
                                    <label className="label text-xs">Quantity <span className="text-red-500">*</span></label>
                                    <input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} className="input-field text-sm" min="1" />
                                </div>
                            </div>
                        </div>

                        {/* 4. Price */}
                        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                            <div className="flex justify-between items-end border-b pb-2 mb-2">
                                <h2 className="text-lg font-semibold">Price</h2>
                            </div>

                            <div className="max-w-xs">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="label text-base font-semibold text-secondary-900">Asking Price (£)</label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isFree}
                                            onChange={e => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    isFree: e.target.checked,
                                                    price: e.target.checked ? '0' : prev.price
                                                }));
                                            }}
                                            className="rounded border-green-300 text-green-600 focus:ring-green-500 w-5 h-5"
                                        />
                                        <span className="text-base font-semibold text-green-700">Mark as Free</span>
                                    </label>
                                </div>
                                <div className="relative">
                                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${formData.isFree ? 'text-secondary-300' : 'text-primary-800'}`}>£</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={formData.price}
                                        disabled={formData.isFree}
                                        onChange={e => {
                                            // Allow only numbers and decimals
                                            const val = e.target.value;
                                            if (/^[\d,.]*$/.test(val)) {
                                                setFormData({ ...formData, price: val });
                                            }
                                        }}
                                        onBlur={e => {
                                            // Parse string, remove commas, format
                                            const raw = e.target.value.replace(/,/g, '');
                                            const val = parseFloat(raw);
                                            if (!isNaN(val)) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    price: val.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                }));
                                            }
                                        }}
                                        className={`input-field text-lg pl-7 font-bold ${formData.isFree ? 'bg-secondary-100 text-secondary-400' : 'text-primary-900 border-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'}`}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Delivery & Submit */}
                    <div className="space-y-6">

                        {/* Sustainability Card */}
                        <div className="bg-emerald-50 rounded-xl shadow-sm border-2 border-emerald-100 p-5 relative overflow-hidden">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl"></div>

                            {/* Dynamic Guidance Logic */}
                            {(() => {
                                const selectedSub = subcategories.find(s => s.id === formData.subcategoryId);
                                const isManualWeightRequired = selectedSub && !selectedSub.default_density_kg_per_m3 && !selectedSub.is_material_ambiguous;
                                const hasResult = calculatedWeight !== null;

                                return (
                                    <>
                                        <div className="flex items-start space-x-4 mb-4 relative z-10">
                                            <div className={`p-3 rounded-full shrink-0 ${hasResult ? 'bg-emerald-200 text-emerald-800' : 'bg-emerald-100 text-emerald-600'}`}>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base text-emerald-950">
                                                    {hasResult ? 'Certificate Unlocked!' : 'Carbon Certificate'}
                                                </h3>
                                                <p className="text-sm text-emerald-800 mt-1 font-medium leading-snug">
                                                    {hasResult
                                                        ? "Great! Your listing now includes an environmental impact certificate."
                                                        : isManualWeightRequired
                                                            ? "We can't guess the weight of this item. Please enter the Weight below to unlock."
                                                            : "Enter Dimensions (or Weight) to unlock."
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Material Selector (Conditional) */}
                                        {selectedSub?.is_material_ambiguous && (
                                            <div className="mb-4 relative z-10">
                                                <label className="label text-xs text-yellow-800 font-bold uppercase tracking-wide mb-1">What is this made of?</label>
                                                <select
                                                    value={selectedMaterialId}
                                                    onChange={e => setSelectedMaterialId(e.target.value)}
                                                    className="input-field text-sm border-2 border-yellow-200 bg-yellow-50 focus:ring-yellow-500 font-medium text-yellow-900"
                                                >
                                                    <option value="">Select Material...</option>
                                                    {materials.map(m => (
                                                        <option key={m.id} value={m.id}>{m.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Results Display */}
                                        {hasResult && (
                                            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-4 border border-emerald-200 relative z-10 shadow-sm">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Est. Weight</span>
                                                    <span className="text-lg font-bold text-emerald-900">{calculatedWeight?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Carbon Saved</span>
                                                    <span className="text-lg font-bold text-emerald-900">{carbonSaved?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg CO₂e</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 pt-4 border-t border-emerald-200/60 relative z-10">
                                            <label className={`label text-xs font-bold uppercase tracking-wider mb-2 ${isManualWeightRequired ? "text-orange-700" : "text-emerald-700"}`}>
                                                {isManualWeightRequired ? "Manual Weight (Required for Certificate)" : "Manual Weight Override (Optional)"}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={formData.weight}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        if (/^[\d,.]*$/.test(val)) {
                                                            setFormData({ ...formData, weight: val });
                                                        }
                                                    }}
                                                    onBlur={e => {
                                                        const raw = e.target.value.replace(/,/g, '');
                                                        const val = parseFloat(raw);
                                                        if (!isNaN(val)) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                weight: val.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                            }));
                                                        }
                                                    }}
                                                    className={`input-field text-sm py-2 pl-3 font-semibold shadow-sm ${isManualWeightRequired && !formData.weight
                                                        ? 'border-2 border-orange-300 bg-orange-50 text-orange-900 placeholder-orange-400 focus:border-orange-500 focus:ring-orange-200'
                                                        : 'border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200 text-emerald-900 placeholder-emerald-400'
                                                        }`}
                                                    placeholder="Enter weight..."
                                                />
                                                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${isManualWeightRequired ? 'text-orange-600' : 'text-emerald-600'}`}>kg</span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Logistics */}
                        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
                            <h2 className="text-md font-semibold border-b pb-2">Logistics</h2>

                            <div className="relative">
                                <label className="label text-xs">Location Postcode <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.postcode}
                                    onChange={e => setFormData({ ...formData, postcode: e.target.value.toUpperCase() })}
                                    onBlur={(e) => handlePostcodeBlur(e.target.value)}
                                    className={`input-field text-sm pr-10 ${locationVerified ? 'border-green-500 focus:ring-green-500' : ''}`}
                                    placeholder={mode === 'edit' && !formData.postcode ? 'Confirmed (Change to update)' : 'SW1A 1AA'}
                                />
                                <div className="absolute right-3 top-7 pointer-events-none">
                                    {isLocating && <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>}
                                    {locationVerified && !isLocating && <span className="text-green-500 font-bold">✓</span>}
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="flex items-center space-x-2 text-sm">
// ... (unchanged checkboxes omitted for brevity, but tool requires contiguous block. I'll include them)
                                    <input type="checkbox" checked={formData.offersCollection} onChange={e => setFormData({ ...formData, offersCollection: e.target.checked })} className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
                                    <span>Collection Available</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" checked={formData.offersDelivery} onChange={e => setFormData({ ...formData, offersDelivery: e.target.checked })} className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
                                    <span>Delivery Available</span>
                                </label>
                            </div>

                            {formData.offersDelivery && (
                                <div className="space-y-4 pl-6 border-l-2 border-secondary-100">
                                    {/* Local Delivery Option */}
                                    <div className="bg-secondary-50 p-3 rounded-lg">
                                        <h3 className="text-xs font-semibold text-secondary-900 mb-2 uppercase tracking-wide">Local Delivery</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="label text-[10px]">Max Radius (miles)</label>
                                                <input
                                                    type="number"
                                                    value={formData.deliveryRadius}
                                                    onChange={e => setFormData({ ...formData, deliveryRadius: e.target.value })}
                                                    className="input-field text-sm py-1"
                                                    placeholder="e.g. 20"
                                                />
                                            </div>
                                            <div>
                                                <label className="label text-[10px]">Cost (£)</label>
                                                <input
                                                    type="number"
                                                    value={formData.deliveryCharge}
                                                    onChange={e => setFormData({ ...formData, deliveryCharge: e.target.value })}
                                                    className="input-field text-sm py-1"
                                                    placeholder="e.g. 15"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Courier Option (New) */}
                                    <div className="bg-secondary-50 p-3 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xs font-semibold text-secondary-900 uppercase tracking-wide">Nationwide Courier</h3>
                                            <input
                                                type="checkbox"
                                                checked={formData.courierAvailable}
                                                onChange={e => setFormData({ ...formData, courierAvailable: e.target.checked })}
                                                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                                            />
                                        </div>

                                        {formData.courierAvailable && (
                                            <div>
                                                <label className="label text-[10px]">Courier Cost (£)</label>
                                                <input
                                                    type="number"
                                                    value={formData.courierCost}
                                                    onChange={e => setFormData({ ...formData, courierCost: e.target.value })}
                                                    className="input-field text-sm py-1"
                                                    placeholder="e.g. 50"
                                                />
                                                <p className="text-[10px] text-secondary-500 mt-1">Flat rate for nationwide delivery.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="label text-xs">Notes <span className="text-secondary-400 font-normal">(Optional)</span></label>
                                <textarea
                                    value={formData.collectionNotes}
                                    onChange={e => setFormData({ ...formData, collectionNotes: e.target.value })}
                                    className="input-field h-20 text-sm"
                                    placeholder="Available weekends only..."
                                    maxLength={500}
                                />
                            </div>
                        </div>

                        {/* Submit Action */}
                        <div className="sticky bottom-4">
                            <button
                                onClick={handleSubmit}
                                disabled={uploading}
                                className="w-full btn-primary py-4 text-base shadow-lg shadow-primary-900/10 transition-transform active:scale-[0.98] flex items-center justify-center space-x-2"
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        <span>{mode === 'edit' ? 'Updating...' : 'Publishing...'}</span>
                                    </>
                                ) : (
                                    <span>{mode === 'edit' ? 'Save Changes' : 'Publish Listing'}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

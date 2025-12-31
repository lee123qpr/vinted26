'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

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
            const { data: catData } = await supabase.from('categories').select('id, name, slug').order('name');
            if (catData) setCategories(catData);
            setLoadingCategories(false);

            const { data: matData } = await supabase.from('materials').select('*').order('name');
            if (matData) setMaterials(matData);
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
                dimensionsLength: initialData.dimensions_length_cm?.toString() || '',
                dimensionsWidth: initialData.dimensions_width_cm?.toString() || '',
                dimensionsHeight: initialData.dimensions_height_cm?.toString() || '',
                weight: initialData.weight_kg?.toString() || '', // This might be calculated, but if manually entered or we want to show it
                price: initialData.price_gbp?.toString() || '',
                offersCollection: initialData.offers_collection || false,
                offersDelivery: initialData.offers_delivery || false,
                deliveryRadius: initialData.delivery_radius_miles?.toString() || '',
                deliveryCharge: initialData.delivery_charge_gbp?.toString() || '',
                deliveryChargeType: initialData.delivery_charge_type || 'flat_rate',
                postcode: (initialData.postcode_area || '') + ' (verify)', // We don't store full postcode usually? actually we map it. 
                // Wait, we don't store the full postcode in the DB listings table row shown in previous file views? 
                // We only store postcode_area. 
                // If we want to edit, we might need to ask for postcode again or store it. 
                // For now let's leave it blank or hint. 
                // Actually looking at previous code, user input 'postcode' is used to fetch coords.
                // We store 'postcode_area'. 
                // If we edit, we probably need to re-enter postcode if we want to change location, 
                // or we can pre-fill if we had it. Use 'postcode_area' as placeholder?
                // a better UX is to reverse geocode or just leave empty and say "Leave empty to keep location".
                // But for simplicity let's require it if we want to update location. 
                // Let's try to infer or leave it blank but keep existing coords if not changed.
                includeCarbonCertificate: initialData.include_carbon_certificate || false,
                isFree: initialData.is_free || false,
                collectionNotes: initialData.collection_notes || '',
            });

            // Set specific states
            if (initialData.listing_material_id) {
                setSelectedMaterialId(initialData.listing_material_id);
            }
            if (initialData.location_lat && initialData.location_lng) {
                setCoordinates({ lat: initialData.location_lat, lng: initialData.location_lng });
                setLocationVerified(true); // Assume verified if from DB
            }

            // Images
            // Fetch images for this listing
            const fetchImages = async () => {
                const { data: imgData } = await supabase.from('listing_images').select('image_url').eq('listing_id', initialData.id).order('sort_order');
                if (imgData) {
                    setImageFiles(imgData.map(i => i.image_url));
                }
            };
            fetchImages();
        }
    }, [mode, initialData]);


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

    useEffect(() => {
        // Only reset subs if user is manually changing category in create mode or interacting
        // In edit mode initialization, we don't want to wipe them immediately.
        // We can check if formData.categoryId matches initialData.category_id to avoid reset?
        // Simpler: Just fetch subs when categoryId changes.
        // But we need to be careful not to reset subId if it's the initial load.

        if (!formData.categoryId) { setSubcategories([]); return; }

        const fetchSubcategories = async () => {
            const { data } = await supabase.from('subcategories')
                .select('id, name, embodied_carbon_kg_per_kg, default_density_kg_per_m3, is_material_ambiguous')
                .eq('category_id', formData.categoryId)
                .order('name');
            if (data) {
                setSubcategories(data);
                // If the current subcategoryId is not in the new list, clear it (unless it's loading)
                // This logic is tricky with async state.
            }
        };
        fetchSubcategories();
    }, [formData.categoryId]);

    useEffect(() => {
        if (!formData.subcategoryId) { setSubSubcategories([]); return; }

        const fetchSubSubcategories = async () => {
            const { data } = await supabase.from('sub_subcategories')
                .select('id, name')
                .eq('subcategory_id', formData.subcategoryId)
                .order('name');
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

            // Calculate Volume (cm -> m)
            if (formData.dimensionsLength && formData.dimensionsWidth && formData.dimensionsHeight && density) {
                const l = parseFloat(formData.dimensionsLength) / 100;
                const w = parseFloat(formData.dimensionsWidth) / 100;
                const h = parseFloat(formData.dimensionsHeight) / 100;
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

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('You must be logged in.');
                router.push('/auth/login');
                return;
            }

            // Validation
            if (!formData.categoryId) throw new Error("Please select a category");
            if (!formData.title) throw new Error("Title is required");
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


            // 1. Upload New Images & Collect URLs
            const finalImageUrls: string[] = [];

            for (const img of imageFiles) {
                if (typeof img === 'string') {
                    // It's an existing URL
                    finalImageUrls.push(img);
                } else {
                    // It's a new File
                    const fileExt = img.name.split('.').pop();
                    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                    const filePath = `${user.id}/${fileName}`;
                    const { error: uploadError } = await supabase.storage.from('listings').upload(filePath, img);
                    if (uploadError) throw uploadError;
                    const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(filePath);
                    finalImageUrls.push(publicUrl);
                }
            }


            // 2. Prepare Payload
            const payload = {
                seller_id: user.id,
                category_id: formData.categoryId,
                subcategory_id: formData.subcategoryId || null,
                sub_subcategory_id: formData.subSubcategoryId || null,
                title: formData.title,
                description: formData.description,
                brand: formData.brand || null,
                condition: formData.condition,
                quantity_available: formData.quantity,
                dimensions_length_cm: formData.dimensionsLength ? parseFloat(formData.dimensionsLength) : null,
                dimensions_width_cm: formData.dimensionsWidth ? parseFloat(formData.dimensionsWidth) : null,
                dimensions_height_cm: formData.dimensionsHeight ? parseFloat(formData.dimensionsHeight) : null,
                weight_kg: calculatedWeight,
                listing_material_id: selectedMaterialId || null,
                price_gbp: parseFloat(formData.price),
                offers_collection: formData.offersCollection,
                offers_delivery: formData.offersDelivery,
                delivery_radius_miles: formData.offersDelivery && formData.deliveryRadius ? parseInt(formData.deliveryRadius) : null,
                delivery_charge_gbp: formData.offersDelivery && formData.deliveryCharge ? parseFloat(formData.deliveryCharge) : null,
                delivery_charge_type: formData.deliveryChargeType,
                postcode_area: formData.postcode ? formData.postcode.split(' ')[0].trim().toUpperCase() : (initialData?.postcode_area || null), // Use existing if not updated
                location_lat: finalLat,
                location_lng: finalLng,
                is_free: formData.isFree,
                collection_notes: formData.collectionNotes,
                include_carbon_certificate: !!calculatedWeight,
                carbon_saved_kg: carbonSaved || 0,
                calculated_weight_kg: calculatedWeight,
            };

            let listingId = initialData?.id;

            if (mode === 'create') {
                const { data, error } = await supabase.from('listings').insert(payload).select().single();
                if (error) throw error;
                listingId = data.id;
            } else {
                const { error } = await supabase.from('listings').update(payload).eq('id', listingId);
                if (error) throw error;
            }

            // 3. Update Images Table (Replace Strategy)
            // Delete old images for this listing
            if (mode === 'edit') {
                await supabase.from('listing_images').delete().eq('listing_id', listingId);
            }

            // Insert new set
            if (finalImageUrls.length > 0) {
                const imageInserts = finalImageUrls.map((url, index) => ({
                    listing_id: listingId,
                    image_url: url,
                    sort_order: index
                }));
                await supabase.from('listing_images').insert(imageInserts);
            }

            router.push(`/listing/${listingId}`);
            router.refresh();

        } catch (err: any) {
            console.error('Error submitting form:', err);
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
                                    <label className="label text-xs">Title *</label>
                                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="input-field" placeholder="e.g. 50x Red Bricks" maxLength={100} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="label text-xs">Description *</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input-field h-24 text-sm" placeholder="Describe condition, history..." maxLength={2000} />
                                </div>

                                {/* Category Row */}
                                <div>
                                    <label className="label text-xs">Category *</label>
                                    <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="input-field text-sm">
                                        <option value="">Select...</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label text-xs">Subcategory</label>
                                    <select value={formData.subcategoryId} disabled={!subcategories.length} onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })} className="input-field text-sm disabled:bg-secondary-50">
                                        <option value="">Select...</option>
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
                                    <input type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="input-field text-sm" placeholder="Optional" />
                                </div>
                                <div>
                                    <label className="label text-xs">Condition *</label>
                                    <select value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="input-field text-sm">
                                        <option value="">Select...</option>
                                        {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 3. Specs & Price */}
                        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                            <div className="flex justify-between items-end border-b pb-2 mb-2">
                                <h2 className="text-lg font-semibold">Specs & Pricing</h2>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="col-span-2">
                                    <label className="label text-xs">Dimensions (cm)</label>
                                    <div className="flex space-x-2">
                                        <input type="number" placeholder="L" value={formData.dimensionsLength} onChange={e => setFormData({ ...formData, dimensionsLength: e.target.value })} className="input-field text-sm px-2 text-center" />
                                        <span className="self-center text-secondary-400">x</span>
                                        <input type="number" placeholder="W" value={formData.dimensionsWidth} onChange={e => setFormData({ ...formData, dimensionsWidth: e.target.value })} className="input-field text-sm px-2 text-center" />
                                        <span className="self-center text-secondary-400">x</span>
                                        <input type="number" placeholder="H" value={formData.dimensionsHeight} onChange={e => setFormData({ ...formData, dimensionsHeight: e.target.value })} className="input-field text-sm px-2 text-center" />
                                    </div>
                                </div>

                                <div>
                                    <label className="label text-xs">Quantity</label>
                                    <input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} className="input-field text-sm" min="1" />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="label text-xs font-bold text-secondary-900">Price (£)</label>
                                        <label className="flex items-center space-x-1 cursor-pointer">
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
                                                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 w-3 h-3"
                                            />
                                            <span className="text-[10px] font-medium text-secondary-600">Free?</span>
                                        </label>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        disabled={formData.isFree}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className={`input-field text-sm font-semibold ${formData.isFree ? 'bg-secondary-100 text-secondary-400' : 'text-primary-900 border-primary-200 focus:border-primary-500'}`}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Delivery & Submit */}
                    <div className="space-y-6">

                        {/* Sustainability Card */}
                        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-sm border border-green-100 p-5">
                            <div className="flex items-start space-x-3 mb-4">
                                <span className={`p-2 rounded-full ${carbonSaved ? 'bg-green-100 text-green-600' : 'bg-secondary-100 text-secondary-400'}`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
                                </span>
                                <div>
                                    <h3 className={`font-semibold text-sm ${carbonSaved ? 'text-green-900' : 'text-secondary-700'}`}>
                                        {carbonSaved ? 'Certificate Unlocked!' : 'Carbon Certificate'}
                                    </h3>
                                    <p className="text-xs text-secondary-500 mt-1 leading-relaxed">
                                        We calculate this automatically from your dimensions.
                                    </p>
                                </div>
                            </div>

                            {/* Material Selector (Conditional) */}
                            {subcategories.find(s => s.id === formData.subcategoryId)?.is_material_ambiguous && (
                                <div className="mb-4">
                                    <label className="label text-xs text-yellow-700 font-semibold">What is this made of?</label>
                                    <select
                                        value={selectedMaterialId}
                                        onChange={e => setSelectedMaterialId(e.target.value)}
                                        className="input-field text-sm border-yellow-200 bg-yellow-50 focus:ring-yellow-500"
                                    >
                                        <option value="">Select Material...</option>
                                        {materials.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Results Display */}
                            {calculatedWeight !== null && (
                                <div className="bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-green-800">Est. Weight:</span>
                                        <span className="text-sm font-bold text-green-900">{calculatedWeight} kg</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-green-800">Carbon Saved:</span>
                                        <span className="text-sm font-bold text-green-900">{carbonSaved} kg CO₂e</span>
                                    </div>
                                </div>
                            )}

                            <div className="mt-2 pt-2 border-t border-secondary-100">
                                <label className="label text-[10px] text-secondary-400">Manual Weight Overide (Optional)</label>
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                    className="input-field text-xs bg-white py-1"
                                    placeholder="Enter kg only if needed"
                                />
                            </div>
                        </div>

                        {/* Logistics */}
                        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
                            <h2 className="text-md font-semibold border-b pb-2">Logistics</h2>

                            <div>
                                <label className="label text-xs">Location Postcode *</label>
                                <input
                                    type="text"
                                    value={formData.postcode}
                                    onChange={e => setFormData({ ...formData, postcode: e.target.value.toUpperCase() })}
                                    onBlur={(e) => handlePostcodeBlur(e.target.value)}
                                    className={`input-field text-sm ${locationVerified ? 'border-green-500 focus:ring-green-500' : ''}`}
                                    placeholder={mode === 'edit' && !formData.postcode ? 'Confirmed (Change to update)' : 'SW1A 1AA'}
                                />
                                <div className="absolute right-3 top-8 pointer-events-none">
                                    {isLocating && <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>}
                                    {locationVerified && !isLocating && <span className="text-green-500">✓</span>}
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" checked={formData.offersCollection} onChange={e => setFormData({ ...formData, offersCollection: e.target.checked })} className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
                                    <span>Collection Available</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" checked={formData.offersDelivery} onChange={e => setFormData({ ...formData, offersDelivery: e.target.checked })} className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
                                    <span>Delivery Available</span>
                                </label>
                            </div>

                            {formData.offersDelivery && (
                                <div className="grid grid-cols-2 gap-3 pl-6 border-l-2 border-secondary-100">
                                    <div>
                                        <label className="label text-[10px]">Radius (mi)</label>
                                        <input type="number" value={formData.deliveryRadius} onChange={e => setFormData({ ...formData, deliveryRadius: e.target.value })} className="input-field text-sm py-1" />
                                    </div>
                                    <div>
                                        <label className="label text-[10px]">Cost (£)</label>
                                        <input type="number" value={formData.deliveryCharge} onChange={e => setFormData({ ...formData, deliveryCharge: e.target.value })} className="input-field text-sm py-1" />
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
                                className="w-full btn-primary py-4 text-base shadow-lg shadow-primary-900/10 transition-transform active:scale-[0.98]"
                            >
                                {uploading ? (mode === 'edit' ? 'Updating...' : 'Publishing...') : (mode === 'edit' ? 'Save Changes' : 'Publish Listing')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

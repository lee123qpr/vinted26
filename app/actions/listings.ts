'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { listingSchema } from '@/lib/schemas/listing';

export async function createListing(formData: FormData) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: 'You must be logged in to post a listing.' };
    }

    try {
        // 2. Extract & Validate Data
        const rawData = Object.fromEntries(formData.entries());

        // Zod validation (safeParse helps return consistent errors)
        const validation = listingSchema.safeParse(rawData);

        if (!validation.success) {
            console.error('Validation Error:', validation.error.flatten());
            return { error: 'Validation failed. Please check your inputs.', details: validation.error.flatten() };
        }

        const data = validation.data;

        const listingData = {
            seller_id: user.id,
            category_id: data.categoryId,
            title: data.title,
            description: data.description,
            condition: data.condition,
            price_gbp: data.price,
            quantity_available: data.quantity,
            is_free: data.isFree,

            // Optional / Nullable fields
            subcategory_id: data.subcategoryId || null,
            sub_subcategory_id: data.subSubcategoryId || null,
            brand: data.brand || null,
            collection_notes: data.collectionNotes || null,
            listing_material_id: data.materialId || null,

            // Dimensions & Weight
            weight_kg: data.weight,
            dimensions_length_mm: data.dimensionsLength,
            dimensions_width_mm: data.dimensionsWidth,
            dimensions_height_mm: data.dimensionsHeight,

            // Carbon
            include_carbon_certificate: data.includeCarbonCertificate,
            carbon_saved_kg: data.carbonSaved,
            calculated_weight_kg: data.calculatedWeight,

            // Logistics
            offers_collection: data.offersCollection,
            offers_delivery: data.offersDelivery,
            delivery_radius_miles: data.deliveryRadius,
            delivery_charge_gbp: data.deliveryCharge,
            delivery_charge_type: data.deliveryChargeType,
            courier_delivery_available: data.courierAvailable,
            courier_delivery_cost_gbp: data.courierCost,

            // Location
            postcode_area: data.postcodeArea,
            location_lat: data.lat,
            location_lng: data.lng,
        };

        console.log('Server Action: Creating Listing:', listingData.title);

        // 3. Insert Listing
        const { data: listing, error: insertError } = await supabase
            .from('listings')
            .insert(listingData)
            .select()
            .single();

        if (insertError) {
            console.error('DB Insert Error:', insertError);
            throw new Error('Failed to save listing details: ' + insertError.message);
        }

        const listingId = listing.id;

        // 4. Handle Images
        const files = formData.getAll('images') as File[];
        const imageUrls: string[] = [];

        // Upload new files
        // Upload new files in PARALLEL
        console.log(`Starting parallel upload for ${files.length} images...`);
        const uploadPromises = files.map(async (file) => {
            if (file.size > 0 && file.name !== 'undefined') {
                const fileExt = file.name.split('.').pop();
                const fileName = `${listingId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('listings')
                    .upload(fileName, file);

                if (uploadError) {
                    console.error('Image Upload Error:', uploadError);
                    return null;
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('listings')
                        .getPublicUrl(fileName);
                    return publicUrl;
                }
            }
            return null;
        });

        const results = await Promise.all(uploadPromises);
        results.forEach(url => {
            if (url) imageUrls.push(url);
        });
        console.log(`Uploaded ${imageUrls.length} images.`);

        // 5. Insert Image Records
        if (imageUrls.length > 0) {
            const imageInserts = imageUrls.map((url, index) => ({
                listing_id: listingId,
                image_url: url,
                sort_order: index
            }));
            const { error: imgDbError } = await supabase.from('listing_images').insert(imageInserts);
            if (imgDbError) console.error('Image DB Error:', imgDbError);
        }

        revalidatePath('/'); // Refresh homepage for new listings
        return { success: true, listingId };

    } catch (err: any) {
        console.error('Create Listing Server Action Failed:', err);
        return { error: err.message || 'An unexpected error occurred.' };
    }
}

export async function deleteListing(listingId: string) {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    // Delete the listing (RLS should ensure user owns it, but good to be safe)
    const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('seller_id', user.id);

    if (error) {
        console.error('Error deleting listing:', error);
        return { error: error.message };
    }

    revalidatePath('/dashboard/listings');
    return { success: true };
}

export async function updateListing(listingId: string, formData: FormData) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: 'You must be logged in to update a listing.' };
    }

    try {
        // 2. Extract & Validate Data
        const rawData = Object.fromEntries(formData.entries());

        // Zod validation
        const validation = listingSchema.safeParse(rawData);

        if (!validation.success) {
            console.error('Validation Error (Update):', validation.error.flatten());
            return { error: 'Validation failed.', details: validation.error.flatten() };
        }

        const data = validation.data;

        const listingData = {
            category_id: data.categoryId,
            title: data.title,
            description: data.description,
            condition: data.condition,
            price_gbp: data.price,
            quantity_available: data.quantity,
            is_free: data.isFree,

            // Optional / Nullable fields
            subcategory_id: data.subcategoryId || null,
            sub_subcategory_id: data.subSubcategoryId || null,
            brand: data.brand || null,
            collection_notes: data.collectionNotes || null,
            listing_material_id: data.materialId || null,

            // Dimensions & Weight
            weight_kg: data.weight,
            dimensions_length_mm: data.dimensionsLength,
            dimensions_width_mm: data.dimensionsWidth,
            dimensions_height_mm: data.dimensionsHeight,

            // Carbon
            include_carbon_certificate: data.includeCarbonCertificate,
            carbon_saved_kg: data.carbonSaved,
            calculated_weight_kg: data.calculatedWeight,

            // Logistics
            offers_collection: data.offersCollection,
            offers_delivery: data.offersDelivery,
            delivery_radius_miles: data.deliveryRadius,
            delivery_charge_gbp: data.deliveryCharge,
            delivery_charge_type: data.deliveryChargeType,
            courier_delivery_available: data.courierAvailable,
            courier_delivery_cost_gbp: data.courierCost,

            // Location
            postcode_area: data.postcodeArea,
            location_lat: data.lat,
            location_lng: data.lng,
        };

        // 3. Update Listing
        const { error: updateError } = await supabase
            .from('listings')
            .update(listingData)
            .eq('id', listingId)
            .eq('seller_id', user.id);

        if (updateError) {
            console.error('DB Update Error:', updateError);
            throw new Error('Failed to update listing: ' + updateError.message);
        }

        // 4. Handle Images
        // A. Handle Existing Images (keepUrls)
        const keepUrls = formData.getAll('keepUrls') as string[];

        // Delete all existing images for this listing first? 
        // Or specific ones?
        // Simpler approach: Delete all rows in `listing_images` for this listing, then re-insert everything (sorted).
        // This is safe because the actual files in storage persist.
        await supabase.from('listing_images').delete().eq('listing_id', listingId);

        const imageUrls: string[] = [...keepUrls];

        // B. Handle New Files
        const files = formData.getAll('images') as File[];

        console.log(`Starting parallel upload for ${files.length} new images...`);
        const uploadPromises = files.map(async (file) => {
            if (file.size > 0 && file.name !== 'undefined') {
                const fileExt = file.name.split('.').pop();
                const fileName = `${listingId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('listings')
                    .upload(fileName, file);

                if (uploadError) {
                    console.error('Image Upload Error:', uploadError);
                    return null;
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('listings')
                        .getPublicUrl(fileName);
                    return publicUrl;
                }
            }
            return null;
        });

        const newUrls = await Promise.all(uploadPromises);
        newUrls.forEach(url => {
            if (url) imageUrls.push(url);
        });

        // 5. Insert Image Records (All of them)
        if (imageUrls.length > 0) {
            const imageInserts = imageUrls.map((url, index) => ({
                listing_id: listingId,
                image_url: url,
                sort_order: index
            }));
            const { error: imgDbError } = await supabase.from('listing_images').insert(imageInserts);
            if (imgDbError) console.error('Image DB Error:', imgDbError);
        }

        revalidatePath(`/listing/${listingId}`);
        revalidatePath('/dashboard/listings');
        return { success: true, listingId };

    } catch (err: any) {
        console.error('Update Listing Server Action Failed:', err);
        return { error: err.message || 'An unexpected error occurred.' };
    }
}

export async function getListingStatusAdmin(listingId: string) {
    // This action bypasses RLS using the service role key to get the TRUE status of a listing.
    // Use only when RLS is suspiciously blocking read access for a valid buyer.
    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .from('listings')
        .select('status')
        .eq('id', listingId)
        .single();

    if (error) {
        console.error('Admin Client Error fetching status:', error);
        return null;
    }

    return data?.status || null;
}

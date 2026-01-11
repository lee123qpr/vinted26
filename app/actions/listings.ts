'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createListing(formData: FormData) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: 'You must be logged in to post a listing.' };
    }

    try {
        // 2. Extract Data
        const listingData: any = {
            seller_id: user.id,
            category_id: formData.get('categoryId'),
            title: formData.get('title'),
            description: formData.get('description'),
            condition: formData.get('condition'),
            price_gbp: parseFloat((formData.get('price') as string).replace(/,/g, '')),
            quantity_available: parseInt((formData.get('quantity') as string).replace(/,/g, '')) || 1,
            is_free: formData.get('isFree') === 'true',

            // Optional / Nullable fields
            subcategory_id: formData.get('subcategoryId') || null,
            sub_subcategory_id: formData.get('subSubcategoryId') || null,
            brand: formData.get('brand') || null,
            collection_notes: formData.get('collectionNotes') || null,
            listing_material_id: formData.get('materialId') || null,

            // Dimensions & Weight
            weight_kg: formData.get('weight') ? parseFloat((formData.get('weight') as string).replace(/,/g, '')) : null,
            dimensions_length_mm: formData.get('dimensionsLength') ? parseFloat((formData.get('dimensionsLength') as string).replace(/,/g, '')) : null,
            dimensions_width_mm: formData.get('dimensionsWidth') ? parseFloat((formData.get('dimensionsWidth') as string).replace(/,/g, '')) : null,
            dimensions_height_mm: formData.get('dimensionsHeight') ? parseFloat((formData.get('dimensionsHeight') as string).replace(/,/g, '')) : null,

            // Carbon
            include_carbon_certificate: formData.get('includeCarbonCertificate') === 'true',
            carbon_saved_kg: formData.get('carbonSaved') ? parseFloat((formData.get('carbonSaved') as string).replace(/,/g, '')) : 0,
            calculated_weight_kg: formData.get('calculatedWeight') ? parseFloat((formData.get('calculatedWeight') as string).replace(/,/g, '')) : null,

            // Logistics
            offers_collection: formData.get('offersCollection') === 'true',
            offers_delivery: formData.get('offersDelivery') === 'true',
            delivery_radius_miles: formData.get('deliveryRadius') ? parseInt((formData.get('deliveryRadius') as string).replace(/,/g, '')) : null,
            delivery_charge_gbp: formData.get('deliveryCharge') ? parseFloat((formData.get('deliveryCharge') as string).replace(/,/g, '')) : null,
            delivery_charge_type: formData.get('deliveryChargeType'),
            courier_delivery_available: formData.get('courierAvailable') === 'true',
            courier_delivery_cost_gbp: formData.get('courierCost') ? parseFloat((formData.get('courierCost') as string).replace(/,/g, '')) : null,

            // Location
            postcode_area: formData.get('postcodeArea'),
            location_lat: parseFloat(formData.get('lat') as string),
            location_lng: parseFloat(formData.get('lng') as string),
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
        // 2. Extract Data
        const listingData: any = {
            category_id: formData.get('categoryId'),
            title: formData.get('title'),
            description: formData.get('description'),
            condition: formData.get('condition'),
            price_gbp: parseFloat((formData.get('price') as string).replace(/,/g, '')),
            quantity_available: parseInt((formData.get('quantity') as string).replace(/,/g, '')) || 1,
            is_free: formData.get('isFree') === 'true',

            // Optional / Nullable fields
            subcategory_id: formData.get('subcategoryId') || null,
            sub_subcategory_id: formData.get('subSubcategoryId') || null,
            brand: formData.get('brand') || null,
            collection_notes: formData.get('collectionNotes') || null,
            listing_material_id: formData.get('materialId') || null,

            // Dimensions & Weight
            weight_kg: formData.get('weight') ? parseFloat((formData.get('weight') as string).replace(/,/g, '')) : null,
            dimensions_length_mm: formData.get('dimensionsLength') ? parseFloat((formData.get('dimensionsLength') as string).replace(/,/g, '')) : null,
            dimensions_width_mm: formData.get('dimensionsWidth') ? parseFloat((formData.get('dimensionsWidth') as string).replace(/,/g, '')) : null,
            dimensions_height_mm: formData.get('dimensionsHeight') ? parseFloat((formData.get('dimensionsHeight') as string).replace(/,/g, '')) : null,

            // Carbon
            include_carbon_certificate: formData.get('includeCarbonCertificate') === 'true',
            carbon_saved_kg: formData.get('carbonSaved') ? parseFloat((formData.get('carbonSaved') as string).replace(/,/g, '')) : 0,
            calculated_weight_kg: formData.get('calculatedWeight') ? parseFloat((formData.get('calculatedWeight') as string).replace(/,/g, '')) : null,

            // Logistics
            offers_collection: formData.get('offersCollection') === 'true',
            offers_delivery: formData.get('offersDelivery') === 'true',
            delivery_radius_miles: formData.get('deliveryRadius') ? parseInt((formData.get('deliveryRadius') as string).replace(/,/g, '')) : null,
            delivery_charge_gbp: formData.get('deliveryCharge') ? parseFloat((formData.get('deliveryCharge') as string).replace(/,/g, '')) : null,
            delivery_charge_type: formData.get('deliveryChargeType'),
            courier_delivery_available: formData.get('courierAvailable') === 'true',
            courier_delivery_cost_gbp: formData.get('courierCost') ? parseFloat((formData.get('courierCost') as string).replace(/,/g, '')) : null,

            // Location
            postcode_area: formData.get('postcodeArea'),
            location_lat: parseFloat(formData.get('lat') as string),
            location_lng: parseFloat(formData.get('lng') as string),
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

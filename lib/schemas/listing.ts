import { z } from 'zod';

export const listingSchema = z.object({
    // Required Fields
    categoryId: z.string().min(1, 'Category is required'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    condition: z.string().min(1, 'Condition is required'),
    price: z.string().transform((val) => parseFloat(val.replace(/,/g, ''))),
    quantity: z.string().transform((val) => parseInt(val.replace(/,/g, '')) || 1),
    isFree: z.string().transform((val) => val === 'true'),

    // Optional Fields
    subcategoryId: z.string().optional().nullable(),
    subSubcategoryId: z.string().optional().nullable(),
    brand: z.string().optional().nullable(),
    collectionNotes: z.string().optional().nullable(),
    materialId: z.string().optional().nullable(),

    // Dimensions & Weight (ensure numeric parsing)
    weight: z.string().optional().transform((val) => val ? parseFloat(val.replace(/,/g, '')) : null),
    dimensionsLength: z.string().optional().transform((val) => val ? parseFloat(val.replace(/,/g, '')) : null),
    dimensionsWidth: z.string().optional().transform((val) => val ? parseFloat(val.replace(/,/g, '')) : null),
    dimensionsHeight: z.string().optional().transform((val) => val ? parseFloat(val.replace(/,/g, '')) : null),

    // Carbon
    includeCarbonCertificate: z.string().transform((val) => val === 'true'),
    carbonSaved: z.string().optional().transform((val) => val ? parseFloat(val.replace(/,/g, '')) : 0),
    calculatedWeight: z.string().optional().transform((val) => val ? parseFloat(val.replace(/,/g, '')) : null),

    // Logistics
    offersCollection: z.string().transform((val) => val === 'true'),
    offersDelivery: z.string().transform((val) => val === 'true'),
    deliveryRadius: z.string().optional().transform((val) => val ? parseInt(val.replace(/,/g, '')) : null),
    deliveryCharge: z.string().optional().transform((val) => val ? parseFloat(val.replace(/,/g, '')) : null),
    deliveryChargeType: z.string().optional(),
    courierAvailable: z.string().transform((val) => val === 'true'),
    courierCost: z.string().optional().transform((val) => val ? parseFloat(val.replace(/,/g, '')) : null),

    // Location
    postcodeArea: z.string().optional(),
    lat: z.string().transform((val) => parseFloat(val)),
    lng: z.string().transform((val) => parseFloat(val)),
});

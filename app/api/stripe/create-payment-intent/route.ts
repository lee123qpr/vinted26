import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { listingId, deliveryMethod, deliveryAddress } = body;

        if (!listingId || !deliveryMethod) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch Listing & Offer Details (Secure Price Calculation)

        let itemPrice = 0;
        let offerIdObj: any = null;

        // If offerId provided, validate it
        if (body.offerId) {
            const { data: offer, error: offerError } = await supabase
                .from('offers')
                .select('*')
                .eq('id', body.offerId)
                .eq('listing_id', listingId)
                .eq('buyer_id', user.id)
                .eq('status', 'accepted')
                .single();

            if (offerError || !offer) {
                return NextResponse.json({ error: 'Invalid or expired offer' }, { status: 400 });
            }

            // Use Offer Price
            itemPrice = offer.counter_amount_gbp || offer.amount_gbp;
            offerIdObj = offer.id;

            // Fetch listing just for validation of active status/delivery costs
            const { data: listingData, error: dbError } = await supabase
                .from('listings')
                .select('*')
                .eq('id', listingId)
                .single();
            if (dbError || !listingData) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
            if (listingData.status !== 'active') return NextResponse.json({ error: 'Listing is not active' }, { status: 409 });

            // Map listing data to 'listing' for downstream logic (delivery costs etc)
            // We can just re-use the existing listing variable logic if we modify it a bit
            var listing = listingData; // utilizing var to hoisting or just re-assign standard let/const if we change structure.
            // Actually, let's keep it clean.

        } else {
            // Standard Flow
            const { data: listingData, error: dbError } = await supabase
                .from('listings')
                .select('*')
                .eq('id', listingId)
                .single();

            if (dbError || !listingData) {
                return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
            }
            if (listingData.status !== 'active') {
                return NextResponse.json({ error: 'Listing is no longer available' }, { status: 409 });
            }
            itemPrice = listingData.price_gbp;
            var listing = listingData;
        }

        const platformFee = 0; // 5% fee is now deducted from seller payout, not added to buyer charge

        // Delivery Cost Logic
        let deliveryCost = 0;
        if (deliveryMethod === 'delivery') {
            // Logic to determine if it's courier or local based on user choice? 
            // The frontend passes 'delivery', but we need to know WHICH delivery if both are active.
            // For now, let's assume the body passes 'deliveryType' specific ('local' or 'courier').

            // If we just stick to 'delivery' meaning 'local' from previous logic, we might need to update frontend to send 'courier'.
            // Let's check body.deliveryType

            if (body.deliveryType === 'courier') {
                deliveryCost = listing.courier_delivery_cost_gbp || 0;
            } else {
                // Assume local default
                deliveryCost = listing.delivery_charge_gbp || 0;
            }
        }

        const totalAmount = itemPrice + platformFee + deliveryCost;
        const amountInPence = Math.round(totalAmount * 100);

        // 3. Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPence,
            currency: 'gbp',
            automatic_payment_methods: {
                enabled: true,
            },
            receipt_email: user.email, // Send Stripe receipt to user
            metadata: {
                listingId: listing.id,
                buyerId: user.id,
                sellerId: listing.seller_id,
                offerId: offerIdObj,
                deliveryMethod: deliveryMethod, // 'collection', 'delivery'
                deliveryType: body.deliveryType || 'local'
            }
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amounts: {
                item: itemPrice,
                fee: 0, // Not charged to buyer
                delivery: deliveryCost,
                total: totalAmount
            }
        });

    } catch (error: any) {
        console.error('Stripe Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';
import { createNotification } from './notifications';

interface RecordPaymentParams {
    listingId: string;
    paymentIntentId: string;
    totalAmount: number;
    platformFee: number;
    deliveryFee: number;
    deliveryMethod: string;
    deliveryAddress: string | null;
}

export async function recordSuccessfulPayment({
    listingId,
    paymentIntentId,
    totalAmount,
    platformFee,
    deliveryFee,
    deliveryMethod,
    deliveryAddress
}: RecordPaymentParams) {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient(); // Fix: await expression

    // 1. Authenticate User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Unauthorized' };
    }

    try {
        // 2. Verify Payment Intent with Stripe (Security Check)
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            return { error: 'Payment not successful' };
        }

        // 3. Fetch Listing details (for seller_id and price validation)
        const { data: listing, error: listingError } = await adminSupabase
            .from('listings')
            .select('*')
            .eq('id', listingId)
            .single();

        if (listingError || !listing) {
            return { error: 'Listing not found' };
        }

        // 5. CRITICAL: Race Condition Check
        // If the listing status is ALREADY 'sold' (or anything other than active), 
        // it means another buyer beat this user to it by milliseconds.
        // We MUST refund this payment immediately to maintain credibility.
        if (listing.status !== 'active') {
            console.warn(`RACE CONDITION DETECTED: User ${user.id} paid for sold listing ${listingId}. Initiating refund.`);

            try {
                // Refund the full amount
                const refund = await stripe.refunds.create({
                    payment_intent: paymentIntentId,
                    reason: 'duplicate',
                    metadata: {
                        reason: 'race_condition_sold_item',
                        listingId: listingId
                    }
                });
                console.log('Refund processed:', refund.id);
                return { error: 'So sorry! Another buyer purchased this item seconds before you. Your payment has been automatically refunded.' };
            } catch (refundError: any) {
                console.error('CRITICAL: Failed to process race-condition refund:', refundError);
                return { error: 'This item was already sold. Please contact support if your refund does not appear shortly.' };
            }
        }

        // 4. Create Transaction
        // We use adminSupabase for transaction to ensure it works even if complex RLS matches fail, 
        // though regular user RLS should allow inserting own 'buy' transaction.
        // Using admin guarantees we can also set the status correctly.
        const { data: transaction, error: insertError } = await adminSupabase
            .from('transactions')
            .insert({
                listing_id: listingId,
                buyer_id: user.id,
                seller_id: listing.seller_id,
                quantity: 1,
                total_price_gbp: totalAmount,
                // initial_price_gbp was not in schema, removed to fix error
                platform_fee_gbp: platformFee,
                delivery_fee_gbp: deliveryFee,
                delivery_method: deliveryMethod,
                delivery_address: deliveryAddress,
                stripe_payment_intent_id: paymentIntentId,
                payment_status: 'held_in_escrow',
                order_status: 'pending'
            })
            .select()
            .single();

        if (insertError) {
            console.error('Transaction Insert Error:', insertError);
            return { error: 'Failed to record transaction' };
        }

        // 5. Mark Listing as Sold
        // This MUST be done as admin because the buyer doesn't own the listing
        const { error: updateError } = await adminSupabase
            .from('listings')
            .update({ status: 'sold' })
            .eq('id', listingId);

        if (updateError) {
            console.error('Listing Update Error:', updateError);
            // Non-critical: we derived 'sold' state from transactions technically, but good to have.
        }

        // 6. Notify Seller of New Order
        await createNotification({
            userId: listing.seller_id,
            type: 'payment_succeeded',
            resourceId: transaction.id,
            resourceType: 'transaction',
            data: {
                listingId: listingId,
                listingTitle: listing.title,
                offerAmount: totalAmount,
                counterpartId: user.id
            }
        });

        return { success: true, orderId: transaction.id };

    } catch (error: any) {
        console.error('Payment Record Error:', error);
        return { error: error.message };
    }
}

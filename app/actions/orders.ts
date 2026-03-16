'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

export async function updateOrderStatus(orderId: string, newStatus: 'shipped' | 'completed' | 'cancelled') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Fetch order to verify ownership/permissions
    const adminSupabase = await createAdminClient();
    const { data: order, error: fetchError } = await adminSupabase
        .from('transactions')
        .select('*, listings:listings!listing_id(title)')
        .eq('id', orderId)
        .single();

    if (fetchError || !order) return { error: 'Order not found' };

    // Permission Logic
    const isSeller = order.seller_id === user.id;
    const isBuyer = order.buyer_id === user.id;

    if (!isSeller && !isBuyer) return { error: 'Permission denied' };

    // State Machine Transitions
    // State Machine Transitions
    const updateData: {
        order_status?: string;
        payment_status?: string;
        payout_id?: string;
        payout_error?: string;
        completed_at?: string;
        delivered_at?: string;
    } = { order_status: newStatus };

    if (newStatus === 'shipped') {
        if (!isSeller) return { error: 'Only seller can mark as shipped' };
        if (order.order_status !== 'pending' && order.order_status !== 'held_in_escrow') {
            console.error(`Mark Shipped Failed: Status is '${order.order_status}' (ID: ${orderId})`);
            return { error: `Order must be pending (is ${order.order_status}) to ship` };
        }
        // No extra fields for now, maybe tracking number later
    }
    else if (newStatus === 'completed') {
        if (!isBuyer) return { error: 'Only buyer can confirm delivery' };

        // Idempotency: If already completed, return success
        if (order.order_status === 'completed') {
            return { success: true };
        }

        if (order.order_status !== 'shipped') return { error: `Order must be shipped before confirmation (is ${order.order_status})` };

        // 1. Fetch Seller's Payout Info
        // We know seller_id from the order object
        const { data: sellerProfile } = await adminSupabase
            .from('profiles')
            .select('stripe_account_id, stripe_charges_enabled')
            .eq('id', order.seller_id)
            .single();

        // 2. Execute Payout Logic
        if (sellerProfile?.stripe_account_id && sellerProfile.stripe_charges_enabled) {
            try {
                // Calculate Net Payout
                // Total collected - Platform Fee - Delivery Fee (if held in escrow but owed to platform/courier)
                // Assuming Delivery Fee goes to Platform if we organize delivery, or Seller if they do.
                // For now: Payout = Total Price - Platform Fee - Delivery Fee (platform holds delivery cost to pay courier)
                // If "Local Delivery" (seller managed), Seller keeps delivery fee.

                // Simplified Logic: 
                // Seller gets: (Price of Item - Platform Fee) + (Delivery Fee IF 'local')
                // Platform keeps: Platform Fee + (Delivery Fee IF 'courier')

                const payoutAmount = order.total_price_gbp - (order.platform_fee_gbp || 0);

                // If courier, we keep the delivery fee to pay the courier service (hypothetically)
                if (order.delivery_method === 'delivery' && order.delivery_fee_gbp > 0) {
                    // Check if it was "local" or "courier" - Schema might not store 'delivery_type' directly in transaction?
                    // We stored 'delivery_method'='delivery'. 
                    // Let's check the listing or stored address hints. 
                    // Safe bet: If delivery fee > £5 it's likely courier? No, insecure.
                    // The logic in checkout.ts stored `delivery_fee_gbp`.
                    // For V1, let's assume Platform takes Delivery Fee if it's NOT cash-on-delivery (which it isn't here).
                    // Actually, if it's "Local Delivery by Seller", they need that money for petrol.
                    // If it's "Nationwide Courier", we bought the label, so we keep the money.

                    // FIXME: We need to know who provided delivery. 
                    // For now, let's assume ALL delivery fees go to the seller (Simple Marketplace Model)
                    // except Platform Fee.
                }

                // Final Check: Payout = Total - Platform Fee.
                // (Seller covers delivery cost out of their pocket/earnings if we payout full amount)
                const payoutAmountPence = Math.round((payoutAmount) * 100);

                if (payoutAmountPence > 0) {
                    const { stripe } = await import('@/lib/stripe');
                    const transfer = await stripe.transfers.create({
                        amount: payoutAmountPence,
                        currency: 'gbp',
                        destination: sellerProfile.stripe_account_id,
                        transfer_group: order.id,
                        description: `Payout for Order #${order.id.slice(0, 8)}`
                    });
                    console.log(`Payout Success: ${transfer.id} sent to ${sellerProfile.stripe_account_id}`);
                    updateData.payout_id = transfer.id;
                    updateData.payment_status = 'released'; // Release escrow immediately
                } else {
                     updateData.payment_status = 'released'; // Nothing to payout, but consider it fully released
                }
            } catch (stripeError: unknown) {
                console.error('Payout Failed:', stripeError);
                // We DON'T stop the completion, we just log failure. 
                // Admin can retry payout manually if needed.
                const errorMsg = stripeError instanceof Error ? stripeError.message : 'Unknown payout error';
                updateData.payout_error = errorMsg;
                // If the stripe transfer fails, keep it in escrow so we don't lose track of the money
                updateData.payment_status = 'held_in_escrow';
            }
        } else {
            console.log(`Order ${orderId} completed but Seller ${order.seller_id} is not fully connected to Stripe. Funds held in escrow.`);
             // Do not process payout. Leave payment_status as 'held_in_escrow'.
             // Note: It defaulted to 'held_in_escrow' when the buyer paid. We just don't change it here.
             // We do want to make sure it definitely stays in escrow.
             updateData.payment_status = 'held_in_escrow';
        }

        // Finalize transaction timestamps
        updateData.completed_at = new Date().toISOString();
        updateData.delivered_at = new Date().toISOString();
    }
    else if (newStatus === 'cancelled') {
        // Logic for cancellation (maybe strict rules?)
        if (order.order_status === 'completed') return { error: 'Cannot cancel completed order' };
        updateData.payment_status = 'refunded'; // Sim funds returned
    }

    const { error: updateError } = await adminSupabase
        .from('transactions')
        .update(updateData)
        .eq('id', orderId);

    if (updateError) {
        console.error('Update Order Error:', updateError);
        return { error: 'Failed to update order status' };
    }

    // Send Notification
    try {
        if (newStatus === 'completed') {
            // Notify Seller
            await createNotification({
                userId: order.seller_id,
                type: 'order_completed',
                resourceId: orderId,
                resourceType: 'transaction',
                data: {
                    message: `Order completed! Please leave feedback for ${user.email?.split('@')[0] || 'the buyer'}.`,
                    listingId: order.listing_id,
                    listingTitle: order.listings?.title,
                    link: '/dashboard/sales' // Seller goes to Sales
                }
            });

            // Notify Buyer (Confirmation)
            await createNotification({
                userId: order.buyer_id,
                type: 'order_completed',
                resourceId: orderId,
                resourceType: 'transaction',
                data: {
                    message: `Order completed! Don't forget to leave feedback for the seller.`,
                    listingId: order.listing_id,
                    listingTitle: order.listings?.title,
                    link: '/dashboard/orders' // Buyer goes to Orders
                }
            });

        } else {
            // Standard Notification (Shipped / Cancelled)
            const notifyTargetId = isSeller ? order.buyer_id : order.seller_id;
            const notificationType = newStatus === 'shipped' ? 'order_shipped' : 'order_cancelled';

            const message = newStatus === 'shipped'
                ? `Order for "${order.listings?.title}" has been shipped!`
                : `Order for "${order.listings?.title}" has been cancelled.`;

            await createNotification({
                userId: notifyTargetId,
                type: notificationType,
                resourceId: orderId,
                resourceType: 'transaction',
                data: {
                    message,
                    listingId: order.listing_id,
                    listingTitle: order.listings?.title,
                    actor_username: user.email?.split('@')[0] || 'User'
                }
            });

            // Dispatch Order Shipped Email
            if (newStatus === 'shipped') {
                try {
                    const { data: buyerProfile } = await adminSupabase
                        .from('profiles')
                        .select('email, full_name, username')
                        .eq('id', order.buyer_id)
                        .single();

                    if (buyerProfile?.email) {
                        const isCollection = order.delivery_method && order.delivery_method !== 'delivery';
                        const buyerName = buyerProfile.full_name || buyerProfile.username || 'Buyer';
                        
                        const { sendOrderShippedEmail } = await import('@/lib/email');
                        await sendOrderShippedEmail({
                            to: buyerProfile.email,
                            buyerName,
                            itemName: order.listings?.title || 'Your item',
                            isCollection: !!isCollection
                        });
                    }
                } catch (emailError) {
                     console.error('Error dispatching shipped email:', emailError);
                }
            }
        }

    } catch (err) {
        console.error('Failed to send notification', err);
        // Don't fail the action if notification fails
    }

    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard/sales');
    return { success: true };
}

export async function createReview(transactionId: string, rating: number, text: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // 1. Validate Transaction
    const { data: txn } = await supabase.from('transactions').select('*').eq('id', transactionId).single();
    if (!txn) return { error: 'Transaction not found' };
    if (txn.order_status !== 'completed') return { error: 'Transaction must be completed to review' };

    // Determine roles
    const isBuyer = txn.buyer_id === user.id;
    const isSeller = txn.seller_id === user.id;
    if (!isBuyer && !isSeller) return { error: 'Permission denied' };

    const revieweeId = isBuyer ? txn.seller_id : txn.buyer_id;

    // 2. Insert Review
    const { error: insertError } = await supabase
        .from('reviews')
        .insert({
            transaction_id: transactionId,
            reviewer_id: user.id,
            reviewee_id: revieweeId,
            rating: rating,
            review_text: text,
            delivery_experience_rating: isBuyer ? rating : null // Only buyer rates delivery?
        });

    if (insertError) {
        console.error('Review Error:', insertError);
        return { error: 'Failed to submit review' };
    }

    revalidatePath('/dashboard/orders');
    return { success: true };
}

export async function createDispute(transactionId: string, reason: string, description: string, evidenceUrls: string[] = []) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // 1. Validate Transaction
    const { data: txn } = await supabase.from('transactions').select('*').eq('id', transactionId).single();
    if (!txn) return { error: 'Transaction not found' };

    // Only buyer can raise dispute? Or seller too? Usually buyer.
    if (txn.buyer_id !== user.id) return { error: 'Only the buyer can raise a dispute for this order' };

    // Can only dispute if shipped or completed (within allowed window)?
    // Let's say can dispute if 'shipped' (before confirming) or 'completed' (if we allow post-delivery dispute, usually rare on Vinted equivalent, usually issue raised INSTEAD of acceptance).
    // User requirement: "buyer confirms acceptance OR raises an issue". So status must be 'shipped'.
    if (txn.order_status !== 'shipped') return { error: 'Can only raise an issue for shipped items before acceptance' };

    const adminSupabase = await createAdminClient();

    // 2. Insert Dispute Record
    // 2. Insert Dispute Record
    const { error: insertError } = await adminSupabase
        .from('disputes')
        .insert({
            transaction_id: transactionId,
            opened_by_id: user.id,
            reason: reason,
            description: description,
            evidence_urls: evidenceUrls, // Save evidence
            status: 'open'
        })
        .select()
        .single();

    if (insertError) {
        console.error('Dispute Insert Error:', insertError);
        return { error: 'Failed to create dispute record' };
    }

    // 3. Update Transaction Status
    const { error: updateError } = await adminSupabase
        .from('transactions')
        .update({
            order_status: 'disputed'
        })
        .eq('id', transactionId);

    if (updateError) {
        // Rollback dispute? Or just log.
        console.error('Dispute Status Update Error:', updateError);
        return { error: 'Failed to update order status' };
    }

    // 4. Notify Seller
    const { error: notifyError } = await adminSupabase
        .from('notifications')
        .insert({
            user_id: txn.seller_id,
            type: 'dispute_raised',
            resource_id: transactionId,
            resource_type: 'transaction',
            data: {
                message: `Dispute raised for order #${transactionId.slice(0, 8)}`,
                raised_by_username: user.email?.split('@')[0] || 'Buyer' // Fallback if no username cached
            }
        });

    if (notifyError) console.error('Notification Error:', notifyError);

    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard/sales'); // Seller needs to see it's disputed
    return { success: true };
}

/**
 * Searches for completed orders where funds are still held in escrow for a given seller,
 * and attempts to process payouts for them. This is intended to be called right after
 * a seller finishes their Stripe Connect onboarding.
 */
export async function processPendingPayouts(sellerId: string) {
    const adminSupabase = await createAdminClient();

    // Find all completed orders belonging to this seller where payment is still held in escrow
    const { data: pendingOrders, error: fetchError } = await adminSupabase
        .from('transactions')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('order_status', 'completed')
        .eq('payment_status', 'held_in_escrow');

    if (fetchError) {
        console.error('Failed to fetch pending payouts for seller:', sellerId, fetchError);
        return { error: 'Failed to fetch pending payouts' };
    }

    if (!pendingOrders || pendingOrders.length === 0) {
        console.log(`No pending payouts found for newly connected seller: ${sellerId}`);
        return { success: true, count: 0 };
    }

    console.log(`Found ${pendingOrders.length} pending payouts for seller ${sellerId}. Processing now...`);

    let processedCount = 0;
    const errors = [];
    
    // 1. Double check the seller is actually ready
    const { data: sellerProfile } = await adminSupabase
        .from('profiles')
        .select('stripe_account_id, stripe_charges_enabled')
        .eq('id', sellerId)
        .single();

    if (!sellerProfile?.stripe_account_id || !sellerProfile?.stripe_charges_enabled) {
        return { error: 'Seller is still not fully connected to Stripe' };
    }

    const { stripe } = await import('@/lib/stripe');

    for (const order of pendingOrders) {
        try {
            const payoutAmount = order.total_price_gbp - (order.platform_fee_gbp || 0);
            const payoutAmountPence = Math.round(payoutAmount * 100);

            if (payoutAmountPence > 0) {
                const transfer = await stripe.transfers.create({
                    amount: payoutAmountPence,
                    currency: 'gbp',
                    destination: sellerProfile.stripe_account_id,
                    transfer_group: order.id,
                    description: `Delayed Payout for Order #${order.id.slice(0, 8)}`
                });

                console.log(`Delayed Payout Success: ${transfer.id} sent to ${sellerProfile.stripe_account_id} for order ${order.id}`);
                
                // Update DB to released
                await adminSupabase
                    .from('transactions')
                    .update({ 
                        payout_id: transfer.id,
                        payment_status: 'released',
                        payout_error: null 
                    })
                    .eq('id', order.id);
            } else {
                 await adminSupabase
                    .from('transactions')
                    .update({ payment_status: 'released' })
                    .eq('id', order.id);
            }
            processedCount++;
        } catch (err: any) {
             console.error(`Failed to process delayed payout for order ${order.id}:`, err);
             errors.push(`Order ${order.id}: ${err.message}`);
             await adminSupabase
                .from('transactions')
                .update({ payout_error: err.message })
                .eq('id', order.id);
        }
    }

    return { 
        success: true, 
        count: processedCount, 
        errors: errors.length > 0 ? errors : undefined 
    };
}

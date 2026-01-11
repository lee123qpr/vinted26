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
        .select('*')
        .eq('id', orderId)
        .single();

    if (fetchError || !order) return { error: 'Order not found' };

    // Permission Logic
    const isSeller = order.seller_id === user.id;
    const isBuyer = order.buyer_id === user.id;

    if (!isSeller && !isBuyer) return { error: 'Permission denied' };

    // State Machine Transitions
    let updateData: any = { order_status: newStatus };

    if (newStatus === 'shipped') {
        if (!isSeller) return { error: 'Only seller can mark as shipped' };
        if (order.order_status !== 'pending') return { error: 'Order must be pending to ship' };
        // No extra fields for now, maybe tracking number later
    }
    else if (newStatus === 'completed') {
        if (!isBuyer) return { error: 'Only buyer can confirm delivery' };
        if (order.order_status !== 'shipped') return { error: 'Order must be shipped before confirmation' };

        // Finalize transaction
        updateData.payment_status = 'released'; // Release escrow
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
    const { data: dispute, error: insertError } = await adminSupabase
        .from('disputes')
        .insert({
            transaction_id: transactionId,
            raised_by: user.id,
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
            order_status: 'disputed',
            dispute_id: dispute.id
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

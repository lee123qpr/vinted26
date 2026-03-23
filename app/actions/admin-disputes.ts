'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Send a message in a dispute (admin to buyer/seller)
 */
export async function sendDisputeMessage(disputeId: string, message: string, recipientId: string) {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('dispute_messages')
        .insert({
            dispute_id: disputeId,
            sender_id: null, // Admin message
            message_text: message,
            is_admin: true
        });

    if (error) throw new Error('Failed to send message: ' + error.message);

    revalidatePath(`/admin/disputes/${disputeId}`);
    return { success: true };
}

import { processStripeRefund } from '@/lib/stripe';

/**
 * Resolve a dispute with specified resolution type
 */
export async function resolveDispute(
    disputeId: string,
    resolutionType: 'full_refund' | 'partial_refund' | 'release_to_seller' | 'dismissed',
    refundAmount?: number,
    adminNotes?: string
) {
    const supabase = await createAdminClient();

    // 1. Fetch the dispute to get the transaction ID and order details first
    const { data: dispute, error: fetchError } = await supabase
        .from('disputes')
        .select(`
            *,
            orders (
                id,
                transactions (
                    id,
                    stripe_payment_intent_id
                )
            )
        `)
        .eq('id', disputeId)
        .single();

    if (fetchError || !dispute) {
        throw new Error('Dispute not found or error fetching details: ' + fetchError?.message);
    }

    // 2. Process Stripe Refund if applicable
    if (resolutionType === 'full_refund' || resolutionType === 'partial_refund') {
        const order = Array.isArray(dispute.orders) ? dispute.orders[0] : dispute.orders;
        const transaction = order?.transactions?.[0];

        if (!transaction?.stripe_payment_intent_id) {
            throw new Error('Cannot process refund: No Stripe Payment Intent found for this order.');
        }

        try {
            await processStripeRefund(transaction.stripe_payment_intent_id, refundAmount);
        } catch (error: any) {
            throw new Error(`Stripe Refund Failed: ${error.message}`);
        }
    }

    // 3. Update dispute status
    const { error: disputeError } = await supabase
        .from('disputes')
        .update({
            status: 'resolved',
            resolution_type: resolutionType,
            refund_amount_gbp: refundAmount || null,
            admin_notes: adminNotes || null,
            resolved_at: new Date().toISOString()
        })
        .eq('id', disputeId);

    if (disputeError) {
        // Warning: Refund may have succeeded but DB update failed.
        // In a production system, a webhook would reconcile this.
        console.error('Critical: Refund succeeded but DB update failed', disputeError);
        throw new Error('Refund processed but failed to update dispute record: ' + disputeError.message);
    }

    // 4. Send Email Notification
    const resolvedOrder = Array.isArray(dispute.orders) ? dispute.orders[0] : dispute.orders;
    const buyerId = resolvedOrder?.buyer_id;
    
    if (buyerId) {
        const { data: buyerProfile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', buyerId)
            .single();

        if (buyerProfile?.email) {
            try {
                const { sendDisputeEmail } = await import('@/lib/email');
                await sendDisputeEmail({
                    to: buyerProfile.email,
                    userName: buyerProfile.full_name || 'Customer',
                    disputeId,
                    message: adminNotes || 'An administrator has resolved this dispute.',
                    resolutionType
                });
            } catch (emailError) {
                console.error("Failed to send dispute resolution email:", emailError);
            }
        }
    }

    revalidatePath('/admin/disputes');
    revalidatePath(`/admin/disputes/${disputeId}`);
    return { success: true };
}

/**
 * Upload evidence to a dispute
 */
export async function uploadDisputeEvidence(
    disputeId: string,
    uploadedBy: string,
    evidenceUrl: string,
    evidenceType: 'image' | 'document',
    description?: string
) {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('dispute_evidence')
        .insert({
            dispute_id: disputeId,
            uploaded_by: uploadedBy,
            evidence_url: evidenceUrl,
            evidence_type: evidenceType,
            description: description || null
        });

    if (error) throw new Error('Failed to upload evidence: ' + error.message);

    revalidatePath(`/admin/disputes/${disputeId}`);
    return { success: true };
}

/**
 * Request additional evidence from a user
 */
export async function requestAdditionalEvidence(disputeId: string, userId: string, request: string) {
    const supabase = await createAdminClient();

    // 1. Send a message requesting evidence
    const { error } = await supabase
        .from('dispute_messages')
        .insert({
            dispute_id: disputeId,
            sender_id: null,
            message_text: `📎 Evidence Request: ${request}`,
            is_admin: true
        });

    if (error) throw new Error('Failed to send evidence request: ' + error.message);

    // 2. Fetch User to send email
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

    if (userProfile?.email) {
        try {
            const { sendDisputeEmail } = await import('@/lib/email');
            await sendDisputeEmail({
                to: userProfile.email,
                userName: userProfile.full_name || 'Customer',
                disputeId,
                message: request,
                // no resolutionType passed so subject string reads "Action Required"
            });
        } catch (emailError) {
            console.error("Failed to send evidence request email:", emailError);
        }
    }

    revalidatePath(`/admin/disputes/${disputeId}`);
    return { success: true };
}

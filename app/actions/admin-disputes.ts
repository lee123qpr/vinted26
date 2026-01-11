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

    // Update dispute status
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

    if (disputeError) throw new Error('Failed to resolve dispute: ' + disputeError.message);

    // TODO: Process Stripe refund if needed
    // if (resolutionType === 'full_refund' || resolutionType === 'partial_refund') {
    //     await processStripeRefund(transactionId, refundAmount);
    // }

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

    // Send a message requesting evidence
    const { error } = await supabase
        .from('dispute_messages')
        .insert({
            dispute_id: disputeId,
            sender_id: null,
            message_text: `📎 Evidence Request: ${request}`,
            is_admin: true
        });

    if (error) throw new Error('Failed to send evidence request: ' + error.message);

    // TODO: Send email notification to user

    revalidatePath(`/admin/disputes/${disputeId}`);
    return { success: true };
}

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY is missing from environment variables. using placeholder for development to prevent crash.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2024-12-18.acacia' as any, // Use latest or matching version
    typescript: true,
});

/**
 * Process a refund through Stripe for a given PaymentIntent
 * @param paymentIntentId The Stripe PaymentIntent ID to refund
 * @param amountInGbp Optional partial refund amount in GBP. If omitted, full refund.
 */
export async function processStripeRefund(paymentIntentId: string, amountInGbp?: number) {
    if (!paymentIntentId) {
        throw new Error('Payment Intent ID is required for a refund.');
    }

    try {
        const refundParams: Stripe.RefundCreateParams = {
            payment_intent: paymentIntentId,
        };

        if (amountInGbp) {
            // Stripe expects amounts in the smallest currency unit (pence)
            refundParams.amount = Math.round(amountInGbp * 100);
        }

        const refund = await stripe.refunds.create(refundParams);
        
        console.log(`Successfully processed refund ${refund.id} for intent ${paymentIntentId}`);
        return { success: true, refund };
    } catch (error) {
        console.error('Stripe Refund Error:', error);
        throw error;
    }
}

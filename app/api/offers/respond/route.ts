import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { offerId, action, counterAmount } = body; // action: 'accept' | 'reject' | 'counter'

        if (!offerId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Verify ownership (Seller must own the listing related to the offer)
        const { data: offer, error: fetchError } = await supabase
            .from('offers')
            .select(`
                *,
                listings!inner (
                    seller_id,
                    price_gbp
                )
            `)
            .eq('id', offerId)
            .single();

        if (fetchError || !offer) {
            return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
        }

        if (offer.listings.seller_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (offer.status !== 'pending' && offer.status !== 'countered') { // Re-countering? usually just pending
            return NextResponse.json({ error: 'Offer is no longer pending' }, { status: 400 });
        }

        // 2. Perform Action
        let updateData: any = {};

        if (action === 'accept') {
            updateData = { status: 'accepted', accepted_at: new Date().toISOString() };
            // Optional: Create a transaction record here or wait for payment?
            // Usually, accepting an offer changes price for the buyer or creates a distinct checkout link.
            // For MVP: We update the LISTING price to the offer amount? Or just notify buyer?
            // Let's assume we just mark it accepted. The BUYER then needs to checkout.
            // Ideally, we'd enable a special checkout for them.
            // SIMPLIFICATION: Update listing price to match offer? No, that opens it to everyone.
            // For now, just mark accepted. Buyer sees "Accepted" status and maybe we handle checkout price adjustment later.
            // Actually, we should probably update the OFFER status, and when Buyer goes to checkout, 
            // if they have an ACCEPTED offer, we use that price.

        } else if (action === 'reject') {
            updateData = { status: 'rejected' };
        } else if (action === 'counter') {
            if (!counterAmount || counterAmount <= 0) {
                return NextResponse.json({ error: 'Invalid counter amount' }, { status: 400 });
            }
            updateData = {
                status: 'countered',
                counter_amount_gbp: counterAmount,
                updated_at: new Date().toISOString()
            };
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const { error: updateError } = await supabase
            .from('offers')
            .update(updateData)
            .eq('id', offerId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, status: updateData.status });

    } catch (error: any) {
        console.error('Offer Response Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

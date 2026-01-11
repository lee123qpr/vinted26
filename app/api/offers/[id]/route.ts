import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { action, counterAmount } = body; // action: 'accept' | 'reject' | 'counter'

        if (!['accept', 'reject', 'counter'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Fetch Offer to verify ownership
        const { data: offer, error: fetchError } = await supabase
            .from('offers')
            .select('*, listings:listing_id(seller_id)')
            .eq('id', id)
            .single();

        if (fetchError || !offer) {
            return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
        }

        // Logic Check: Who is acting?
        // Seller can accept/reject/counter.
        // Buyer can accept/reject/counter (if it was countered back?). 
        // For simplicity: Seller responds to Buyer's initial offer.

        const isSeller = offer.listings.seller_id === user.id;
        const isBuyer = offer.buyer_id === user.id;

        if (!isSeller && !isBuyer) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        let updates: any = {};

        if (action === 'accept') {
            updates.status = 'accepted';
            // Logic: Do we create a transaction now? Or wait for buyer to "Checkout"?
            // Plan says: "Once cost is agreed, the buyer pays".
            // So we mark offer as accepted, notification sent to buyer "Offer Accepted, Go pay".
        } else if (action === 'reject') {
            updates.status = 'rejected';
        } else if (action === 'counter') {
            if (!counterAmount) return NextResponse.json({ error: 'Counter amount required' }, { status: 400 });
            updates.status = 'countered';
            updates.amount_gbp = counterAmount;
            // In a real system we might create a new offer record for history, 
            // but updating is simpler for MVP.
            // Ideally swap buyer/seller roles strictly, but for now we just change amount and keep status 'countered'.
        }

        const { data: updated, error: updateError } = await supabase
            .from('offers')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        return NextResponse.json(updated);

    } catch (error: any) {
        console.error('Offer Response Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

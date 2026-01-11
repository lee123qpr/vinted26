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
        const { listingId, amount } = body;

        if (!listingId || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Check for EXISTING ACTIVE offer (One at a time rule)
        const { data: activeOffer, error: activeError } = await supabase
            .from('offers')
            .select('id')
            .eq('listing_id', listingId)
            .eq('buyer_id', user.id)
            .in('status', ['pending', 'countered'])
            .maybeSingle();

        if (activeError) throw activeError;
        if (activeOffer) {
            return NextResponse.json({ error: 'You already have a pending offer on this item. Please wait for a response.' }, { status: 400 });
        }

        // 2. Check TOTAL attempts limit (Max 5 chances)
        const { count: totalAttempts, error: countError } = await supabase
            .from('offers')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listingId)
            .eq('buyer_id', user.id);

        if (countError) throw countError;
        if (totalAttempts !== null && totalAttempts >= 5) {
            return NextResponse.json({ error: 'Maximum offer limit (5) reached for this item.' }, { status: 400 });
        }

        // 2. Create Offer
        const { data: offer, error: insertError } = await supabase
            .from('offers')
            .insert({
                listing_id: listingId,
                buyer_id: user.id,
                amount_gbp: amount,
                status: 'pending'
            })
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json(offer);

    } catch (error: any) {
        console.error('Create Offer Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

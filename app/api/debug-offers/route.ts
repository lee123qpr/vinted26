import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    // 1. Init Admin Client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Fetch All Offers with Listing Status
    const { data: offers, error } = await supabase
        .from('offers')
        .select(`
            id,
            status,
            created_at,
            buyer_id,
            listings (
                id,
                title,
                status,
                seller_id
            )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

    return NextResponse.json({
        offers,
        error
    });
}

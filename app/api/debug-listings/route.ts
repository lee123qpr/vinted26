import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient(); // Await the promise for client creation in server context? No, createClient in server.ts returns a client, but in route handlers we usually do `await createClient()` or similar depending on implementation.
    // Wait, recent changes in Next.js/Supabase helpers: `createClient` might be async.
    // Checking lib/supabase/server.ts...
    // Assuming standard usage:
    // const supabase = await createClient();

    // But in the previous code I saw: 
    // const supabase = createClient(process.env..., process.env...); // This was service role usage?
    // Let's stick to the SERVICE ROLE usage for debugging to bypass RLS.

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Raw Table Data
    const { data: rawListings, error: rawError } = await supabaseAdmin
        .from('listings')
        .select('id, title, location_lat, location_lng')
        .order('created_at', { ascending: false })
        .limit(5);

    // 2. RPC Data
    const { data: rpcListings, error: rpcError } = await supabaseAdmin.rpc('search_listings', {
        limit_val: 5,
        offset_val: 0
    });

    return NextResponse.json({
        raw: rawListings,
        rawError,
        rpc: rpcListings,
        rpcError
    });
}


import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // use admin/service role if needed but anon might have RLS issues for admin query
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
    console.log('--- Debugging Category Performance ---');

    // 1. Check raw listings
    const { data: listings, error } = await supabase
        .from('listings')
        .select('id, title, price_gbp, status, category_id')
        .eq('status', 'sold');

    if (error) {
        console.error('Error fetching listings:', error);
        return;
    }

    console.log(`Found ${listings.length} sold listings.`);

    // 2. Check join
    const { data: joined, error: joinError } = await supabase
        .from('listings')
        .select('price_gbp, categories(name)')
        .eq('status', 'sold');

    if (joinError) {
        console.error('Error with join query:', joinError);
    } else {
        console.log('Join results sample:', JSON.stringify(joined.slice(0, 3), null, 2));
    }

    // 3. Count uncategorized
    const uncategorized = joined?.filter((l: any) => !l.categories).length;
    console.log(`Listings with null category relation: ${uncategorized}`);
}

main();

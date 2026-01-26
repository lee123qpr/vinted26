
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use Admin to test Syntax first (bypass RLS)
);

async function main() {
    console.log("Testing Orders Query...");

    // Attempting the exact query from page.tsx
    const { data, error } = await supabase
        .from('transactions')
        .select(`
            id,
            total_price_gbp,
            order_status,
            created_at,
            listings:listings!listing_id(id, title),
            seller:profiles!seller_id(username)
        `)
        .limit(5);

    if (error) {
        console.error("Query Failed!");
        console.error(JSON.stringify(error, null, 2));
    } else {
        console.log("Query Successful!");
        console.log(JSON.stringify(data, null, 2));
    }
}

main();

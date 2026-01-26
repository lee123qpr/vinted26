
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log("Testing Sales Query...");

    // Simulate getting user ID (we'll just list all transactions where seller is not null)
    // Actually, let's just query one transaction to see if the syntax holds.

    const { data, error } = await supabase
        .from('transactions')
        .select(`
            id,
            total_price_gbp,
            order_status,
            created_at,
            listings:listing_id (title),
            buyer_id,
            buyer:buyer_id (username)
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

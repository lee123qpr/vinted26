
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
    console.log("Checking disputes...");

    // 1. Get raw disputes
    const { data: disputes, error } = await supabase
        .from('disputes')
        .select('*');

    if (error) {
        console.error("Error fetching disputes:", error);
        return;
    }

    console.log(`Found ${disputes.length} disputes in raw table.`);
    console.log(JSON.stringify(disputes, null, 2));

    for (const d of disputes) {
        if (!d.transaction_id) {
            console.log(`Dispute ${d.id} has NULL transaction_id`);
            continue;
        }

        // 2. Check transaction
        const { data: t } = await supabase
            .from('transactions')
            .select('id, buyer_id, seller_id')
            .eq('id', d.transaction_id)
            .single();

        console.log(`Dispute ${d.id} points to Transaction ${d.transaction_id}. Exists? ${!!t}`);

        if (t) {
            // 3. Check Buyer Profile
            const { data: buyer } = await supabase.from('profiles').select('id').eq('id', t.buyer_id).single();
            // 4. Check Seller Profile
            const { data: seller } = await supabase.from('profiles').select('id').eq('id', t.seller_id).single();

            console.log(`Transaction Buyer (${t.buyer_id}) exists? ${!!buyer}`);
            console.log(`Transaction Seller (${t.seller_id}) exists? ${!!seller}`);
        }
    }

    // 5. Test the EXACT query used in the page (without createAdminClient, just regular client)
    console.log("Testing Page Query...");
    const { data: pageData, error: pageError } = await supabase
        .from('disputes')
        .select(`
            *,
            transaction:transactions(
                id,
                buyer:profiles!buyer_id(username, email),
                seller:profiles!seller_id(username, email),
                listing:listings(title)
            )
        `)
        .order('created_at', { ascending: false });

    if (pageError) console.error("Page Query Error:", pageError);
    else console.log(`Page Query returned ${pageData.length} records.`);

}

main();

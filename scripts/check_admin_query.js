require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkQuery() {
    console.log("--- Testing Reports Query ---");
    const { data: reports, error: rErr } = await supabase
        .from('reports')
        .select(`
            *,
            listing:listings(id, title),
            reporter:profiles!reporter_id(username)
        `)
        .limit(1);

    if (rErr) console.error("❌ Reports Error:", rErr.message);
    else console.log(`✅ Reports Found: ${reports.length}`);

    console.log("\n--- Testing Disputes Query ---");
    const { data: disputes, error: dErr } = await supabase
        .from('disputes')
        .select(`
            *,
            transaction:transactions(
                id,
                buyer:profiles!buyer_id(username),
                seller:profiles!seller_id(username)
            )
        `)
        .limit(1);

    if (dErr) console.error("❌ Disputes Error:", dErr.message);
    else console.log(`✅ Disputes Found: ${disputes.length}`);
}

checkQuery();

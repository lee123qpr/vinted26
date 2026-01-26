require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedReport() {
    console.log('🌱 Seeding fake REPORT data...');

    // 1. Get a listing
    const { data: listing } = await supabase.from('listings').select('id').limit(1).single();
    if (!listing) {
        console.error('❌ No listings found. Create a listing first.');
        return;
    }

    // 2. Get a user prompt
    const { data: user } = await supabase.from('profiles').select('id').limit(1).single();

    // 3. Create Report
    const { data: report, error } = await supabase
        .from('reports')
        .insert({
            listing_id: listing.id,
            reporter_id: user?.id, // Can be null if anon
            reason: 'not_authentic',
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Failed to create report:', error.message);
    } else {
        console.log(`✅ Created Report: ${report.id}`);
    }
}
seedReport();

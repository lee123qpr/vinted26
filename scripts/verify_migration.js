require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verify() {
    console.log('🕵️ Verifying "last_seen" column existence...');

    // Try to select the specific column
    const { data, error } = await supabase
        .from('profiles')
        .select('last_seen')
        .limit(1);

    if (error) {
        console.error('❌ Migration verification FAILED.');
        console.error('   Error:', error.message);
        if (error.message.includes('last_seen')) {
            console.log('   Reason: The column "last_seen" does not exist yet.');
        }
    } else {
        console.log('✅ Migration VERIFIED!');
        console.log('   The "last_seen" column exists in the database.');
        console.log('   Data sample:', data);
    }
}

verify();

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    console.log('Checking disputes table...');
    const { data, error } = await supabase.from('disputes').select('id, opened_by_id').limit(1);
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Dispute check success. Data:`, data);
    }
}
check();

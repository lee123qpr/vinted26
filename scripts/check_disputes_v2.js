require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { count, error } = await supabase.from('disputes').select('*', { count: 'exact', head: true });
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Dispute Count: ${count}`);
    }
}
check();

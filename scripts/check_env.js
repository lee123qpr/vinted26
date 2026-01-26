require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log('Service Role Key Exists:', !!serviceRoleKey);
if (serviceRoleKey) {
    console.log('Key prefix:', serviceRoleKey.substring(0, 5) + '...');
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkReports() {
    const { data, error } = await supabase.from('reports').select('*').limit(5);
    if (error) {
        console.error('Error fetching reports:', error.message);
    } else {
        console.log('Reports Found:', data.length);
        console.log('First Report:', data[0]);
    }
}

async function checkDisputes() {
    const { data, error } = await supabase.from('disputes').select('*').limit(5);
    if (error) {
        console.error('Error fetching disputes:', error.message);
    } else {
        console.log('Disputes Found:', data.length);
    }
}

checkReports();
checkDisputes();

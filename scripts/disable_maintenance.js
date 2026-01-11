const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    console.log('Disabling maintenance mode...');
    const { data, error } = await supabase
        .from('system_settings')
        .update({ is_active: false })
        .eq('key', 'maintenance_mode')
        .select();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success! Maintenance Mode Disabled.', data);
    }
}

run();

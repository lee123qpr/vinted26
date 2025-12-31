
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing RPC search_listings...');

    // Call the RPC with no params (should return recent listings)
    const { data, error } = await supabase.rpc('search_listings', {
        limit_val: 5
    });

    if (error) {
        console.error('❌ RPC Failed:', error);
    } else {
        console.log('✅ RPC Success!');
        console.log('Rows returned:', data ? data.length : 0);
        if (data && data.length > 0) {
            console.log('Sample:', data[0].title);
        }
    }
}

test();

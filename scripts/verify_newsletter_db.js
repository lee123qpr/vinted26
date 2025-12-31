
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
    console.log('Testing connection to:', supabaseUrl);

    // Check if newsletter_subscribers exists and we can select from it
    // (We expect 0 rows or some rows, but NO error)
    const { data, error } = await supabase.from('newsletter_subscribers').select('*').limit(1);
    if (error) {
        console.error('❌ Error assessing newsletter table:', error.message);
        if (error.code === '42P01') {
            console.log('Table does not exist.');
        }
    } else {
        console.log('✅ Newsletter Table Exists!');
        console.log('Rows found:', data.length);
    }
}

test();

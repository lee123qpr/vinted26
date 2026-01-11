const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// We need the service role key to bypass RLS for setup, but we want to test with anon/user logic if possible.
// Actually, to test RLS, we need to sign in as two users.
// Since we don't have their credentials, we can't fully reproduce RLS end-to-end here easily without creating test users.

// However, we can check basic table access.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing connection to messages table...');
    const { data, error } = await supabase.from('messages').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Error connecting to messages table:', error);
    } else {
        console.log('Successfully connected. Total messages count (visible to anon?):', data);
        // If RLS is on, anon might see 0 or error.
    }
}

testConnection();

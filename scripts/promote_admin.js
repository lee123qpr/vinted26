
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function promoteToAdmin(email) {
    console.log(`Promoting ${email} to Admin...`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing env vars. Ensure .env.local exists and has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Find User ID from Auth (Admin API)
    // Supabase Admin API: listUsers or similar?
    // Actually, we can't easily query auth.users by email via JS client without listUsers() loop or rpc if allowed.
    // BUT, we can just Update the Profile if we assume the profile exists.
    // Wait, profiles.id = auth.uid.
    // We need the UID.
    // Admin API allow getUserById but lookup by email is listUsers().

    // Attempt to list users to find the ID.
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error(`User with email ${email} not found. Please ensure they have signed up.`);
        return;
    }

    console.log(`Found user: ${user.id}`);

    // 2. Update Profile
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', user.id);

    if (updateError) {
        console.error('Error updating profile:', updateError);
    } else {
        console.log('Success! User promoted to Admin.');
    }
}

const targetEmail = process.argv[2] || 'leeking1@live.co.uk';

console.log(`\n🔍 Starting Admin Promotion for: ${targetEmail}`);
console.log('----------------------------------------');
promoteToAdmin(targetEmail);

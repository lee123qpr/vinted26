
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function debugUser(email) {
    console.log(`Debugging user: ${email}`);

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Check Auth User
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Auth Error:', authError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.log('❌ User NOT FOUND in auth.users.');
        return;
    }
    console.log(`✅ User FOUND in auth.users. ID: ${user.id}`);

    // 2. Check Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, is_admin')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.log('❌ Error fetching profile:', profileError.message);
    } else if (!profile) {
        console.log('❌ Profile row NOT FOUND.');
    } else {
        console.log('✅ Profile row FOUND.');
        console.log('Profile Data:', profile);
        console.log(`is_admin: ${profile.is_admin}`);
    }
}

debugUser('leeking1@live.co.uk');

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function makeAdmin() {
    // Get latest profile
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error || !profiles || profiles.length === 0) {
        console.error('No profiles found');
        return;
    }

    const user = profiles[0];
    console.log(`Found User: ${user.email} (${user.id})`);

    // Update
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', user.id);

    if (updateError) {
        console.error('Failed to make admin:', updateError);
    } else {
        console.log(`✅ Success! User ${user.email} is now an ADMIN.`);
    }
}
makeAdmin();

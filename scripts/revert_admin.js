require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function revertAdmin() {
    const email = 'lee_kilcoyne@hotmail.com';
    const { data: user } = await supabase.from('profiles').select('id').eq('email', email).single();

    if (user) {
        await supabase.from('profiles').update({ is_admin: false }).eq('id', user.id);
        console.log(`Reverted admin status for ${email}`);
    } else {
        console.log('User not found');
    }
}
revertAdmin();

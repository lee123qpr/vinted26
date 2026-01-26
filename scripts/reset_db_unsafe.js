require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function wipeDatabase() {
    console.log('WARNING: This will delete ALL user data. Starting in 3 seconds...');
    await new Promise(r => setTimeout(r, 3000));

    try {
        // 1. Delete all users from auth.users (Cascades to public.profiles and everything else due to FK)
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) throw listError;

        console.log(`Found ${users.length} users. Deleting...`);

        for (const user of users) {
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
            if (deleteError) console.error(`Failed to delete user ${user.id}:`, deleteError.message);
            else console.log(`Deleted user ${user.id}`);
        }

        // 2. Extra safety clean up for anything not cascaded (Optional but good)
        const tables = ['dispute_messages', 'dispute_evidence', 'disputes', 'transactions', 'listing_images', 'listings'];
        for (const table of tables) {
            const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
            if (error) console.log(`Table ${table} cleanup check: ${error.message} (Likely already empty via cascade)`);
        }

        console.log('✅ Database reset complete. Clean slate ready.');

    } catch (err) {
        console.error('Reset failed:', err);
    }
}

wipeDatabase();

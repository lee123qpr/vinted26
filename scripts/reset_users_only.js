require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function wipeUserData() {
    console.log('🧹 STARTING TARGETED USER WIPE (Preserving App Data)');
    console.log('Target:', supabaseUrl);

    try {
        // 1. Defined USER tables (Delete these)
        // EXCLUDES: categories, articles, system_settings
        const userTables = [
            'notifications',
            'dispute_evidence',
            'dispute_messages',
            'disputes',
            'reviews',
            'favourites',
            'messages',
            'offers',
            'transactions',
            'listing_images',
            'listings',
            'profiles'
        ];

        console.log('🗑️  Truncating user tables...');
        for (const table of userTables) {
            // try deleting all rows
            const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (error) {
                if (error.code !== '42P01') console.error(`   ❌ Failed ${table}: ${error.message}`);
                else console.log(`   ℹ️  Skipping missing ${table}`);
            } else {
                console.log(`   ✅ Cleared ${table}`);
            }
        }

        // 2. Delete Auth Users (The real test)
        console.log('🗑️  Deleting Auth Users...');

        // Safety Loop: Try 5 times to clear them all
        for (let i = 0; i < 5; i++) {
            const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });

            if (error) { console.error('List Error:', error); break; }
            if (!users || users.length === 0) { console.log('   ✅ No users found. Auth is clean.'); break; }

            console.log(`   Attempt ${i + 1}: Found ${users.length} users...`);

            // Delete in parallel
            await Promise.all(users.map(u => supabase.auth.admin.deleteUser(u.id)));

            // Brief pause for propagation
            await new Promise(r => setTimeout(r, 1000));
        }

        // Final Verification
        const { data: { users: finalUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        console.log(`🏁 Final User Count: ${finalUsers?.length || 0}`);

    } catch (err) {
        console.error('CRITICAL FAILURE:', err);
    }
}

wipeUserData();

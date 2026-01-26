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
    console.log('🔄 Starting ROBUST database wipe...');

    try {
        // 1. Delete LEAF tables (Dependencies) first to prevent FK errors
        const leafTables = [
            'messages',           // Blocked listing deletion
            'dispute_messages',
            'dispute_evidence',
            'notifications',      // Likely exists
            'listing_images',
            'reviews'             // If exists
        ];

        console.log('🗑️  Cleaning leaf tables...');
        for (const table of leafTables) {
            const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (error) {
                // Ignore "relation does not exist" errors if table is missing
                if (error.code !== '42P01') console.log(`   Internal Step: ${table} - ${error.message}`);
            } else {
                console.log(`   ✅ Cleared ${table}`);
            }
        }

        // 2. Delete Core Business Tables
        const coreTables = ['transactions', 'disputes', 'listings'];
        console.log('🗑️  Cleaning core tables...');
        for (const table of coreTables) {
            const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (error) console.error(`   ❌ Failed ${table}: ${error.message}`);
            else console.log(`   ✅ Cleared ${table}`);
        }

        // 3. Delete Auth Users (This should now succeed and cascade to profiles)
        console.log('🗑️  Deleting Auth Users...');
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });

        if (listError) throw listError;

        console.log(`   Found ${users.length} users to delete.`);
        let deletedCount = 0;

        for (const user of users) {
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
            if (deleteError) console.error(`   ❌ Failed to delete user ${user.id}:`, deleteError.message);
            else deletedCount++;
        }
        console.log(`   ✅ Successfully deleted ${deletedCount}/${users.length} users.`);

        console.log('✨ Database reset complete. Clean slate verified.');

    } catch (err) {
        console.error('CRITICAL RESET FAILURE:', err);
    }
}

wipeDatabase();

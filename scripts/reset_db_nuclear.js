require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function wipeDatabase() {
    console.log('☢️  INITIATING NUCLEAR DATABASE RESET ☢️');
    console.log('Target: ', supabaseUrl);

    try {
        // 1. Delete Dependency Tables (Leaf Nodes)
        // Order matters: foreign key constraints
        const tables = [
            'notifications',
            'subscribers',         // Newsletter
            'article_tags',
            'articles',
            'system_settings',
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
            'profiles'             // User profiles (often connected to auth.users)
        ];

        console.log('🗑️  Truncating public tables...');
        for (const table of tables) {
            // try deleting all rows
            const { error, count } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything
            if (error) {
                // 42P01 is "undefined_table", ignore it.
                if (error.code !== '42P01') console.error(`   ❌ Failed ${table}: ${error.message} (Code: ${error.code})`);
                else console.log(`   ℹ️  Skipping missing table: ${table}`);
            } else {
                console.log(`   ✅ Cleared ${table}`);
            }
        }

        // 2. Delete Auth Users
        // This is the source of truth for "User Accounts"
        console.log('🗑️  Deleting ALL Auth Users...');

        // Pagination loop
        let hasMore = true;
        let totalDeleted = 0;
        let page = 1;

        while (hasMore) {
            const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 50, page: page });

            if (error) {
                console.error('Failed to list users:', error);
                break;
            }

            if (!users || users.length === 0) {
                hasMore = false;
                break;
            }

            console.log(`   Page ${page}: Found ${users.length} users. Deleting...`);

            const deletePromises = users.map(user =>
                supabase.auth.admin.deleteUser(user.id)
                    .then(({ error }) => {
                        if (error) return { id: user.id, success: false, msg: error.message };
                        return { id: user.id, success: true };
                    })
            );

            const results = await Promise.all(deletePromises);
            const successCount = results.filter(r => r.success).length;
            const failures = results.filter(r => !r.success);

            totalDeleted += successCount;

            if (failures.length > 0) {
                console.error(`   ⚠️  Failed to delete ${failures.length} users on this page.`);
                failures.forEach(f => console.error(`      User ${f.id}: ${f.msg}`));
            } else {
                console.log(`   ✅ Deleted batch of ${successCount} users.`);
            }

            // Since we are deleting, the "next page" is actually the "first page" again if we re-fetched.
            // But listUsers logic can be tricky with deletion.
            // Safer to just re-list page 1 until empty?
            // Actually, let's just loop PAGE 1 repeatedly until empty.
            // If we successfully deleted them, they are gone.
            // If we failed, we might loop infinitely. 
            // Break if 0 successes?
            if (successCount === 0 && users.length > 0) {
                console.error("   🛑 Stuck deleting users. Aborting auth clean loop.");
                break;
            }

            // Reset to page 1 to check for remaining users
            page = 1;
        }

        console.log(`   ✅ Total Auth Users Deleted: ${totalDeleted}`);
        console.log('✨ Nuclear Reset Complete. Please verify manually.');

    } catch (err) {
        console.error('CRITICAL FAILURE:', err);
    }
}

wipeDatabase();

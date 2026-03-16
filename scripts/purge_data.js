const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function purgeAllUserData() {
    console.log('⚠️  STARTING DATA PURGE...');

    try {
        // 1. Fetch all users
        console.log('Fetching all users...');
        const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
            perPage: 1000 // Ensure we get as many as possible
        });

        if (usersError) {
            throw usersError;
        }

        const users = usersData.users || [];
        console.log(`Found ${users.length} users to delete.`);

        // 2. Delete each user
        let deletedCount = 0;
        let errorCount = 0;

        for (const user of users) {
            console.log(`Deleting user: ${user.email} (${user.id})...`);
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
            
            if (deleteError) {
                console.error(`❌ Failed to delete ${user.email}:`, deleteError.message);
                require('fs').writeFileSync('delete_error.json', JSON.stringify(deleteError, null, 2));
                errorCount++;
            } else {
                deletedCount++;
            }
        }

        console.log('\n✅ Data Purge Complete.');
        console.log(`Deleted: ${deletedCount} users.`);
        if (errorCount > 0) {
            console.log(`Errors: ${errorCount} users failed to delete.`);
        }
        
        console.log('\nNote: Deleting users automatically cascades to profiles, listings, orders, messages, etc. The database is now clean.');
        
    } catch (error) {
        console.error('❌ Critical Error during purge:', error);
    }
}

purgeAllUserData();

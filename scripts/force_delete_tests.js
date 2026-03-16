const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_EMAILS = [
    'e2e.seller.test@example.com',
    'e2e.buyer.test@example.com'
];

async function forceDeleteUsers() {
    console.log('Fetching users to delete...');
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
        console.error('Failed to fetch users:', usersError);
        return;
    }

    const usersToDelete = usersData.users.filter(u => TARGET_EMAILS.includes(u.email));

    if (usersToDelete.length === 0) {
        console.log('No matching users found.');
        return;
    }

    for (const user of usersToDelete) {
        console.log(`\n--- Cleaning up data for ${user.email} (${user.id}) ---`);
        const id = user.id;

        // 1. Delete Messages
        console.log('  Deleting messages...');
        await supabase.from('messages').delete().or(`sender_id.eq.${id},recipient_id.eq.${id}`);

        // 2. Delete Conversations
        console.log('  Deleting conversations...');
        await supabase.from('conversations').delete().or(`participant1_id.eq.${id},participant2_id.eq.${id}`);

        // 3. Delete Reviews
        console.log('  Deleting reviews...');
        await supabase.from('reviews').delete().or(`reviewer_id.eq.${id},reviewee_id.eq.${id}`);

        // 4. Delete Transactions (Orders)
        console.log('  Deleting transactions...');
        await supabase.from('transactions').delete().or(`buyer_id.eq.${id},seller_id.eq.${id}`);

        // 5. Delete Disptues
        console.log('  Deleting disputes...');
        await supabase.from('disputes').delete().or(`opened_by_id.eq.${id},resolved_by_admin_id.eq.${id}`);

        // 6. Listings (Should cascade, but let's be safe)
        console.log('  Deleting listings...');
        await supabase.from('listings').delete().eq('seller_id', id);

        // 6.5 Other tables
        console.log('  Deleting favourites, reports, notifications...');
        await supabase.from('favourites').delete().eq('user_id', id);
        await supabase.from('notifications').delete().eq('user_id', id);
        await supabase.from('reports').delete().eq('reporter_id', id);

        // 7. Finally, delete Auth User
        console.log(`  Deleting auth user ${user.email}...`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(id);

        if (deleteError) {
            console.error(`  ❌ Failed to delete auth user ${user.email}:`, deleteError.message);
        } else {
            console.log(`  ✅ Successfully deleted ${user.email}`);
        }
    }
}

forceDeleteUsers();

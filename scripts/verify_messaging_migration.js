require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing credentials. Make sure .env.local exists with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMessaging() {
    console.log('🔍 Verifying Messaging Scalability Migration...');

    // 1. Check if table exists (by trying to select from it)
    console.log('1. Checking conversations table existence...');
    const { data: convs, error: tableError } = await supabase.from('conversations').select('id').limit(1);

    if (tableError) {
        if (tableError.code === '42P01') { // undefined_table
            console.error('❌ MIGRATION FAILED: public.conversations table does not exist.');
        } else {
            console.error('❌ Error accessing conversations table:', tableError.message);
        }
        process.exit(1);
    }
    console.log('✅ Conversations table is accessible.');

    // 2. Setup Test Users
    console.log('2. Setting up test users...');
    // We'll reuse the logic to find/create users
    const getUserId = async (email) => {
        const { data } = await supabase.from('profiles').select('id').eq('email', email).single();
        // If no profile, try to find in auth (service role can do this)
        if (!data) {
            const { data: { users } } = await supabase.auth.admin.listUsers();
            const user = users.find(u => u.email === email);
            return user ? user.id : null;
        }
        return data.id;
    };

    let u1 = await getUserId('buyer_test@skipped-uk.com');
    let u2 = await getUserId('seller_test@skipped-uk.com');

    if (!u1 || !u2) {
        console.log('⚠️ Test users not found via email. Creating dummy fallback users just for ID generation (UUIDs).');
        // If we can't find them, we can mock UUIDs? No, foreign key constraints might fail if profiles table enforces valid IDs.
        // Let's assume the seed script ran or users exist. If not, we list 2 users.
        const { data: profiles } = await supabase.from('profiles').select('id').limit(2);
        if (profiles && profiles.length >= 2) {
            u1 = profiles[0].id;
            u2 = profiles[1].id;
            console.log(`   Using existing profiles: ${u1} and ${u2}`);
        } else {
            console.error('❌ Not enough users in database to test.');
            process.exit(1);
        }
    }

    // 3. Send a Message (Trigger Check)
    console.log('3. Sending a test message to trigger update...');
    const msgText = `Scalability Test Message ${Date.now()}`;

    // We need a valid listing ID for the constraint? Schema says Listing ID is nullable!
    // conversation unique constraint is (listing_id, p1, p2).
    // Let's test a DM (listing_id = null)

    const { data: msg, error: msgError } = await supabase.from('messages').insert({
        sender_id: u1,
        recipient_id: u2,
        listing_id: null,
        message_text: msgText,
        is_read: false
    }).select().single();

    if (msgError) {
        console.error('❌ Failed to insert message:', msgError.message);
        process.exit(1);
    }
    console.log(`✅ Message sent (ID: ${msg.id})`);

    // 4. Verify Conversation Updated
    console.log('4. Checking if conversation was created/updated...');
    // Wait a brief moment for trigger? Triggers are synchronous in Postgres usually, so immediate select should work.

    const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('last_message_id', msg.id)
        .single();

    if (convError || !conversation) {
        console.error('❌ Conversation NOT updated. Trigger validation failed.');
        console.error('   Error:', convError);

        // Debug: check if any conversation exists for these 2
        const { data: anyConv } = await supabase.from('conversations')
            .select('*')
            .or(`and(participant1_id.eq.${u1},participant2_id.eq.${u2}),and(participant1_id.eq.${u2},participant2_id.eq.${u1})`)
            .is('listing_id', null);

        console.log('   Existing conversations found for pair:', anyConv);
        process.exit(1);
    }

    console.log('✅ Conversation record found!');
    console.log('   Conversation ID:', conversation.id);
    console.log('   Last Message ID matches:', conversation.last_message_id === msg.id);

    console.log('\n🎉 SUCCESS: Messaging Scalability Migration verified.');
}

verifyMessaging();

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing credentials. Make sure .env.local exists with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser(email, password, username) {
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: username, username: username }
    });

    if (error) {
        console.log(`Note: User ${email} result: ${error.message}`);
        // If user exists, try to get from profiles by username (since we can't easily query auth.users by email in all environments)
        // or just list users and find matches.

        // Attempt 1: Get profile by username
        const { data: profile } = await supabase.from('profiles').select('id').eq('username', username).single();
        if (profile) return profile;

        // Attempt 2: List auth users (expensive but ensuring)
        const { data: usersData } = await supabase.auth.admin.listUsers();
        if (usersData && usersData.users) {
            const found = usersData.users.find(u => u.email === email);
            if (found) return found;
        }
    }
    return data.user;
}

async function seedDispute() {
    console.log('🌱 Seeding fake dispute data...');

    // 1. Ensure we have users
    console.log('   Ensuring test users exist...');
    const buyer = await createTestUser('buyer_test@skipped.co.uk', 'password123', 'TestBuyer');
    const seller = await createTestUser('seller_test@skipped.co.uk', 'password123', 'TestSeller');

    if (!buyer || !seller) {
        console.error('❌ Could not get/create buyer or seller users.');
        return;
    }

    const buyerId = buyer.id;
    const sellerId = seller.id;

    console.log(`   Buyer: ${buyerId}`);
    console.log(`   Seller: ${sellerId}`);

    // 2. Create a Listing
    const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
            seller_id: sellerId,
            title: 'Vintage Leather Jacket (Test Item)',
            description: 'Beautiful vintage item, barely used.',
            price_gbp: 125.00,
            condition: 'good',
            // category_id: null, // Optional
            status: 'sold'
        })
        .select()
        .single();

    const fs = require('fs');

    if (listingError) {
        fs.writeFileSync('scripts/last_error.txt', 'Listing Error: ' + JSON.stringify(listingError, null, 2));
        console.error('❌ Failed to create listing');
        process.exit(1);
    }
    console.log(`✅ Created Listing: ${listing.id}`);

    // 3. Create a Transaction
    const txPayload = {
        listing_id: listing.id,
        buyer_id: buyerId,
        seller_id: sellerId,
        total_price_gbp: 132.99,
        platform_fee_gbp: 5.00,
        delivery_fee_gbp: 2.99,
        delivery_method: 'delivery',
        order_status: 'disputed',
        payment_status: 'held_in_escrow'
    };
    console.log('Inserting transaction:', txPayload);

    const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert(txPayload)
        .select()
        .single();

    if (txError) {
        fs.writeFileSync('scripts/last_error.txt', 'Transaction Error: ' + JSON.stringify(txError, null, 2));
        console.error('❌ Failed to create transaction');
        process.exit(1);
    }
    console.log(`✅ Created Transaction: ${transaction.id}`);

    // 4. Create Dispute
    const { data: dispute, error: disputeError } = await supabase
        .from('disputes')
        .insert({
            transaction_id: transaction.id,
            opened_by_id: buyerId,
            issue_type: 'not_as_described',
            description: 'The jacket has a large tear in the back that was not mentioned in the listing!',
            status: 'open'
        })
        .select()
        .single();

    if (disputeError) {
        fs.writeFileSync('scripts/last_error.txt', 'Dispute Error: ' + JSON.stringify(disputeError, null, 2));
        console.error('❌ Failed to create dispute');
        process.exit(1);
    }
    console.log(`✅ Created Dispute: ${dispute.id}`);

    // 5. Add Messages
    await supabase.from('dispute_messages').insert([
        {
            dispute_id: dispute.id,
            sender_id: buyerId,
            message_text: 'I recieved this today and I am very unhappy. Please see the attached photo of the damage.'
        },
        {
            dispute_id: dispute.id,
            sender_id: sellerId,
            message_text: 'It was fine when I sent it! You must have damaged it opening the package.'
        }
    ]);
    console.log('✅ Added test messages');

    console.log('\n🎉 Done! Refresh the Admin > Disputes page to see it.');
}

seedDispute();

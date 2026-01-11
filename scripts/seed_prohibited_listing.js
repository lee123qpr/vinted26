require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedProhibitedListing() {
    console.log('Creating test listing with prohibited content...');

    // Get the first user to use as seller
    const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

    if (!users || users.length === 0) {
        console.error('No users found in database');
        return;
    }

    const sellerId = users[0].id;

    // Get a category
    const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .limit(1);

    if (!categories || categories.length === 0) {
        console.error('No categories found');
        return;
    }

    const categoryId = categories[0].id;

    // Create listing with prohibited content
    const { data: listing, error } = await supabase
        .from('listings')
        .insert({
            seller_id: sellerId,
            category_id: categoryId,
            title: 'TEST: Contact me for this scam deal!',
            description: 'Great item! Call me at 07700900123 or email test@example.com for more info. This is a damn good deal, hell yeah!',
            condition: 'good',
            price_gbp: 50.00,
            quantity_available: 1,
            status: 'active',
            offers_collection: true,
            offers_delivery: false
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating listing:', error);
        return;
    }

    console.log('✅ Test listing created successfully!');
    console.log('Listing ID:', listing.id);
    console.log('Title:', listing.title);
    console.log('\nThis listing contains:');
    console.log('- Phone number: 07700900123');
    console.log('- Email: test@example.com');
    console.log('- Keywords: scam, damn, hell');
    console.log('\nGo to /admin/listings to see the ⚠️ Review Content flag!');
}

seedProhibitedListing()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

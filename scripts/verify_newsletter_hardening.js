require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using ANON key to simulate public user

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Verifying newsletter hardening...\n');

    // Test 1: Invalid Email
    const invalidEmail = 'invalid-email-format';
    console.log(`TEST 1: Attempting to insert invalid email: "${invalidEmail}"`);

    const { error: error1 } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: invalidEmail }]);

    if (error1) {
        if (error1.message.includes('email_validation_check') || error1.code === '23514') {
            console.log('✅ Success! Database REJECTED invalid email.');
            console.log(`   Error: ${error1.message}`);
        } else {
            console.log('⚠️  Rejected, but with unexpected error:', error1.message);
        }
    } else {
        console.error('❌ FAILURE: Database ACCEPTED invalid email!');
    }

    console.log('\n----------------------------------------\n');

    // Test 2: Valid Email
    const validEmail = `test.valid.${Date.now()}@example.com`;
    console.log(`TEST 2: Attempting to insert valid email: "${validEmail}"`);

    const { error: error2 } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: validEmail }]);

    if (error2) {
        console.error(`❌ FAILURE: Valid email insertion failed: ${error2.message}`);
    } else {
        console.log('✅ Success! Database ACCEPTED valid email.');
    }
}

verify();

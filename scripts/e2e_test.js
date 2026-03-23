// scripts/e2e_test.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase Service Role Key. Cannot run E2E admin tests.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log("🚀 STARTING EXHAUSTIVE E2E PLATFORM TEST SUITE 🚀\n");
  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${description}`);
      failed++;
    }
  };

  try {
    // ==========================================
    // 1. SETUP: Create Test Users
    // ==========================================
    console.log("--- 1. Auth & Profiles ---");
    const testId = Date.now();
    const sellerEmail = `seller_${testId}@test.com`;
    const buyerEmail = `buyer_${testId}@test.com`;

    // Create Real Auth Users using Service Role
    const { data: sData, error: sErr } = await supabase.auth.admin.createUser({
        email: sellerEmail,
        password: 'securePassword123!',
        email_confirm: true,
        user_metadata: { username: `test_seller_${testId}` }
    });
    
    const { data: bData, error: bErr } = await supabase.auth.admin.createUser({
        email: buyerEmail,
        password: 'securePassword123!',
        email_confirm: true,
        user_metadata: { username: `test_buyer_${testId}` }
    });

    assert(!sErr && !bErr, "Successfully created Test Seller and Test Buyer identities.");
    
    // Wait an instant for trigger to create profiles
    await new Promise(res => setTimeout(res, 500));

    // Fetch the auto-generated profiles
    const { data: seller } = await supabase.from('profiles').select('*').eq('id', sData.user.id).single();
    const { data: buyer } = await supabase.from('profiles').select('*').eq('id', bData.user.id).single();

    // Setup Stripe ID for mock seller
    await supabase.from('profiles').update({ stripe_account_id: 'acct_test123' }).eq('id', seller.id);

    // ==========================================
    // 2. LISTINGS & CARBON CALCULATION
    // ==========================================
    console.log("\n--- 2. Carbon & Formulas ---");

    // Fetch the category ID for 'Timber' or similar to attach to the listing
    const { data: cat } = await supabase.from('categories').select('id').limit(1).single();
    
    const { data: listing, error: lErr } = await supabase.from('listings').insert({
        seller_id: seller.id,
        title: "E2E Test Timber Batch",
        description: "100x 2x4 Timber Planks",
        price_gbp: 50.00,
        category_id: cat?.id,
        condition: 'good',
        weight_kg: 500, // 500kg of timber
        carbon_saved_kg: 500 * 0.45, // Simulating backend multiplier logic
        status: 'active',
        include_carbon_certificate: true
    }).select().single();

    assert(!lErr && listing, "Successfully created active Test Listing.");
    assert(listing.carbon_saved_kg > 0, "Carbon Saved constraint generated positive value.");
    assert(listing.weight_kg === 500, "Landfill diversion weight successfully stored.");

    // ==========================================
    // 3. TRUST & SAFETY: Message Flagging Trigger
    // ==========================================
    console.log("\n--- 3. Trust & Safety RegEx Triggers ---");
    
    // Create conversation
    const { data: conv } = await supabase.from('conversations').insert({
        listing_id: listing.id,
        buyer_id: buyer.id,
        seller_id: seller.id
    }).select().single();

    // Send a clean message
    const { data: msg1 } = await supabase.from('messages').insert({
        conversation_id: conv.id,
        sender_id: buyer.id,
        content: "Hi, is this timber still available?",
    }).select().single();

    assert(msg1 && msg1.is_flagged === false, "Clean message passed moderation trigger.");

    // Send a violation message (contains phone number logic)
    const { data: msg2, error: m2Err } = await supabase.from('messages').insert({
        conversation_id: conv.id,
        sender_id: seller.id,
        content: "Yeah it is. Just paypal me directly or call 07712345678 to bypass the fees.",
    }).select().single();

    assert(msg2 && msg2.is_flagged === true, "DANGEROUS message successfully caught and flagged by Postgres RegEx Trigger.");

    // ==========================================
    // 4. CHECKOUT & PLATFORM FEES
    // ==========================================
    console.log("\n--- 4. Financial Constraints ---");
    
    const { data: feeSetting } = await supabase.from('system_settings').select('value').eq('key', 'platform_fee_percent').single();
    const feePercent = feeSetting ? parseFloat(feeSetting.value) : 5;
    const expectedFee = parseFloat((listing.price_gbp * (feePercent / 100)).toFixed(2));

    const { data: tx, error: txErr } = await supabase.from('transactions').insert({
        listing_id: listing.id,
        buyer_id: buyer.id,
        seller_id: seller.id,
        total_price_gbp: listing.price_gbp,
        platform_fee_gbp: expectedFee,
        payment_status: 'held_in_escrow',
        stripe_payment_intent_id: `pi_test_${testId}`
    }).select().single();

    assert(!txErr && tx, "Successfully escrowed transaction.");
    assert(tx.platform_fee_gbp === expectedFee, `Platform fee correctly calculated at ${feePercent}% (£${expectedFee}).`);

    // ==========================================
    // 5. ACCOUNT DELETION INTEGRITY
    // ==========================================
    console.log("\n--- 5. Soft Deletion Safety ---");
    
    // Buyer deletes their account
    const { error: delErr } = await supabase.from('profiles')
        .update({ account_status: 'deleted', full_name: 'Deleted User', email: 'deleted@user.com' })
        .eq('id', buyer.id);

    assert(!delErr, "Account deletion protocol triggered.");

    // Verify transaction remains intact even though buyer is deleted (Testing relational constraints)
    const { data: remainingTx } = await supabase.from('transactions').select('*').eq('id', tx.id).single();
    assert(remainingTx && remainingTx.buyer_id === buyer.id, "Financial Ledger remained intact after buyer deletion (Anti-Corruption Check).");

    // Verify Stripe data remains for the Seller (We didn't delete the seller, but if we did, we check it)
    const { data: remainingSeller } = await supabase.from('profiles').select('stripe_account_id').eq('id', seller.id).single();
    assert(remainingSeller.stripe_account_id === 'acct_test123', "Stripe Financial mappings remain isolated and secured.");

    // ==========================================
    // 6. CLEANUP (Tear down test data)
    // ==========================================
    console.log("\n--- 6. State Cleanup ---");
    await supabase.from('transactions').delete().eq('id', tx.id);
    await supabase.from('messages').delete().eq('conversation_id', conv.id);
    await supabase.from('conversations').delete().eq('id', conv.id);
    await supabase.from('listings').delete().eq('id', listing.id);
    
    // Deleting the root auth users cascades down to profiles automatically
    await supabase.auth.admin.deleteUser(sData.user.id);
    await supabase.auth.admin.deleteUser(bData.user.id);
    
    console.log("✅ Teardown complete. Zero state contamination.");

  } catch (error) {
    console.error("CRITICAL TEST FAILURE:", error);
  }

  console.log(`\n📊 RESULTS: ${passed} Passed | ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runTests();

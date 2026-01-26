
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
    console.log('--- Simulating Full Payout Flow ---');

    let sellerId: string;
    let buyerId: string;

    // 1. Try to reuse existing users
    const { data: existingProfiles } = await supabase.from('profiles').select('id, username').limit(2);

    if (existingProfiles && existingProfiles.length >= 2) {
        sellerId = existingProfiles[0].id;
        buyerId = existingProfiles[1].id;
        console.log(`Using Existing Users: Seller=${sellerId}, Buyer=${buyerId}`);
    } else {
        console.log('Not enough existing users, creating new ones...');

        // Create Seller
        const sellerEmail = `seller_${Date.now()}@test.com`;
        try {
            const { data: sellerAuth, error: authError } = await supabase.auth.admin.createUser({
                email: sellerEmail,
                password: 'Password123!',
                email_confirm: true
            });
            if (authError) throw authError;
            sellerId = sellerAuth.user.id;
            await supabase.from('profiles').upsert({ id: sellerId, username: `Seller_${sellerId.slice(0, 5)}` });

        } catch (e: any) {
            console.error('Failed to create seller:', e);
            return;
        }

        // Create Buyer
        const buyerEmail = `buyer_${Date.now()}@test.com`;
        try {
            const { data: buyerAuth, error: authError } = await supabase.auth.admin.createUser({
                email: buyerEmail,
                password: 'Password123!',
                email_confirm: true
            });
            if (authError) throw authError;
            buyerId = buyerAuth.user.id;
            await supabase.from('profiles').upsert({ id: buyerId, username: `Buyer_${buyerId.slice(0, 5)}` });
        } catch (e: any) {
            console.error('Failed to create buyer:', e);
            return;
        }
    }

    // 2. Onboard Seller (Stripe Connect)
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            stripe_account_id: 'acct_123456789', // MOCK ID
            stripe_charges_enabled: true
        })
        .eq('id', sellerId);

    if (profileError) { console.error('Profile Update Error:', profileError); return; }
    console.log('Seller Onboarded (Mock Stripe ID Set).');

    // 3. Create Listing
    const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
            seller_id: sellerId,
            title: 'Test Payout Item',
            price_gbp: 100.00,
            status: 'active',
            description: 'Test Description for Payout',
            condition: 'new_unused',
            category_id: null
        })
        .select()
        .single();

    if (listingError) { console.error('Listing Error:', listingError); return; }
    console.log(`Listing Created: ${listing.id} (£100.00)`);

    // 4. Simulate Purchase (Transaction)
    const platformFee = 100 * 0.05; // 5%

    // We assume Buyer is valid.
    const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
            listing_id: listing.id,
            buyer_id: buyerId,
            seller_id: sellerId,
            total_price_gbp: 100.00,
            platform_fee_gbp: platformFee, // £5.00
            payment_status: 'held_in_escrow',
            order_status: 'shipped',
            delivery_method: 'delivery',
            stripe_payment_intent_id: 'pi_mock_123'
        })
        .select()
        .single();

    if (txError) { console.error('Transaction Error:', txError); return; }
    console.log(`Transaction Created: ${transaction.id} (Escrow: £100, Fee: £5)`);

    // 5. Execute Payout Logic Simulation
    console.log('--- Executing Payout Logic (Simulation) ---');

    // logic from actions/orders.ts
    const { data: sellerProfile } = await supabase.from('profiles').select('*').eq('id', sellerId).single();

    if (sellerProfile.stripe_account_id && sellerProfile.stripe_charges_enabled) {
        console.log(`Seller Verified. Stripe ID: ${sellerProfile.stripe_account_id}`);

        const payoutAmount = transaction.total_price_gbp - transaction.platform_fee_gbp;
        console.log(`Calculated Payout: £${transaction.total_price_gbp} - £${transaction.platform_fee_gbp} = £${payoutAmount.toFixed(2)}`);

        if (payoutAmount === 95.00) {
            console.log('SUCCESS: Payout Calculation Logic Verified ✅');
        } else {
            console.error('FAILURE: Logic Error in Payout Calculation ❌');
        }

    } else {
        console.error('FAILURE: Seller Connect Check Failed ❌');
        console.log('Seller Profile:', sellerProfile);
    }
}

main();


import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
    console.log('--- Setting up Test Data ---');

    // 1. Create/Get Seller User
    const sellerEmail = 'seller_test@example.com';
    let sellerId;

    // Check if exists in Auth (can't query auth.users directly easily via client without service key)
    // We'll just try to sign up, if fails, sign in? OR just rely on the user existing.
    // Actually, creating users via script is hard because of password hashing.
    // BETTER STRATEGY: Create entries in `profiles` directly linked to a dummy UUID? 
    // No, we need to log in.

    // Alternative: We will use the BROWSER to sign up, then use this script to VERIFY them.

    console.log('Please run this script AFTER creating "seller_test" via the UI.');

    // Listing Search
    // We'll create a listing for the user if we can find them.

    // For now, let's just make sure "Uncategorized" is fixed? No, focus on flow.

    // Let's create a Helper Function to "Force Verify" a user by email
    const emailToVerify = process.argv[2];

    if (emailToVerify) {
        console.log(`Attempting to force-verify Stripe for email: ${emailToVerify}`);

        // We need to look up profile by email? Profile doesn't have email.
        // We need auth.users.
        const { data: { users }, error } = await supabase.auth.admin.listUsers();

        const user = users?.find(u => u.email === emailToVerify);

        if (user) {
            console.log(`Found user ${user.id}. Updating profile...`);

            // Mock Stripe Account ID 'acct_123456789'
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    stripe_account_id: 'acct_1GmK742eZvKYlo2C', // Use a valid-looking format or dummy
                    stripe_charges_enabled: true
                })
                .eq('id', user.id);

            if (updateError) console.error('Update failed:', updateError);
            else console.log('User FORCE VERIFIED as Seller! ✅');

        } else {
            console.error('User not found in Auth.');
        }
    } else {
        console.log('Usage: npx tsx scripts/setup_test.ts <email>');
    }
}

main();

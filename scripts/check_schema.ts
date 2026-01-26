
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
    console.log('--- Checking Profiles Schema ---');

    // Attempt to select the specific columns
    const { data, error } = await supabase
        .from('profiles')
        .select('id, stripe_account_id, stripe_charges_enabled')
        .limit(1);

    if (error) {
        console.error('Column Check Failed:', error.message);
        if (error.message.includes('dt does not exist') || error.message.includes('relation') || error.message.includes('column')) {
            console.log('Confirmed: Columns are missing.');
        }
    } else {
        console.log('Columns EXIST. Schema is good.');
    }
}

main();

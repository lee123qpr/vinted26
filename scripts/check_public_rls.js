
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// We need the SERVICE ROLE key to simulate "server" actions if we want to bypass RLS, 
// BUT we want to test AS A USER to see if RLS is the problem.
// So we need a way to sign in as the user.
// I'll assume we can use the anon key and see what public data is available, 
// or I need the user's access token which is hard to get here.
// Instead, I'll inspect the policies using SQL if I can, OR I'll just check the 'profiles' policy public access.

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    console.log("Checking public access to profiles...");
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

    if (error) {
        console.error("Error fetching profiles:", error);
    } else {
        console.log("Fetched profiles:", data?.length);
        if (data?.length > 0) console.log("Sample profile:", data[0]);
    }
}

async function checkListings() {
    console.log("Checking public access to listings...");
    const { data, error } = await supabase
        .from('listings')
        .select('*')
        .limit(5);

    if (error) {
        console.error("Error fetching listings:", error);
    } else {
        console.log("Fetched listings:", data?.length);
    }
}

async function run() {
    await checkProfiles();
    await checkListings();
}

run();

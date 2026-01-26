
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log("Checking listings schema...");
    const { data, error } = await supabase.from('listings').select('*').limit(1);

    if (error) {
        console.error("Error:", error);
    } else if (data && data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
        console.log("Has listing_images?", Object.keys(data[0]).includes('listing_images'));
    } else {
        console.log("No listings found.");
    }
}

main();

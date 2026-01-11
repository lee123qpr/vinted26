
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
    console.log("Checking Categories...");
    const { data: catData, error: catError } = await supabase.from('categories').select('id, name').limit(1);

    if (catError) {
        console.error('Category Error:', catError);
        return;
    }

    if (!catData || catData.length === 0) {
        console.log('No categories found.');
        return;
    }

    const firstCat = catData[0];
    console.log(`First Category: ${firstCat.name} (${firstCat.id})`);

    console.log("Checking Subcategories...");
    const { data: subData, error: subError } = await supabase
        .from('subcategories')
        .select('id, name')
        .eq('category_id', firstCat.id);

    if (subError) {
        console.error('Subcategory Error:', subError);
    } else {
        console.log(`Subcategories found: ${subData.length}`);
        if (subData.length > 0) {
            console.log('Sample Subcategory:', subData[0]);
        }
    }
}

checkCategories();

// scripts/fix_categories.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for inserts

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Fixing categories...');

    // 1. Get Building Materials ID
    const { data: bm, error: bmError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', 'building-materials')
        .single();

    if (bmError || !bm) {
        console.error('Building Materials not found!', bmError);
        return;
    }

    console.log('Found Building Materials:', bm.id);

    // 2. Add Insulation
    const { data: ins, error: insError } = await supabase
        .from('subcategories')
        .upsert({
            category_id: bm.id,
            name: 'Insulation',
            slug: 'insulation',
            sort_order: 20
        }, { onConflict: 'category_id, slug' })
        .select();

    if (insError) console.error('Error adding Insulation:', insError);
    else console.log('Added Insulation');

    // 3. Add Roofing
    const { data: roof, error: roofError } = await supabase
        .from('subcategories')
        .upsert({
            category_id: bm.id,
            name: 'Roofing',
            slug: 'roofing',
            sort_order: 21
        }, { onConflict: 'category_id, slug' })
        .select();

    if (roofError) console.error('Error adding Roofing:', roofError);
    else console.log('Added Roofing');

}

main();

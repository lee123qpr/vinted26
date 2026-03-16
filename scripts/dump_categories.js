const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function dumpCategories() {
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select(`
            id, name,
            subcategories (
                id, name, default_density_kg_per_m3, embodied_carbon_kg_per_kg, is_material_ambiguous
            )
        `)
        .order('name');
        
    if (catError) {
        console.error('Error:', catError);
        return;
    }
    
    fs.writeFileSync('category_dump.json', JSON.stringify(categories, null, 2));
    console.log('Categories dumped to category_dump.json');
}

dumpCategories();

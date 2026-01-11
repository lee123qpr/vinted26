const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCarbonCoverage() {
    console.log('--- Subcategories with Carbon Data ---');

    const { data: subs, error } = await supabase
        .from('subcategories')
        .select(`
      id, 
      name, 
      category:categories(name), 
      embodied_carbon_kg_per_kg, 
      default_density_kg_per_m3,
      is_material_ambiguous
    `)
        .order('category_id');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const supported = [];
    const unsupported = [];
    const ambiguous = [];

    subs.forEach(s => {
        const catName = s.category?.name || 'Unknown';
        const label = `${catName} > ${s.name}`;

        if (s.is_material_ambiguous) {
            ambiguous.push(label);
        } else if (s.embodied_carbon_kg_per_kg > 0) {
            supported.push({ label, factor: s.embodied_carbon_kg_per_kg });
        } else {
            unsupported.push(label);
        }
    });

    console.log(`\n✅ SUPPORTED (${supported.length}):`);
    supported.forEach(s => console.log(`  - ${s.label} (${s.factor} kgCO2e/kg)`));

    console.log(`\n⚠️  DEPENDS ON MATERIAL (${ambiguous.length}):`);
    console.log(`  (User selects material (e.g. Steel, Timber) which determines the value)`);
    ambiguous.forEach(s => console.log(`  - ${s.label}`));

    console.log(`\n❌ NO DATA (${unsupported.length}):`);
    unsupported.forEach(s => console.log(`  - ${s}`)); // Fixed: s is the string label here

}

checkCarbonCoverage();

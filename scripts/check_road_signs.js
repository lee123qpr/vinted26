const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkRoadSigns() {
    console.log('--- Inspeting "Road signs" Listing ---');

    const { data: listings, error } = await supabase
        .from('listings')
        .select(`
      id, 
      title, 
      carbon_saved_kg, 
      weight_kg, 
      dimensions_length_mm,
      dimensions_width_mm, 
      dimensions_height_mm,
      subcategory:subcategories (
        name,
        embodied_carbon_kg_per_kg
      )
    `)
        .ilike('title', '%Road signs%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (listings.length === 0) {
        console.log('No listing found matching "Road signs"');
    } else {
        listings.forEach(l => {
            console.log(`\nListing: ${l.title} (${l.id})`);
            console.log(`- Carbon Saved: ${l.carbon_saved_kg}`);
            console.log(`- Weight: ${l.weight_kg}`);
            console.log(`- Dims: ${l.dimensions_length_mm}x${l.dimensions_width_mm}x${l.dimensions_height_mm}`);
            if (l.subcategory) {
                console.log(`- Subcategory: ${l.subcategory.name}`);
                console.log(`- Carbon Factor: ${l.subcategory.embodied_carbon_kg_per_kg}`);
            } else {
                console.log(`- Subcategory: NULL`);
            }
        });
    }
}

checkRoadSigns();

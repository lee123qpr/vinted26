require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function applySeed() {
    console.log('1. Upserting Materials...');
    const materialsToUpsert = [
        { name: 'Timber (Softwood, eg. Pine, C16/C24)', slug: 'timber-softwood', density_kg_per_m3: 500, embodied_carbon_kg_per_kg: 0.45 },
        { name: 'Timber (Hardwood, eg. Oak)', slug: 'timber-hardwood', density_kg_per_m3: 700, embodied_carbon_kg_per_kg: 0.55 },
        { name: 'MDF (Medium Density Fibreboard)', slug: 'mdf', density_kg_per_m3: 750, embodied_carbon_kg_per_kg: 0.85 },
        { name: 'OSB (Oriented Strand Board)', slug: 'osb', density_kg_per_m3: 650, embodied_carbon_kg_per_kg: 0.70 },
        { name: 'Plywood', slug: 'plywood', density_kg_per_m3: 600, embodied_carbon_kg_per_kg: 0.80 },
        { name: 'Chipboard', slug: 'chipboard', density_kg_per_m3: 650, embodied_carbon_kg_per_kg: 0.75 },
        { name: 'PVC / UPVC', slug: 'pvc-upvc', density_kg_per_m3: 1400, embodied_carbon_kg_per_kg: 2.50 },
        { name: 'Composite / WPC', slug: 'composite', density_kg_per_m3: 1200, embodied_carbon_kg_per_kg: 1.80 },
        { name: 'Polycarbonate / Acrylic', slug: 'polycarbonate', density_kg_per_m3: 1200, embodied_carbon_kg_per_kg: 3.10 },
        { name: 'Aluminium (General)', slug: 'aluminium', density_kg_per_m3: 2700, embodied_carbon_kg_per_kg: 6.70 },
        { name: 'Steel (Galvanised)', slug: 'steel-galvanised', density_kg_per_m3: 7850, embodied_carbon_kg_per_kg: 1.70 },
        { name: 'Steel (Stainless)', slug: 'steel-stainless', density_kg_per_m3: 7850, embodied_carbon_kg_per_kg: 5.20 },
        { name: 'Steel (Carbon/Mild)', slug: 'steel', density_kg_per_m3: 7850, embodied_carbon_kg_per_kg: 1.55 },
        { name: 'Copper', slug: 'copper', density_kg_per_m3: 8960, embodied_carbon_kg_per_kg: 3.80 },
        { name: 'Brass', slug: 'brass', density_kg_per_m3: 8730, embodied_carbon_kg_per_kg: 3.00 },
        { name: 'Cast Iron', slug: 'cast-iron', density_kg_per_m3: 7200, embodied_carbon_kg_per_kg: 1.20 },
        { name: 'Glass', slug: 'glass', density_kg_per_m3: 2500, embodied_carbon_kg_per_kg: 0.90 },
        { name: 'Concrete (Pre-cast block)', slug: 'concrete-block', density_kg_per_m3: 2400, embodied_carbon_kg_per_kg: 0.12 },
        { name: 'Concrete (High Strength)', slug: 'concrete-dense', density_kg_per_m3: 2400, embodied_carbon_kg_per_kg: 0.15 },
        { name: 'Clay (Brick)', slug: 'clay-brick', density_kg_per_m3: 1900, embodied_carbon_kg_per_kg: 0.24 },
        { name: 'Porcelain / Ceramic', slug: 'porcelain-ceramic', density_kg_per_m3: 2400, embodied_carbon_kg_per_kg: 0.60 },
        { name: 'Sandstone / Natural Stone', slug: 'natural-stone', density_kg_per_m3: 2600, embodied_carbon_kg_per_kg: 0.08 }
    ];

    const { error: matError } = await supabase.from('materials').upsert(materialsToUpsert, { onConflict: 'slug' });
    if (matError) console.error('Material Error:', matError);

    console.log('2. Updating Subcategories with fixed values...');
    const fixedUpdates = [
        { slugs: ['bricks-blocks'], density: 1900, carbon: 0.24 },
        { slugs: ['building-aggregates', 'landscaping-aggregates'], density: 1600, carbon: 0.01 },
        { slugs: ['cement-products'], density: 1440, carbon: 0.86 },
        { slugs: ['floor-levelling-compounds'], density: 1400, carbon: 0.86 },
        { slugs: ['render'], density: 1600, carbon: 0.30 },
        { slugs: ['paint'], density: 1300, carbon: 2.10 },
        { slugs: [
            'builders-metalwork', 'structural-beams', 'hollow-sections', 'bars-angles', 'sheet-metal-mesh', 
            'hardware', 'security', 'screws', 'nails', 'heating', 'plumbing-tools', 'hand-tools', 'power-tool-accessories',
            'excavators', 'dumpers', 'access-equipment', 'lifting-handling', 'compaction', 'power-generation', 'mixers'
        ], density: 7850, carbon: 1.55 },
        { slugs: ['drainage', 'wastes-traps', 'ventilation'], density: 1400, carbon: 2.50 },
        { slugs: ['treated-timber', 'sawn-timber', 'cls-timber', 'planed-timber'], density: 500, carbon: 0.45 },
        { slugs: ['sleepers-wall-boards'], density: 600, carbon: 0.50 }
    ];

    for (const group of fixedUpdates) {
        const { error } = await supabase.from('subcategories')
            .update({ 
                default_density_kg_per_m3: group.density, 
                embodied_carbon_kg_per_kg: group.carbon,
                is_material_ambiguous: false
            })
            .in('slug', group.slugs);
        if (error) console.error(`Error updating fixed slugs ${group.slugs}:`, error);
    }

    console.log('3. Flagging Ambiguous Subcategories...');
    const ambiguousSlugs = [
        'lintels', 'cladding', 'sheet-materials', 'sheet-material-specifics', 'doors', 'windows', 'skirting', 
        'architrave', 'mouldings', 'window-boards', 'stair-parts', 'fencing', 'paving', 'decking', 'driveways', 
        'bathrooms', 'kitchens', 'self-assembly-kitchens', 'tiling', 'flooring', 'pipe-fittings', 'door-furniture'
    ];

    const { error: ambigError } = await supabase.from('subcategories')
        .update({
            is_material_ambiguous: true,
            default_density_kg_per_m3: null,
            embodied_carbon_kg_per_kg: null
        })
        .in('slug', ambiguousSlugs);
    if (ambigError) console.error('Ambiguous Error:', ambigError);

    console.log('Done!');
}

applySeed();

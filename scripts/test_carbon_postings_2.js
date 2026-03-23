require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: users } = await supabase.auth.admin.listUsers();
    if (!users || users.users.length === 0) return;
    const seller_id = users.users[0].id;
    
    // Try to fetch valid data dynamically to avoid missing slug bugs
    const { data: subs } = await supabase.from('subcategories').select('*').not('default_density_kg_per_m3', 'is', null).limit(5);
    const { data: ambigSubs } = await supabase.from('subcategories').select('*').eq('is_material_ambiguous', true).limit(3);
    const { data: mats } = await supabase.from('materials').select('*').not('density_kg_per_m3', 'is', null).limit(5);

    let scenarios = [];
    
    // 5 Solid Items
    for (let i = 0; i < (subs ? subs.length : 0); i++) {
        scenarios.push({
            name: `Volumetric Test: ${subs[i].name}`,
            sub_id: subs[i].id,
            cat_id: subs[i].category_id,
            l: 1000, w: 500, h: 50, q: 2,
            mat_id: null
        });
    }

    // 3 Ambiguous Items
    for (let i = 0; i < (ambigSubs ? ambigSubs.length : 0); i++) {
        const mat = mats[i % mats.length];
        scenarios.push({
            name: `Ambiguous: ${ambigSubs[i].name} (${mat.name})`,
            sub_id: ambigSubs[i].id,
            cat_id: ambigSubs[i].category_id,
            l: 2000, w: 1000, h: 50, q: 1,
            mat_id: mat.id
        });
    }

    // 2 Manual Weight
    if (subs && subs.length >= 2) {
        scenarios.push({
            name: `Manual Weight Test 1 (${subs[0].name})`,
            sub_id: subs[0].id, cat_id: subs[0].category_id,
            manualWeight: 500, q: 1, mat_id: null
        });
        scenarios.push({
            name: `Manual Weight Test 2 (${subs[1].name})`,
            sub_id: subs[1].id, cat_id: subs[1].category_id,
            manualWeight: 25.5, q: 10, mat_id: null
        });
    }

    let results = [];

    for (const test of scenarios) {
        let sub = null;
        if(test.sub_id) {
           const {data} = await supabase.from('subcategories').select('*').eq('id', test.sub_id).single();
           sub = data;
        }
        let mat = null;
        if (test.mat_id) {
           const {data} = await supabase.from('materials').select('*').eq('id', test.mat_id).single();
           mat = data;
        }

        let density = sub ? sub.default_density_kg_per_m3 : null;
        let carbonFactor = sub ? sub.embodied_carbon_kg_per_kg : null;

        if (sub && sub.is_material_ambiguous && mat) {
            density = mat.density_kg_per_m3;
            if (mat.embodied_carbon_kg_per_kg) carbonFactor = mat.embodied_carbon_kg_per_kg;
        }

        let calcWeight = null;
        let carbonSaved = null;

        if (test.manualWeight) {
            calcWeight = test.manualWeight * test.q;
            if (carbonFactor) carbonSaved = calcWeight * carbonFactor;
        } else if (test.l && test.w && test.h && density) {
            let volumeM3 = (test.l/1000) * (test.w/1000) * (test.h/1000);
            calcWeight = volumeM3 * test.q * density;
            if (carbonFactor) carbonSaved = calcWeight * carbonFactor;
        }

        // Insert
        await supabase.from('listings').insert({
            seller_id: seller_id,
            category_id: test.cat_id,
            subcategory_id: test.sub_id,
            listing_material_id: test.mat_id,
            title: test.name,
            description: `Auto-generated test.`,
            condition: 'good',
            price_gbp: 10,
            quantity_available: test.q,
            dimensions_length_mm: test.l || null, dimensions_width_mm: test.w || null, dimensions_height_mm: test.h || null,
            weight_kg: test.manualWeight || calcWeight,
            calculated_weight_kg: calcWeight,
            carbon_saved_kg: carbonSaved,
            include_carbon_certificate: !!carbonSaved,
            postcode_area: 'TEST',
            status: 'active'
        });

        results.push({
            Item: test.name,
            Weight: calcWeight ? calcWeight.toFixed(2) : "0",
            Carbon: carbonSaved ? carbonSaved.toFixed(2) : "0"
        });
    }

    let md = "# Refined Carbon Calculation Test Results\n\n";
    md += "| Item | Calculated Weight (kg) | Carbon Saved (kg CO2e) |\n";
    md += "|------|------------------------|-------------------|\n";
    for(const r of results) {
        md += `| ${r.Item} | ${r.Weight} | ${r.Carbon} |\n`;
    }
    fs.writeFileSync('C:/Users/Lee Kilcoyne/.gemini/antigravity/brain/4a99d5bd-2188-4e3d-8434-1548a07c782a/test_results.md', md);
}
run();

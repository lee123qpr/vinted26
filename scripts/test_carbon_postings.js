require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: users } = await supabase.auth.admin.listUsers();
    if (!users || users.users.length === 0) { console.log('No users found'); return; }
    const seller_id = users.users[0].id;
    console.log('Using seller_id:', seller_id);
    
    const { data: subs } = await supabase.from('subcategories').select('*');
    const { data: mats } = await supabase.from('materials').select('*');
    const { data: cats } = await supabase.from('categories').select('*');
    
    const scenarios = [
      { name: "50x Red Bricks (Volumetric)", categorySlug: "building-materials", subSlug: "bricks-blocks", l: 215, w: 102.5, h: 65, q: 50 },
      { name: "Solid Wood Door (Ambiguous - Timber)", categorySlug: "timber-joinery", subSlug: "doors-windows", l: 1981, w: 838, h: 44, q: 1, matSlug: "timber-softwood" },
      { name: "UPVC Window (Ambiguous - PVC)", categorySlug: "timber-joinery", subSlug: "doors-windows", l: 1200, w: 1200, h: 70, q: 1, matSlug: "pvc-plastic" },
      { name: "Steel RSJ Beam", categorySlug: "building-materials", subSlug: "builders-metalwork", l: 3000, w: 152, h: 152, q: 1 },
      { name: "1 Tonne Sand (Manual Weight)", categorySlug: "building-materials", subSlug: "building-aggregates", manualWeight: 1000, q: 1 },
      { name: "Plasterboard 2400x1200x12", categorySlug: "building-materials", subSlug: "plaster-plasterboard", l: 2400, w: 1200, h: 12.5, q: 10 },
      { name: "Concrete Blocks", categorySlug: "building-materials", subSlug: "bricks-blocks", l: 440, w: 215, h: 100, q: 100 },
      { name: "Timber Joists", categorySlug: "timber-joinery", subSlug: "timber-joinery", l: 4800, w: 150, h: 47, q: 20 },
      { name: "Copper Piping (Manual Weight)", categorySlug: "plumbing-heating", subSlug: "pipework-fittings", manualWeight: 5, q: 1 },
      { name: "Aluminum Frame (Ambiguous)", categorySlug: "timber-joinery", subSlug: "doors-windows", l: 1000, w: 1000, h: 50, q: 2, matSlug: "aluminium" }
    ];

    let results = [];

    for (const test of scenarios) {
        let cat = cats.find(c => c.slug === test.categorySlug);
        let sub = subs.find(s => s.slug === test.subSlug);
        let mat = test.matSlug ? mats.find(m => m.slug === test.matSlug) : null;

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
            let totalVolume = volumeM3 * test.q;
            calcWeight = totalVolume * density;
            if (carbonFactor) carbonSaved = calcWeight * carbonFactor;
        }

        const { data: listing, error } = await supabase.from('listings').insert({
            seller_id: seller_id,
            category_id: cat ? cat.id : null,
            subcategory_id: sub ? sub.id : null,
            listing_material_id: mat ? mat.id : null,
            title: `TEST: ${test.name}`,
            description: `Automated test listing for carbon calculation.`,
            condition: 'good',
            price_gbp: 10,
            quantity_available: test.q,
            dimensions_length_mm: test.l || null,
            dimensions_width_mm: test.w || null,
            dimensions_height_mm: test.h || null,
            weight_kg: test.manualWeight || calcWeight,
            calculated_weight_kg: calcWeight,
            carbon_saved_kg: carbonSaved,
            include_carbon_certificate: !!carbonSaved,
            postcode_area: 'TEST',
            status: 'active'
        }).select();
        
        if (error) { console.error('Insert error for', test.name, error); } else {
            console.log(`Success: ${test.name} -> Weight: ${calcWeight?.toFixed(2)} kg, Carbon: ${carbonSaved?.toFixed(2)} kg`);
            results.push({
               Name: test.name,
               Weight: calcWeight ? calcWeight.toFixed(2) : "0",
               Carbon: carbonSaved ? carbonSaved.toFixed(2) : "0"
            });
        }
    }
    
    let md = "# Carbon Calculation Benchmark Test Results\n\n";
    md += "We successfully inserted 10 test items into the database and computed their carbon offsets using the ListingForm engine logic.\n\n";
    md += "| Item | Qty | Dims (mm) / Manual | Calculated Weight (kg) | Carbon Saved (kg CO2e) |\n";
    md += "|------|-----|--------------------|------------------------|-------------------|\n";
    for(const test of scenarios) {
        let weight = results.find(r => r.Name === test.name)?.Weight || "Error";
        let carbon = results.find(r => r.Name === test.name)?.Carbon || "Error";
        let dims = test.manualWeight ? `Manual: ${test.manualWeight}kg` : `${test.l}x${test.w}x${test.h}`;
        md += `| ${test.name} | ${test.q} | ${dims} | ${weight} | ${carbon} |\n`;
    }
    const fs = require('fs');
    fs.writeFileSync('C:/Users/Lee Kilcoyne/.gemini/antigravity/brain/4a99d5bd-2188-4e3d-8434-1548a07c782a/test_results.md', md);
    console.log("Results generated at C:/Users/Lee Kilcoyne/.gemini/antigravity/brain/4a99d5bd-2188-4e3d-8434-1548a07c782a/test_results.md");
}
run();

const fs = require('fs');

const data = JSON.parse(fs.readFileSync('category_dump.json', 'utf8'));

let md = '# Category & Carbon Calculation Analysis\\n\\n';

let fullyAutomated = 0;
let ambiguous = 0;
let missingValues = 0;
let totalSubcats = 0;

md += '## Status Breakdown\\n\\n';
md += '| Category | Subcategories | 🟢 Auto (Fixed Density) | 🟡 Ambiguous (Asks Material) | 🔴 Missing Data (Falls back to Manual) |\\n';
md += '|----------|---------------|-------------------------|------------------------------|---------------------------------------|\\n';

data.forEach(cat => {
    let catTotal = cat.subcategories.length;
    let catAuto = 0;
    let catAmb = 0;
    let catMiss = 0;
    
    cat.subcategories.forEach(sub => {
        totalSubcats++;
        if (sub.default_density_kg_per_m3 !== null) {
            catAuto++;
            fullyAutomated++;
        } else if (sub.is_material_ambiguous) {
            catAmb++;
            ambiguous++;
        } else {
            catMiss++;
            missingValues++;
        }
    });

    md += `| **${cat.name}** | ${catTotal} | ${catAuto} | ${catAmb} | ${catMiss} |\\n`;
});

md += '\\n## Summary & Recommendations\\n\\n';
md += `- **Total Subcategories:** ${totalSubcats}\\n`;
md += `- **🟢 Fully Automated (Fixed Density):** ${fullyAutomated} (${((fullyAutomated/totalSubcats)*100).toFixed(1)}%)\\n`;
md += `- **🟡 Ambiguous Material Assumes:** ${ambiguous} (${((ambiguous/totalSubcats)*100).toFixed(1)}%)\\n`;
md += `- **🔴 Missing Data:** ${missingValues} (${((missingValues/totalSubcats)*100).toFixed(1)}%)\\n\\n`;

md += `### Areas for Improvement\\n`;
md += `1. **Review Ambiguous Items**: While asking the user "What is this made of" works perfectly, ensuring the dropdown has a comprehensive list of materials (Fibreglass, MDF, OSB, etc.) is crucial.\\n`;
md += `2. **Hard-to-Calculate Items**: Items like 'Toilets', 'Sinks', or 'Boilers' have very complex shapes. Calculating weight via bounding-box dimensions (L x W x H) almost always heavily overestimates their weight, because they aren't solid blocks. For highly irregular items, we should consider either:\\n`;
md += `   - **Standardized Weights**: e.g., a standard toilet weighs ~30kg, bypass dimensions.\\n`;
md += `   - **Forcing Manual Weight**: Asking the user directly may actually be more accurate for these.\\n`;

md += '\\n## Detailed Subcategory Breakdown\\n\\n';

data.forEach(cat => {
    md += `### ${cat.name}\\n`;
    md += '| Subcategory | Calculation Type | Density (kg/m³) | Carbon (kg CO2/kg) |\\n';
    md += '|-------------|------------------|-----------------|--------------------|\\n';
    
    cat.subcategories.forEach(sub => {
        let type = '🔴 Missing';
        if (sub.default_density_kg_per_m3 !== null) type = '🟢 Fixed Density';
        else if (sub.is_material_ambiguous) type = '🟡 Ambiguous (Dropdown)';
        
        md += `| ${sub.name} | ${type} | ${sub.default_density_kg_per_m3 || 'N/A'} | ${sub.embodied_carbon_kg_per_kg || 'N/A'} |\\n`;
    });
    md += '\\n';
});

fs.writeFileSync('category_analysis.md', md);
console.log('Analysis generated successfully.');

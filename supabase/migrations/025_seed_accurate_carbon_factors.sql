-- 025_seed_accurate_carbon_factors.sql
-- Injects realistic densities (kg/m3) and embodied carbon values (kg CO2e / kg)
-- Sourced from the Circular Ecology ICE (Inventory of Carbon and Energy) Database (UK standard)

-- 1. Ensure `materials` are completely populated with key variants
INSERT INTO materials (name, slug, density_kg_per_m3, embodied_carbon_kg_per_kg) 
VALUES 
    -- Timber & Wood Products (A1-A3 embodied carbon, excluding sequestered to avoid negative confusion)
    ('Timber (Softwood, eg. Pine, C16/C24)', 'timber-softwood', 500, 0.45),
    ('Timber (Hardwood, eg. Oak)', 'timber-hardwood', 700, 0.55),
    ('MDF (Medium Density Fibreboard)', 'mdf', 750, 0.85),
    ('OSB (Oriented Strand Board)', 'osb', 650, 0.70),
    ('Plywood', 'plywood', 600, 0.80),
    ('Chipboard', 'chipboard', 650, 0.75),
    
    -- Plastics & Polymers
    ('PVC / UPVC', 'pvc-upvc', 1400, 2.50),
    ('Composite / WPC', 'composite', 1200, 1.80),
    ('Polycarbonate / Acrylic', 'polycarbonate', 1200, 3.10),
    
    -- Metals
    ('Aluminium (General)', 'aluminium', 2700, 6.70),
    ('Steel (Galvanised)', 'steel-galvanised', 7850, 1.70),
    ('Steel (Stainless)', 'steel-stainless', 7850, 5.20),
    ('Steel (Carbon/Mild)', 'steel', 7850, 1.55),
    ('Copper', 'copper', 8960, 3.80),
    ('Brass', 'brass', 8730, 3.00),
    ('Cast Iron', 'cast-iron', 7200, 1.20),
    
    -- Minerals, Stone & Ceramics
    ('Glass', 'glass', 2500, 0.90),
    ('Concrete (Pre-cast block)', 'concrete-block', 2400, 0.12),
    ('Concrete (High Strength)', 'concrete-dense', 2400, 0.15),
    ('Clay (Brick)', 'clay-brick', 1900, 0.24),
    ('Porcelain / Ceramic', 'porcelain-ceramic', 2400, 0.60),
    ('Sandstone / Natural Stone', 'natural-stone', 2600, 0.08)
ON CONFLICT (slug) DO UPDATE 
SET density_kg_per_m3 = excluded.density_kg_per_m3,
    embodied_carbon_kg_per_kg = excluded.embodied_carbon_kg_per_kg;

-- 2. Bulk apply unambiguous subcategory densities & carbon factors (Where material is obvious)
UPDATE subcategories SET default_density_kg_per_m3 = 1900, embodied_carbon_kg_per_kg = 0.24, is_material_ambiguous = FALSE WHERE slug IN ('bricks-blocks');
UPDATE subcategories SET default_density_kg_per_m3 = 1600, embodied_carbon_kg_per_kg = 0.01, is_material_ambiguous = FALSE WHERE slug IN ('building-aggregates', 'landscaping-aggregates');
UPDATE subcategories SET default_density_kg_per_m3 = 1440, embodied_carbon_kg_per_kg = 0.86, is_material_ambiguous = FALSE WHERE slug IN ('cement-products');
UPDATE subcategories SET default_density_kg_per_m3 = 1400, embodied_carbon_kg_per_kg = 0.86, is_material_ambiguous = FALSE WHERE slug IN ('floor-levelling-compounds');
UPDATE subcategories SET default_density_kg_per_m3 = 1600, embodied_carbon_kg_per_kg = 0.30, is_material_ambiguous = FALSE WHERE slug IN ('render');
UPDATE subcategories SET default_density_kg_per_m3 = 1300, embodied_carbon_kg_per_kg = 2.10, is_material_ambiguous = FALSE WHERE slug IN ('paint');
UPDATE subcategories SET default_density_kg_per_m3 = 7850, embodied_carbon_kg_per_kg = 1.55, is_material_ambiguous = FALSE WHERE slug IN (
    'builders-metalwork', 'structural-beams', 'hollow-sections', 'bars-angles', 'sheet-metal-mesh', 
    'hardware', 'security', 'screws', 'nails', 'heating', 'plumbing-tools', 'hand-tools', 'power-tool-accessories',
    'excavators', 'dumpers', 'access-equipment', 'lifting-handling', 'compaction', 'power-generation', 'mixers'
);
UPDATE subcategories SET default_density_kg_per_m3 = 1400, embodied_carbon_kg_per_kg = 2.50, is_material_ambiguous = FALSE WHERE slug IN (
    'drainage', 'wastes-traps', 'ventilation'
);
UPDATE subcategories SET default_density_kg_per_m3 = 500, embodied_carbon_kg_per_kg = 0.45, is_material_ambiguous = FALSE WHERE slug IN (
    'treated-timber', 'sawn-timber', 'cls-timber', 'planed-timber'
);
UPDATE subcategories SET default_density_kg_per_m3 = 600, embodied_carbon_kg_per_kg = 0.50, is_material_ambiguous = FALSE WHERE slug IN ('sleepers-wall-boards');

-- 3. Flag ambiguous subcategories (Forces UI material dropdown for precise carbon math)
UPDATE subcategories SET is_material_ambiguous = TRUE, default_density_kg_per_m3 = NULL, embodied_carbon_kg_per_kg = NULL WHERE slug IN (
    'lintels', -- Concrete vs Steel
    'cladding', -- PVC vs Timber vs Composite
    'sheet-materials', -- OSB vs Plywood vs MDF
    'sheet-material-specifics',
    'doors', -- Wood vs PVC vs Alum
    'windows',
    'skirting', -- MDF vs Pine
    'architrave',
    'mouldings',
    'window-boards',
    'stair-parts',
    'fencing', -- Timber vs Metal
    'paving', -- Concrete vs Stone vs Porcelain
    'decking', -- Timber vs Composite
    'driveways',
    'bathrooms', -- Acrylic vs Ceramic vs Steel
    'kitchens',
    'self-assembly-kitchens',
    'tiling',
    'flooring', -- LVT vs Laminate vs Wood
    'pipe-fittings', -- Copper vs Plastic
    'door-furniture' -- Steel vs Brass vs Plastic
);

-- Migration to update embodied carbon factors based on ICE Database v3
-- Values are in kgCO2e per kg of material

-- 1. Bricks, Blocks, Stone, Aggregates (Default: ~0.24 for general stone/brick)
UPDATE subcategories SET embodied_carbon_kg_per_kg = 0.24 
WHERE slug IN ('bricks-blocks', 'engineering-facing-bricks', 'cavity-liners-air-bricks', 'building-aggregates', 'ballast', 'jumbo-bags', 'stone-gravel', 'landscaping', 'paving-walling', 'block-paving', 'paving-slabs');

-- 2. Concrete & Cement (~0.08 - 0.13)
UPDATE subcategories SET embodied_carbon_kg_per_kg = 0.12
WHERE slug IN ('concrete-blocks', 'cement-products', 'cement', 'readymix-concrete', 'lintels', 'concrete-lintels', 'padstones');

UPDATE subcategories SET embodied_carbon_kg_per_kg = 0.08
WHERE slug IN ('sand', 'building-sand', 'sharp-sand');

-- 3. Timber & Joinery (~0.45)
UPDATE subcategories SET embodied_carbon_kg_per_kg = 0.45
WHERE slug IN ('timber-joinery', 'timber', 'sheet-materials', 'mdf-sheets', 'plywood-sheets', 'chipboard-sheets', 'cladding', 'fencing-trellis', 'doors-windows', 'internal-doors', 'external-doors', 'decking');

-- 4. Plasterboard (~0.39)
UPDATE subcategories SET embodied_carbon_kg_per_kg = 0.39
WHERE slug IN ('plaster-plasterboard', 'standard-plasterboard', 'moisture-resistant-plasterboard', 'fire-resistant-plasterboard', 'insulated-plasterboard');

-- 5. Insulation (~1.86 for chemical based, lower for wool but taking a safe average)
UPDATE subcategories SET embodied_carbon_kg_per_kg = 1.86
WHERE slug IN ('insulation', 'loft-insulation', 'cavity-insulation', 'acoustic-insulation', 'floor-insulation');

-- 6. Metals / Steel (~1.55 - 2.8, using lower conservative for mixed steel)
UPDATE subcategories SET embodied_carbon_kg_per_kg = 1.55
WHERE slug IN ('builders-metalwork', 'metalwork-fabrication', 'structural-beams', 'hollow-sections', 'bars-angles', 'sheet-metal-mesh', 'steel-lintels', 'fixings-fasteners', 'nails-screws', 'bolts-nuts');

-- 7. Plastics / PVC (~2.50)
UPDATE subcategories SET embodied_carbon_kg_per_kg = 2.50
WHERE slug IN ('guttering-drainage', 'underground-drainage', 'soil-vent', 'waste-traps');

-- 8. Glass / Windows (~0.90)
UPDATE subcategories SET embodied_carbon_kg_per_kg = 0.90
WHERE slug IN ('roof-windows', 'glazing');

-- 9. Roofing (Tiles: ~0.27, Felt: ~1.9)
UPDATE subcategories SET embodied_carbon_kg_per_kg = 0.27
WHERE slug IN ('roofing-ventilation', 'pitched-roofing', 'roof-tiles-slates');
UPDATE subcategories SET embodied_carbon_kg_per_kg = 1.90
WHERE slug IN ('flat-roofing', 'roof-felts');

-- Set a default fallout for anything missed to a conservative 0.5
UPDATE subcategories SET embodied_carbon_kg_per_kg = 0.5 
WHERE embodied_carbon_kg_per_kg IS NULL;

-- Add the column with a default of true
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS is_volumetric_calculation_valid BOOLEAN DEFAULT true;

-- Update specific subcategories where volumetric math makes no sense (e.g. they are hollow/complex shapes)

-- Bathrooms / Sinks / Toilets
UPDATE subcategories SET is_volumetric_calculation_valid = false WHERE slug IN ('bathrooms', 'kitchens');

-- Plant & Equipment (Excavators etc are mostly empty space / complex)
UPDATE subcategories SET is_volumetric_calculation_valid = false WHERE category_id IN (
    SELECT id FROM categories WHERE slug = 'plant-equipment'
);

-- Windows (mostly glass/air)
UPDATE subcategories SET is_volumetric_calculation_valid = false WHERE slug IN ('windows');

-- Electrical & Lighting
UPDATE subcategories SET is_volumetric_calculation_valid = false WHERE category_id IN (
    SELECT id FROM categories WHERE slug = 'electrical-lighting'
);

-- Security & Ironmongery (Locks, handles etc)
UPDATE subcategories SET is_volumetric_calculation_valid = false WHERE category_id IN (
    SELECT id FROM categories WHERE slug = 'security-ironmongery'
);

-- Tools, Equipment
UPDATE subcategories SET is_volumetric_calculation_valid = false WHERE category_id IN (
    SELECT id FROM categories WHERE slug = 'tools-equipment-workwear'
);

-- Site Setup (Cabins, toilets etc)
UPDATE subcategories SET is_volumetric_calculation_valid = false WHERE category_id IN (
    SELECT id FROM categories WHERE slug = 'site-setup'
);

-- Plumbing and Heating (Boilers, pipes)
UPDATE subcategories SET is_volumetric_calculation_valid = false WHERE category_id IN (
    SELECT id FROM categories WHERE slug = 'plumbing-heating'
);

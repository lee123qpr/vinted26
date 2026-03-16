-- 1. Create the new Materials if they don't exist
INSERT INTO materials (name, slug, density_kg_per_m3, embodied_carbon_kg_per_kg) VALUES
('MDF', 'mdf', 700, 0.45),
('Plywood', 'plywood', 650, 0.45),
('OSB', 'osb', 650, 0.45),
('Chipboard', 'chipboard', 650, 0.45),
('Copper', 'copper', 8960, 2.5),
('Brass', 'brass', 8500, 2.3),
('Iron', 'iron', 7850, 1.5),
('Fibreglass', 'fibreglass', 1500, 2.0),
('Plasterboard', 'plasterboard', 800, 0.1),
('Ceramic / Porcelain', 'ceramic', 2400, 0.5),
('Laminate', 'laminate', 400, 0.5),
('Vinyl', 'vinyl', 1500, 2.5),
('Stone', 'stone', 2600, 0.1),
('Sand / Aggregates', 'sand', 1600, 0.1),
('Cement', 'cement', 1440, 0.9),
('Soil / Dirt', 'soil', 1200, 0.05),
('Gravel', 'gravel', 1680, 0.1),
('Nylon (Plastic)', 'nylon', 1150, 3.0),
('Zinc', 'zinc', 7140, 2.0),
('Paint (Liquid)', 'paint', 1300, 2.0),
('Rubber', 'rubber', 1522, 2.5),
('Cotton', 'cotton', 100, 1.5),
('Polyester', 'polyester', 100, 2.5)
ON CONFLICT (slug) DO UPDATE SET 
  density_kg_per_m3 = EXCLUDED.density_kg_per_m3,
  embodied_carbon_kg_per_kg = EXCLUDED.embodied_carbon_kg_per_kg;

-- 2. Create the mapping table
CREATE TABLE IF NOT EXISTS category_materials (
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (category_id, material_id)
);

-- Enable RLS
ALTER TABLE category_materials ENABLE ROW LEVEL SECURITY;

-- Allow public read access to category_materials
CREATE POLICY "Allow public read access to category_materials" 
    ON category_materials FOR SELECT 
    USING (true);

-- 3. Seed the mapping data

-- Helper function to make seeding easier
CREATE OR REPLACE FUNCTION map_category_materials(cat_slug TEXT, mat_slugs TEXT[])
RETURNS void AS $$
DECLARE
    c_id UUID;
    m_slug TEXT;
    m_id UUID;
BEGIN
    SELECT id INTO c_id FROM categories WHERE slug = cat_slug;
    IF c_id IS NOT NULL THEN
        FOREACH m_slug IN ARRAY mat_slugs
        LOOP
            SELECT id INTO m_id FROM materials WHERE slug = m_slug;
            IF m_id IS NOT NULL THEN
                INSERT INTO category_materials (category_id, material_id) 
                VALUES (c_id, m_id)
                ON CONFLICT (category_id, material_id) DO NOTHING;
            END IF;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Building Materials
SELECT map_category_materials('building-materials', ARRAY['concrete', 'clay-brick', 'cement', 'sand', 'steel', 'aluminium', 'glass', 'fibreglass', 'plasterboard']);

-- Timber & Joinery
SELECT map_category_materials('timber-joinery', ARRAY['timber-softwood', 'timber-hardwood', 'mdf', 'plywood', 'osb', 'chipboard']);

-- Plumbing & Heating
SELECT map_category_materials('plumbing-heating', ARRAY['copper', 'pvc-plastic', 'brass', 'steel', 'iron']);

-- Metalwork & Fabrication
SELECT map_category_materials('metalwork-fabrication', ARRAY['steel', 'aluminium', 'iron', 'brass', 'copper']);

-- Electrical & Lighting
SELECT map_category_materials('electrical-lighting', ARRAY['copper', 'pvc-plastic', 'steel', 'aluminium', 'glass']);

-- Flooring & Tiling
SELECT map_category_materials('flooring-tiling', ARRAY['ceramic', 'timber-hardwood', 'timber-softwood', 'laminate', 'vinyl', 'stone', 'mdf']);

-- Kitchens & Bathrooms
SELECT map_category_materials('kitchens-bathrooms', ARRAY['ceramic', 'steel', 'brass', 'copper', 'pvc-plastic', 'mdf', 'timber-hardwood', 'glass']);

-- Fixings & Adhesives
SELECT map_category_materials('fixings-adhesives', ARRAY['steel', 'nylon', 'brass', 'zinc']);

-- Landscaping & Fencing
SELECT map_category_materials('landscaping-fencing', ARRAY['timber-softwood', 'timber-hardwood', 'concrete', 'soil', 'gravel', 'steel']);

-- Site Setup
SELECT map_category_materials('site-setup', ARRAY['steel', 'pvc-plastic', 'timber-softwood']);

-- Security & Ironmongery
SELECT map_category_materials('security-ironmongery', ARRAY['steel', 'brass', 'iron', 'aluminium']);

-- Plant & Equipment
SELECT map_category_materials('plant-equipment', ARRAY['steel', 'iron', 'pvc-plastic', 'aluminium']);

-- Painting & Decorating
SELECT map_category_materials('painting-decorating', ARRAY['paint', 'pvc-plastic', 'timber-softwood']);

-- Tools, Equipment & Workwear
SELECT map_category_materials('tools-equipment-workwear', ARRAY['steel', 'pvc-plastic', 'rubber', 'cotton', 'polyester']);

-- Clean up helper function
DROP FUNCTION map_category_materials(TEXT, TEXT[]);

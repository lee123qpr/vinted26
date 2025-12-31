-- 1. Create Materials Table for Ambiguous Items
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    density_kg_per_m3 NUMERIC NOT NULL,     -- e.g. Timber ~500, PVC ~1400
    embodied_carbon_kg_per_kg NUMERIC,      -- Specific factor if different from subcategory (optional override)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for materials
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Materials are viewable by everyone" ON materials FOR SELECT USING (true);

-- 2. Update Subcategories
-- Add default_density for items that are clearly one material (e.g. Bricks)
-- Add is_material_ambiguous flag to trigger the "What is this made of?" dropdown
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subcategories' AND column_name = 'default_density_kg_per_m3') THEN
        ALTER TABLE subcategories ADD COLUMN default_density_kg_per_m3 NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subcategories' AND column_name = 'is_material_ambiguous') THEN
        ALTER TABLE subcategories ADD COLUMN is_material_ambiguous BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Update Listings
-- Store the calculated weight and selected material so certificates are accurate later
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'listing_material_id') THEN
        ALTER TABLE listings ADD COLUMN listing_material_id UUID REFERENCES materials(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'calculated_weight_kg') THEN
        ALTER TABLE listings ADD COLUMN calculated_weight_kg NUMERIC;
    END IF;
    
    -- Add dimensions_unit just in case we support mm/m later (default cm coverage)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'dimensions_unit') THEN
        ALTER TABLE listings ADD COLUMN dimensions_unit TEXT DEFAULT 'cm';
    END IF;
END $$;

-- 4. Seed Data: Materials
INSERT INTO materials (name, slug, density_kg_per_m3, embodied_carbon_kg_per_kg) 
VALUES 
    ('Timber (Softwood)', 'timber-softwood', 500, 0.45),
    ('Timber (Hardwood)', 'timber-hardwood', 700, 0.55),
    ('PVC / Plastic', 'pvc-plastic', 1400, 2.50),
    ('Aluminium', 'aluminium', 2700, 6.70),
    ('Steel', 'steel', 7850, 1.55),
    ('Glass', 'glass', 2500, 0.90),
    ('Concrete', 'concrete', 2400, 0.12),
    ('Clay (Brick)', 'clay-brick', 1900, 0.24)
ON CONFLICT (slug) DO UPDATE 
SET density_kg_per_m3 = excluded.density_kg_per_m3;


-- 5. Seed Data: Subcategory Densities (The "Obvious" Ones)
-- Timber Subcategory -> 500
UPDATE subcategories SET default_density_kg_per_m3 = 500 WHERE slug IN ('timber', 'timber-joinery');

-- Bricks -> 1900
UPDATE subcategories SET default_density_kg_per_m3 = 1900 WHERE slug IN ('bricks-blocks');

-- Steel -> 7850
UPDATE subcategories SET default_density_kg_per_m3 = 7850 WHERE slug IN ('builders-metalwork');

-- Aggregates -> 1600 (Sand/Gravel average)
UPDATE subcategories SET default_density_kg_per_m3 = 1600 WHERE slug IN ('building-aggregates');

-- Plasterboard -> 800
UPDATE subcategories SET default_density_kg_per_m3 = 800 WHERE slug IN ('plaster-plasterboard');

-- 6. Flag Ambiguous Items
-- Windows, Doors, etc could be Wood, PVC, or Alum.
UPDATE subcategories SET is_material_ambiguous = TRUE 
WHERE slug IN ('doors-windows', 'roof-windows', 'guttering-drainage', 'fencing-trellis', 'decking');

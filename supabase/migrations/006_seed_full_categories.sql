-- Seed data for Skipped Construction Materials Marketplace
-- Full Selco-based taxonomy + Miscellaneous
-- Replaces previous seeds
-- Source: Scraped from selcobw.com on 2025-12-29

TRUNCATE TABLE categories CASCADE;

-- 1. Building Materials
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Building Materials', 'building-materials', '🧱', 1);
DO $$ 
DECLARE cat_id UUID; 
BEGIN 
  SELECT id INTO cat_id FROM categories WHERE slug = 'building-materials';
  INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  (cat_id, 'Bricks & Blocks', 'bricks-blocks', 1),
  (cat_id, 'Building Aggregates', 'building-aggregates', 2),
  (cat_id, 'Cement Products', 'cement-products', 3),
  (cat_id, 'Floor Levelling Compounds', 'floor-levelling-compounds', 4),
  (cat_id, 'Weather & Waterproofing', 'weather-waterproofing', 5),
  (cat_id, 'Builders Metalwork', 'builders-metalwork', 6),
  (cat_id, 'Building Sealants', 'building-sealants', 7),
  (cat_id, 'Render', 'render', 8),
  (cat_id, 'Lintels', 'lintels', 9),
  (cat_id, 'Sealants & Adhesives', 'sealants-adhesives', 10),
  (cat_id, 'Cladding', 'cladding', 11);
END $$;

-- 2. Timber & Joinery
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Timber & Joinery', 'timber-joinery', '🪵', 2);
DO $$ 
DECLARE cat_id UUID; 
BEGIN 
  SELECT id INTO cat_id FROM categories WHERE slug = 'timber-joinery';
  INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  (cat_id, 'Treated Timber', 'treated-timber', 1),
  (cat_id, 'Sheet Materials', 'sheet-materials', 2),
  (cat_id, 'Sawn Timber', 'sawn-timber', 3),
  (cat_id, 'Window Boards', 'window-boards', 4),
  (cat_id, 'CLS Timber', 'cls-timber', 5),
  (cat_id, 'Planed Timber', 'planed-timber', 6),
  (cat_id, 'Melamine Faced Chipboard', 'melamine-faced-chipboard', 7),
  (cat_id, 'Skirting', 'skirting', 8),
  (cat_id, 'Architrave', 'architrave', 9),
  (cat_id, 'Laminated Timber Boards', 'laminated-timber-boards', 10),
  (cat_id, 'Timber Cladding', 'timber-cladding', 11),
  (cat_id, 'Floorboards', 'floorboards', 12),
  (cat_id, 'Wall Panelling', 'wall-panelling', 13),
  (cat_id, 'Mouldings', 'mouldings', 14),
  (cat_id, 'Doors', 'doors', 15),
  (cat_id, 'Roof Windows', 'roof-windows', 16),
  (cat_id, 'uPVC Windows', 'upvc-windows', 17),
  (cat_id, 'Stair Parts', 'stair-parts', 18);
END $$;

-- 3. Landscaping & Fencing
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Landscaping & Fencing', 'landscaping-fencing', '🏡', 3);
DO $$ 
DECLARE cat_id UUID; 
BEGIN 
  SELECT id INTO cat_id FROM categories WHERE slug = 'landscaping-fencing';
  INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  (cat_id, 'Fencing', 'fencing', 1),
  (cat_id, 'Paving', 'paving', 2),
  (cat_id, 'Driveways', 'driveways', 3),
  (cat_id, 'Decking', 'decking', 4),
  (cat_id, 'Sleepers & Boards', 'sleepers-boards', 5),
  (cat_id, 'Drainage', 'drainage', 6),
  (cat_id, 'Landscaping Fabrics', 'landscaping-fabrics', 7),
  (cat_id, 'Wood Care', 'wood-care', 8),
  (cat_id, 'Walling, Coping Stones & Pier Caps', 'walling-coping-stones', 9),
  (cat_id, 'External Lighting', 'external-lighting', 10),
  (cat_id, 'Artificial Grass', 'artificial-grass', 11),
  (cat_id, 'Landscaping Aggregates', 'landscaping-aggregates', 12),
  (cat_id, 'Commercial Paving', 'commercial-paving', 13),
  (cat_id, 'Groundwork & Landscaping Tools', 'groundwork-landscaping-tools', 14);
END $$;

-- 4. Kitchens & Bathrooms
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Kitchens & Bathrooms', 'kitchens-bathrooms', '🛁', 4);
DO $$ 
DECLARE cat_id UUID; 
BEGIN 
  SELECT id INTO cat_id FROM categories WHERE slug = 'kitchens-bathrooms';
  INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  (cat_id, 'Kitchens', 'kitchens', 1),
  (cat_id, 'Bathrooms', 'bathrooms', 2),
  (cat_id, 'Self Assembly Kitchens', 'self-assembly-kitchens', 3);
END $$;

-- 5. Flooring & Tiling
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Flooring & Tiling', 'flooring-tiling', '🔲', 5);
DO $$ 
DECLARE cat_id UUID; 
BEGIN 
  SELECT id INTO cat_id FROM categories WHERE slug = 'flooring-tiling';
  INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  (cat_id, 'Tiling', 'tiling', 1),
  (cat_id, 'Flooring', 'flooring', 2),
  (cat_id, 'Adhesives', 'adhesives', 3);
END $$;

-- 6. Plumbing & Heating
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Plumbing & Heating', 'plumbing-heating', '🚰', 6);
DO $$ 
DECLARE cat_id UUID; 
BEGIN 
  SELECT id INTO cat_id FROM categories WHERE slug = 'plumbing-heating';
  INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  (cat_id, 'Copper Pipe & Fittings', 'copper-pipe-fittings', 1),
  (cat_id, 'Heating', 'heating', 2),
  (cat_id, 'Plumbing', 'plumbing', 3),
  (cat_id, 'Push Fit Pipe & Fittings', 'push-fit-pipe-fittings', 4),
  (cat_id, 'Plumbing Tools', 'plumbing-tools', 5),
  (cat_id, 'Wastes & Pipework', 'wastes-pipework', 6);
END $$;

-- 7. Tools, Equipment & Workwear
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Tools, Equipment & Workwear', 'tools-equipment-workwear', '🔨', 7);
DO $$ 
DECLARE cat_id UUID; 
BEGIN 
  SELECT id INTO cat_id FROM categories WHERE slug = 'tools-equipment-workwear';
  INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  (cat_id, 'Hand Tools', 'hand-tools', 1),
  (cat_id, 'Power Tools', 'power-tools', 2),
  (cat_id, 'Power Tool Accessories', 'power-tool-accessories', 3),
  (cat_id, 'Safety Wear', 'safety-wear', 4),
  (cat_id, 'Builders Equipment', 'builders-equipment', 5),
  (cat_id, 'Tool Storage', 'tool-storage', 6);
END $$;

-- 8. Painting & Decorating
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Painting & Decorating', 'painting-decorating', '🎨', 8);
DO $$ 
DECLARE cat_id UUID; 
BEGIN 
  SELECT id INTO cat_id FROM categories WHERE slug = 'painting-decorating';
  INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  (cat_id, 'Paint', 'paint', 1),
  (cat_id, 'Decorators Tools', 'decorators-tools', 2),
  (cat_id, 'Protection', 'protection', 3),
  (cat_id, 'Wood Care', 'wood-care', 4),
  (cat_id, 'Fillers', 'fillers', 5),
  (cat_id, 'Sandpaper & Abrasive', 'sandpaper-abrasive', 6),
  (cat_id, 'Masking Tapes', 'masking-tapes', 7);
END $$;

-- 9. Electrical, Lighting & Ventilation
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Electrical, Lighting & Ventilation', 'electrical-lighting-ventilation', '💡', 9);
DO $$ 
DECLARE cat_id UUID; 
BEGIN 
  SELECT id INTO cat_id FROM categories WHERE slug = 'electrical-lighting-ventilation';
  INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  (cat_id, 'Electrical', 'electrical', 1),
  (cat_id, 'Lighting', 'lighting', 2),
  (cat_id, 'Ventilation', 'ventilation', 3);
END $$;

-- 10. Security & Ironmongery
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Security & Ironmongery', 'security-ironmongery', '🔒', 10);
DO $$ 
DECLARE cat_id UUID; 
BEGIN 
  SELECT id INTO cat_id FROM categories WHERE slug = 'security-ironmongery';
  INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  (cat_id, 'Door Furniture', 'door-furniture', 1),
  (cat_id, 'Hinges', 'hinges', 2),
  (cat_id, 'Ironmongery', 'ironmongery', 3),
  (cat_id, 'Security', 'security', 4);
END $$;

-- 11. Fixings & Adhesives
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Fixings & Adhesives', 'fixings-adhesives', '🔩', 11);
DO $$ 
DECLARE cat_id UUID; 
BEGIN 
  SELECT id INTO cat_id FROM categories WHERE slug = 'fixings-adhesives';
  INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  (cat_id, 'Screws', 'screws', 1),
  (cat_id, 'Nails & Pins', 'nails-pins', 2),
  (cat_id, 'Fixings', 'fixings', 3),
  (cat_id, 'Sealants & Adhesives', 'sealants-adhesives', 4);
END $$;

-- 12. Miscellaneous
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Miscellaneous', 'miscellaneous', '📦', 12);
DO $$ 
DECLARE cat_id UUID; 
BEGIN 
  SELECT id INTO cat_id FROM categories WHERE slug = 'miscellaneous';
  INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  (cat_id, 'Brands', 'brands', 1),
  (cat_id, 'Trade Services', 'trade-services', 2),
  (cat_id, 'Job Lots', 'job-lots', 3),
  (cat_id, 'Mixed Materials', 'mixed-materials', 4),
  (cat_id, 'Other', 'other', 5);
END $$;

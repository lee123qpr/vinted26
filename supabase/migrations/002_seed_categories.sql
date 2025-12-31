-- Seed data for Skipped Construction Materials Marketplace
-- Categories, Subcategories, and Material Carbon Values

-- ============================================================================
-- CATEGORIES (11 Main Categories)
-- ============================================================================
INSERT INTO categories (name, slug, icon, description, sort_order) VALUES
('Building Materials', 'building-materials', '🏗️', 'Bricks, blocks, roofing, plaster, insulation, and more', 1),
('Timber & Joinery', 'timber-joinery', '🪵', 'Treated timber, sheet materials, doors, windows, and stairs', 2),
('Landscaping & Fencing', 'landscaping-fencing', '🌳', 'Fencing, paving, decking, drainage, and groundwork', 3),
('Kitchens & Bathrooms', 'kitchens-bathrooms', '🚿', 'Complete kitchens, bathrooms, fixtures, and fittings', 4),
('Flooring & Tiling', 'flooring-tiling', '🔲', 'Laminate, vinyl, tiles, adhesives, and grouts', 5),
('Plumbing & Heating', 'plumbing-heating', '🔧', 'Pipes, radiators, valves, and heating systems', 6),
('Tools, Equipment & Workwear', 'tools-equipment-workwear', '🔨', 'Power tools, hand tools, safety wear, and equipment', 7),
('Painting & Decorating', 'painting-decorating', '🎨', 'Paint, brushes, wallpaper, and decorating supplies', 8),
('Electrical, Lighting & Ventilation', 'electrical-lighting-ventilation', '💡', 'Cable, switches, lighting, and ventilation', 9),
('Security & Ironmongery', 'security-ironmongery', '🔒', 'Door furniture, locks, hinges, and security', 10),
('Fixings & Adhesives', 'fixings-adhesives', '🔩', 'Screws, nails, sealants, and adhesives', 11);

-- ============================================================================
-- BUILDING MATERIALS SUBCATEGORIES
-- ============================================================================
INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Blocks', 'blocks', 1, 0.24 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Cavity Liners & Air Bricks', 'cavity-liners-air-bricks', 2, 0.24 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Bricks', 'bricks', 3, 0.24 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Jumbo Bags', 'jumbo-bags', 4, 0.05 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Sand', 'sand', 5, 0.01 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Stone & Gravel', 'stone-gravel', 6, 0.01 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Ballast', 'ballast', 7, 0.01 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Chimney Pots', 'chimney-pots', 8, 0.30 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Roof Accessories & Vents', 'roof-accessories-vents', 9, 0.50 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Roof Felting & Waterproofing Systems', 'roof-felting-waterproofing', 10, 2.50 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Roof Fixings', 'roof-fixings', 11, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Roof Flashing', 'roof-flashing', 12, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Roofing Tools', 'roofing-tools', 13, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Roof Windows', 'roof-windows', 14, 1.20 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Roofing Sheets', 'roofing-sheets', 15, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Tiles & Slates', 'tiles-slates', 16, 0.30 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Roof Timber', 'roof-timber', 17, 0.45 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'GRP Roofing System', 'grp-roofing-system', 18, 3.20 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Plasterboard Sheets', 'plasterboard-sheets', 19, 0.39 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Plasterboard Adhesives', 'plasterboard-adhesives', 20, 1.50 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Plasterboard Tape & Accessories', 'plasterboard-tape-accessories', 21, 2.00 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Jointing Compound & Filler', 'jointing-compound-filler', 22, 0.80 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Plaster', 'plaster', 23, 0.12 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Metal Stud', 'metal-stud', 24, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Plaster Beads', 'plaster-beads', 25, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Drylining', 'drylining', 26, 0.39 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'MF Ceiling System', 'mf-ceiling-system', 27, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Coving', 'coving', 28, 2.00 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Suspended Ceiling', 'suspended-ceiling', 29, 1.50 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Fire Protection Board', 'fire-protection-board', 30, 0.50 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Drywall Screws', 'drywall-screws', 31, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Acoustic Flooring', 'acoustic-flooring', 32, 1.20 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Artex', 'artex', 33, 0.80 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Roof Insulation', 'roof-insulation', 34, 3.50 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Floor Insulation', 'floor-insulation', 35, 3.50 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Loft Insulation', 'loft-insulation', 36, 3.50 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Acoustic Insulation', 'acoustic-insulation', 37, 3.50 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Drainage', 'drainage', 38, 2.00 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'PVC Fascia & Cladding', 'pvc-fascia-cladding', 39, 2.50 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Guttering', 'guttering', 40, 2.00 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Cement', 'cement', 41, 0.93 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Cement Additives & Dyes', 'cement-additives-dyes', 42, 1.50 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Expanded Metal Sheeting', 'expanded-metal-sheeting', 43, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Wall Ties & Wall Starter Kits', 'wall-ties-starter-kits', 44, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Angle Beads', 'angle-beads', 45, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Joist Hangers', 'joist-hangers', 46, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Timber Connectors', 'timber-connectors', 47, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Angle Brackets', 'angle-brackets', 48, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Joist Straps', 'joist-straps', 49, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Chimney Cowls', 'chimney-cowls', 50, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Steel Lintels', 'steel-lintels', 51, 1.85 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Concrete Lintels', 'concrete-lintels', 52, 0.13 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Cavity Trays & Closers', 'cavity-trays-closers', 53, 2.00 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Padstones', 'padstones', 54, 0.13 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Cladding', 'cladding', 55, 2.50 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Damp Proofing', 'damp-proofing', 56, 2.50 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Weatherproofing Tapes', 'weatherproofing-tapes', 57, 2.00 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Render', 'render', 58, 0.12 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Floor Levelling Compounds', 'floor-levelling-compounds', 59, 0.80 FROM categories WHERE slug = 'building-materials';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Building Sealants', 'building-sealants', 60, 2.50 FROM categories WHERE slug = 'building-materials';

-- ============================================================================
-- TIMBER & JOINERY SUBCATEGORIES
-- ============================================================================
INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Treated Timber', 'treated-timber', 1, 0.50 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Plywood', 'plywood', 2, 0.81 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'OSB', 'osb', 3, 0.45 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'MDF Sheets', 'mdf-sheets', 4, 0.72 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Chipboard', 'chipboard', 5, 0.45 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Hardboard', 'hardboard', 6, 0.72 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Sawn Timber', 'sawn-timber', 7, 0.45 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Doors', 'doors', 8, 0.60 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Stair Parts', 'stair-parts', 9, 0.45 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'uPVC Windows', 'upvc-windows', 10, 2.50 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Loft Ladders & Hatches', 'loft-ladders-hatches', 11, 1.20 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Planed Timber', 'planed-timber', 12, 0.45 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'MDF Skirting', 'mdf-skirting', 13, 0.72 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Softwood Pine Skirting', 'softwood-pine-skirting', 14, 0.45 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'UPVC Skirting', 'upvc-skirting', 15, 2.50 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Oak Veneer Skirting', 'oak-veneer-skirting', 16, 0.60 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'MDF Architrave', 'mdf-architrave', 17, 0.72 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Softwood Pine Architrave', 'softwood-pine-architrave', 18, 0.45 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'UPVC Architrave', 'upvc-architrave', 19, 2.50 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Oak Veneer Architrave', 'oak-veneer-architrave', 20, 0.60 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'CLS Timber', 'cls-timber', 21, 0.45 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Timber Cladding', 'timber-cladding', 22, 0.50 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Laminated Timber Boards', 'laminated-timber-boards', 23, 0.60 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Mouldings', 'mouldings', 24, 0.45 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Floorboards', 'floorboards', 25, 0.45 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Melamine Faced Chipboard', 'melamine-faced-chipboard', 26, 0.60 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Window Board', 'window-board', 27, 0.72 FROM categories WHERE slug = 'timber-joinery';

INSERT INTO subcategories (category_id, name, slug, sort_order, embodied_carbon_kg_per_kg) 
SELECT id, 'Wall Panelling', 'wall-panelling', 28, 0.60 FROM categories WHERE slug = 'timber-joinery';

-- I'll continue with remaining categories in a follow-up to keep file manageable
-- This demonstrates the pattern for all 11 categories

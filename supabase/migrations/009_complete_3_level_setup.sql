-- Consolidated Migration for 3-Level Taxonomy
-- Combines Schema Creation and Data Seeding into one file to prevent ordering errors.

-- 1. Create sub_subcategories table linked to subcategories
CREATE TABLE IF NOT EXISTS sub_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subcategory_id, slug)
);

-- Enable RLS for the new table
ALTER TABLE sub_subcategories ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Sub_subcategories are viewable by everyone" ON sub_subcategories;
CREATE POLICY "Sub_subcategories are viewable by everyone" ON sub_subcategories
  FOR SELECT USING (true);

-- Add sub_subcategory_id to listings table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='sub_subcategory_id') THEN
        ALTER TABLE listings ADD COLUMN sub_subcategory_id UUID REFERENCES sub_subcategories(id);
    END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_listings_sub_subcategory ON listings(sub_subcategory_id);

-- 2. Seed Data
TRUNCATE TABLE categories CASCADE;

DO $$ 
DECLARE 
  cat_id UUID; 
  sub_id UUID;
BEGIN 

-- ============================================================================
-- 1. BUILDING MATERIALS
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Building Materials', 'building-materials', '🧱', 1) RETURNING id INTO cat_id;

    -- 1.1 Bricks & Blocks
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Bricks & Blocks', 'bricks-blocks', 1) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Engineering & Facing Bricks', 'engineering-facing-bricks', 1),
        (sub_id, 'Concrete Blocks', 'concrete-blocks', 2),
        (sub_id, 'Cavity Liners & Air Bricks', 'cavity-liners-air-bricks', 3);

    -- 1.2 Building Aggregates
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Building Aggregates', 'building-aggregates', 2) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Ballast', 'ballast', 1),
        (sub_id, 'Jumbo Bags', 'jumbo-bags', 2),
        (sub_id, 'Sand', 'sand', 3),
        (sub_id, 'Stone & Gravel', 'stone-gravel', 4);
    
    -- 1.3 Cement Products
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Cement Products', 'cement-products', 3) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Cement', 'cement', 1),
        (sub_id, 'Cement Additives & Dyes', 'cement-additives-dyes', 2);
        
    -- 1.4 Weather & Waterproofing
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Weather & Waterproofing', 'weather-waterproofing', 4) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Damp Proofing', 'damp-proofing', 1),
        (sub_id, 'Roof Flashing', 'roof-flashing', 2),
        (sub_id, 'Weatherproofing Tapes', 'weatherproofing-tapes', 3);

    -- 1.5 Builders Metalwork
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Builders Metalwork', 'builders-metalwork', 5) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Angle Beads', 'angle-beads', 1),
        (sub_id, 'Angle Brackets', 'angle-brackets', 2),
        (sub_id, 'Chimney Cowls', 'chimney-cowls', 3),
        (sub_id, 'Expanded Metal Sheeting', 'expanded-metal-sheeting', 4),
        (sub_id, 'Joist Hangers', 'joist-hangers', 5),
        (sub_id, 'Joist Straps', 'joist-straps', 6),
        (sub_id, 'Timber Connectors', 'timber-connectors', 7),
        (sub_id, 'Wall Ties & Starter Kits', 'wall-ties-starter-kits', 8);

    -- 1.6 Lintels
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Lintels', 'lintels', 6) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Concrete Lintels', 'concrete-lintels', 1),
        (sub_id, 'Steel Lintels', 'steel-lintels', 2),
        (sub_id, 'Padstones', 'padstones', 3),
        (sub_id, 'Cavity Trays & Closers', 'cavity-trays-closers', 4);

    -- Other L2s
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Floor Levelling Compounds', 'floor-levelling-compounds', 7) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES
        (sub_id, 'Self Levelling Compound', 'self-levelling', 1),
        (sub_id, 'Latex Compound', 'latex-compound', 2),
        (sub_id, 'Repair Mortar', 'repair-mortar', 3);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Building Sealants', 'building-sealants', 8) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES
        (sub_id, 'Silicone Sealant', 'silicone-sealant', 1),
        (sub_id, 'Expanding Foam', 'expanding-foam', 2),
        (sub_id, 'Caulk', 'caulk', 3),
        (sub_id, 'Roof Sealant', 'roof-sealant', 4);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Render', 'render', 9) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES
        (sub_id, 'Sand & Cement', 'sand-cement', 1),
        (sub_id, 'Monocouche Render', 'monocouche-render', 2),
        (sub_id, 'Render Beads & Mesh', 'render-beads-mesh', 3),
        (sub_id, 'Tyrolean', 'tyrolean', 4);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Cladding', 'cladding', 10) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES
        (sub_id, 'PVC Cladding', 'pvc-cladding', 1),
        (sub_id, 'Timber Cladding', 'timber-cladding', 2),
        (sub_id, 'Composite Cladding', 'composite-cladding', 3),
        (sub_id, 'Fibre Cement Cladding', 'fibre-cement-cladding', 4);

-- ============================================================================
-- 2. TIMBER & JOINERY
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Timber & Joinery', 'timber-joinery', '🪵', 2) RETURNING id INTO cat_id;

    -- 2.1 Sheet Materials
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Sheet Materials', 'sheet-materials', 1) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'OSB', 'osb', 1),
        (sub_id, 'Plywood Sheets & Boards', 'plywood-sheets-boards', 2),
        (sub_id, 'MDF Sheets', 'mdf-sheets', 3),
        (sub_id, 'Chipboard', 'chipboard', 4),
        (sub_id, 'Hardboard', 'hardboard', 5);

    -- 2.2 Doors
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Doors', 'doors', 2) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Internal Doors', 'internal-doors', 1),
        (sub_id, 'External Doors', 'external-doors', 2),
        (sub_id, 'Door Frames & Lining', 'door-frames-lining', 3),
        (sub_id, 'Fire Doors', 'fire-doors', 4);

    -- 2.3 Skirting
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Skirting', 'skirting', 3) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'MDF Skirting', 'mdf-skirting', 1),
        (sub_id, 'Softwood Pine Skirting', 'softwood-pine-skirting', 2),
        (sub_id, 'UPVC Skirting', 'upvc-skirting', 3),
        (sub_id, 'Oak Veneer Skirting', 'oak-veneer-skirting', 4);

    -- 2.4 Architrave
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Architrave', 'architrave', 4) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'MDF Architrave', 'mdf-architrave', 1),
        (sub_id, 'Softwood Pine Architrave', 'softwood-pine-architrave', 2),
        (sub_id, 'UPVC Architrave', 'upvc-architrave', 3),
        (sub_id, 'Oak Architrave', 'oak-architrave', 4);

    -- 2.5 Mouldings
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Mouldings', 'mouldings', 5) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Angle', 'angle', 1),
        (sub_id, 'Arch & Doorstop', 'arch-doorstop', 2),
        (sub_id, 'Decorative Cover', 'decorative-cover', 3),
        (sub_id, 'Dowel', 'dowel', 4),
        (sub_id, 'Glass Beading', 'glass-beading', 5),
        (sub_id, 'Quadrant', 'quadrant', 6),
        (sub_id, 'Scotia', 'scotia', 7),
        (sub_id, 'Stripwood', 'stripwood', 8),
        (sub_id, 'Dado Rail & Picture Rail', 'dado-rail-picture-rail', 9);

     -- Other L2s
     -- Other L2s
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Treated Timber', 'treated-timber', 6) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES (sub_id, 'C16 Timber', 'c16-timber', 1), (sub_id, 'C24 Timber', 'c24-timber', 2), (sub_id, 'Treated Carcassing', 'treated-carcassing', 3);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Sawn Timber', 'sawn-timber', 7) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES (sub_id, 'Sawn Joinery', 'sawn-joinery', 1), (sub_id, 'Scaffold Boards', 'scaffold-boards', 2);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Window Boards', 'window-boards', 8) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES (sub_id, 'MDF Window Boards', 'mdf-window-boards', 1), (sub_id, 'Timber Window Boards', 'timber-window-boards', 2);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'CLS Timber', 'cls-timber', 9) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES (sub_id, '3x2 CLS', '3x2-cls', 1), (sub_id, '4x2 CLS', '4x2-cls', 2);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Planed Timber', 'planed-timber', 10) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES (sub_id, 'Planed Square Edge (PSE)', 'pse', 1);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Sheet Material Specifics', 'sheet-material-specifics', 11) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES (sub_id, 'Melamine Faced Chipboard', 'melamine', 1), (sub_id, 'Laminated Boards', 'laminated', 2);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Stair Parts', 'stair-parts', 12) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES (sub_id, 'Handrails & Baserails', 'handrails-baserails', 1), (sub_id, 'Spindles', 'spindles', 2), (sub_id, 'Newel Posts', 'newel-posts', 3);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Windows', 'windows', 13) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES (sub_id, 'Roof Windows', 'roof-windows', 1), (sub_id, 'uPVC Windows', 'upvc-windows', 2);

-- ============================================================================
-- 3. LANDSCAPING & FENCING
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Landscaping & Fencing', 'landscaping-fencing', '🏡', 3) RETURNING id INTO cat_id;

    -- 3.1 Fencing
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Fencing', 'fencing', 1) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Fence Panels', 'fence-panels', 1),
        (sub_id, 'Fence Posts', 'fence-posts', 2),
        (sub_id, 'Fence Gravel Boards', 'fence-gravel-boards', 3),
        (sub_id, 'Wire Fencing', 'wire-fencing', 4),
        (sub_id, 'Post Cement', 'post-cement', 5),
        (sub_id, 'Spikes & Brackets', 'spikes-brackets', 6);

    -- 3.2 Paving
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Paving', 'paving', 2) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Concrete Paving', 'concrete-paving', 1),
        (sub_id, 'Porcelain Paving', 'porcelain-paving', 2),
        (sub_id, 'Sandstone Paving', 'sandstone-paving', 3),
        (sub_id, 'Edgings', 'edgings', 4);

    -- 3.3 Decking
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Decking', 'decking', 3) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Timber Decking', 'timber-decking', 1),
       (sub_id, 'Composite Decking', 'composite-decking', 2),
       (sub_id, 'Decking Rails & Spindles', 'decking-rails-spindles', 3);
    
    -- Other L2s
    -- Other L2s
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Driveways', 'driveways', 4) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES (sub_id, 'Block Paving', 'block-paving', 1), (sub_id, 'Driveway Grids', 'driveway-grids', 2), (sub_id, 'Kerbs', 'kerbs', 3);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Sleepers & Wall Boards', 'sleepers-wall-boards', 5) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES (sub_id, 'Softwood Sleepers', 'softwood-sleepers', 1), (sub_id, 'Oak Sleepers', 'oak-sleepers', 2);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Drainage', 'drainage', 6) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES (sub_id, 'Channel Drainage', 'channel-drainage', 1), (sub_id, 'Underground Drainage', 'underground-drainage', 2), (sub_id, 'Manhole Covers', 'manhole-covers', 3);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Landscaping Fabrics', 'landscaping-fabrics', 7) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES (sub_id, 'Weed Control', 'weed-control', 1), (sub_id, 'Geotextile', 'geotextile', 2);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Artificial Grass', 'artificial-grass', 8) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES (sub_id, 'Grass Rolls', 'grass-rolls', 1), (sub_id, 'Jointing Tape & Glue', 'jointing-tape', 2);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Aggregates', 'landscaping-aggregates', 9) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES (sub_id, 'Decorative Stones', 'decorative-stones', 1), (sub_id, 'Bark & Mulch', 'bark-mulch', 2), (sub_id, 'Topsoil', 'topsoil', 3);

-- ============================================================================
-- 4. KITCHENS & BATHROOMS
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Kitchens & Bathrooms', 'kitchens-bathrooms', '🛁', 4) RETURNING id INTO cat_id;

    -- 4.1 Bathrooms
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Bathrooms', 'bathrooms', 1) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Basins & Pedestals', 'basins-pedestals', 1),
        (sub_id, 'Baths', 'baths', 2),
        (sub_id, 'Showers', 'showers', 3),
        (sub_id, 'Shower Enclosures', 'shower-enclosures', 4),
        (sub_id, 'Toilets', 'toilets', 5),
        (sub_id, 'Bathroom Taps', 'bathroom-taps', 6),
        (sub_id, 'Bathroom Furniture', 'bathroom-furniture', 7);

    -- 4.2 Kitchens
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Kitchens', 'kitchens', 2) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Kitchen Taps', 'kitchen-taps', 1),
        (sub_id, 'Kitchen Sinks', 'kitchen-sinks', 2),
        (sub_id, 'Worktops', 'worktops', 3),
        (sub_id, 'Appliances', 'appliances', 4);
    
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Self Assembly Kitchens', 'self-assembly-kitchens', 3) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Kitchen Units', 'kitchen-units', 1),
        (sub_id, 'Kitchen Doors', 'kitchen-doors', 2),
        (sub_id, 'Kitchen 3-in-1', 'kitchen-3-in-1', 3);

-- ============================================================================
-- 5. FLOORING & TILING
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Flooring & Tiling', 'flooring-tiling', '🔲', 5) RETURNING id INTO cat_id;

    -- 5.1 Tiling
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Tiling', 'tiling', 1) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Wall Tiles', 'wall-tiles', 1),
        (sub_id, 'Floor Tiles', 'floor-tiles', 2),
        (sub_id, 'Tile Adhesives & Grout', 'tile-adhesives-grout', 3),
        (sub_id, 'Tile Trims', 'tile-trims', 4),
        (sub_id, 'Tiling Tools', 'tiling-tools', 5);

    -- 5.2 Flooring
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Flooring', 'flooring', 2) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Laminate Flooring', 'laminate-flooring', 1),
        (sub_id, 'Vinyl Flooring (LVT)', 'vinyl-flooring', 2),
        (sub_id, 'Engineered Wood', 'engineered-wood', 3),
        (sub_id, 'Solid Wood', 'solid-wood', 4),
        (sub_id, 'Underlay', 'underlay', 5),
        (sub_id, 'Flooring Trims', 'flooring-trims', 6);

-- ============================================================================
-- 6. PLUMBING & HEATING
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Plumbing & Heating', 'plumbing-heating', '🚰', 6) RETURNING id INTO cat_id;

    -- 6.1 Heating
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Heating', 'heating', 1) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Radiators', 'radiators', 1),
        (sub_id, 'Heated Towel Rails', 'heated-towel-rails', 2),
        (sub_id, 'Underfloor Heating', 'underfloor-heating', 3),
        (sub_id, 'Central Heating Pumps', 'central-heating-pumps', 4),
        (sub_id, 'Heating Controls', 'heating-controls', 5);
    
    -- Other L2s
    -- Other L2s
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Pipe & Fittings', 'pipe-fittings', 2) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Copper Pipe', 'copper-pipe', 1),
       (sub_id, 'Push-Fit Fittings', 'push-fit-fittings', 2),
       (sub_id, 'Compression Fittings', 'compression-fittings', 3),
       (sub_id, 'Solder Ring Fittings', 'solder-ring-fittings', 4),
       (sub_id, 'End Feed Fittings', 'end-feed-fittings', 5);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Plumbing Tools', 'plumbing-tools', 3) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Pipe Cutters', 'pipe-cutters', 1),
       (sub_id, 'Blow Torches', 'blow-torches', 2),
       (sub_id, 'Pipe Benders', 'pipe-benders', 3);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Wastes & Traps', 'wastes-traps', 4) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Traps', 'traps', 1),
       (sub_id, 'Wastes', 'wastes', 2),
       (sub_id, 'Pan Connectors', 'pan-connectors', 3);

-- ============================================================================
-- 7. TOOLS, EQUIPMENT & WORKWEAR
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Tools, Equipment & Workwear', 'tools-equipment-workwear', '🔨', 7) RETURNING id INTO cat_id;

    -- 7.1 Hand Tools
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Hand Tools', 'hand-tools', 1) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Hammers & Axes', 'hammers-axes', 1),
       (sub_id, 'Screwdrivers', 'screwdrivers', 2),
       (sub_id, 'Saws', 'saws', 3),
       (sub_id, 'Spanners & Wrenches', 'spanners-wrenches', 4),
       (sub_id, 'Pliers', 'pliers', 5),
       (sub_id, 'Levels', 'levels', 6),
       (sub_id, 'Tape Measures', 'tape-measures', 7),
       (sub_id, 'Knives', 'knives', 8);

    -- 7.2 Power Tools
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Power Tools', 'power-tools', 2) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Drills & Drivers', 'drills-drivers', 1),
       (sub_id, 'Saws (Power)', 'power-saws', 2),
       (sub_id, 'Grinders', 'grinders', 3),
       (sub_id, 'Sanders', 'sanders', 4),
       (sub_id, 'Multi-Tools', 'multi-tools', 5),
       (sub_id, 'Nailers', 'nailers', 6);

    -- Other L2s
    -- Other L2s
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Power Tool Accessories', 'power-tool-accessories', 3) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Drill Bits', 'drill-bits', 1),
        (sub_id, 'Saw Blades', 'saw-blades', 2),
        (sub_id, 'Sanding Discs', 'sanding-discs', 3),
        (sub_id, 'Batteries & Chargers', 'batteries-chargers', 4);

    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Safety Wear', 'safety-wear', 4) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Safety Boots', 'safety-boots', 1),
        (sub_id, 'Gloves', 'gloves', 2),
        (sub_id, 'Eyewear', 'eyewear', 3),
        (sub_id, 'Hi-Vis', 'hi-vis', 4);



-- ============================================================================
-- 8. PAINTING & DECORATING
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Painting & Decorating', 'painting-decorating', '🎨', 8) RETURNING id INTO cat_id;

     -- 8.1 Paint
     INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Paint', 'paint', 1) RETURNING id INTO sub_id;
     INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Interior Emulsion', 'interior-emulsion', 1),
       (sub_id, 'Gloss & Satin', 'gloss-satin', 2),
       (sub_id, 'Exterior Paint', 'exterior-paint', 3),
       (sub_id, 'Masonry Paint', 'masonry-paint', 4),
       (sub_id, 'Primer & Undercoat', 'primer-undercoat', 5),
       (sub_id, 'Floor Paint', 'floor-paint', 6);

     -- 8.2 Decorators Tools
     INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Decorators Tools', 'decorators-tools', 2) RETURNING id INTO sub_id;
     INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Paint Brushes', 'paint-brushes', 1),
       (sub_id, 'Paint Rollers', 'paint-rollers', 2),
       (sub_id, 'Scrapers & Knives', 'scrapers-knives', 3),
       (sub_id, 'Dust Sheets', 'dust-sheets', 4),
       (sub_id, 'Masking Tape', 'masking-tape', 5);

     -- 8.3 Wood Care
     INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Wood Care', 'wood-care', 3) RETURNING id INTO sub_id;
     INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Wood Stain', 'wood-stain', 1),
       (sub_id, 'Varnish', 'varnish', 2),
       (sub_id, 'Wood Oil', 'wood-oil', 3),
       (sub_id, 'Decking Oil & Stain', 'decking-oil-stain', 4),
       (sub_id, 'Wood Preserver', 'wood-preserver', 5);

     -- 8.4 Prep & Fillers
     INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Prep & Fillers', 'prep-fillers', 4) RETURNING id INTO sub_id;
     INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Multi Purpose Filler', 'multi-purpose-filler', 1),
       (sub_id, 'Wood Filler', 'wood-filler', 2),
       (sub_id, 'Caulk', 'caulk', 3),
       (sub_id, 'Sandpaper', 'sandpaper', 4),
       (sub_id, 'White Spirit & Cleaners', 'white-spirit-cleaners', 5);

-- ============================================================================
-- 9. ELECTRICAL, LIGHTING & VENTILATION
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Electrical & Lighting', 'electrical-lighting', '💡', 9) RETURNING id INTO cat_id;

    -- 9.1 Electrical
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Electrical', 'electrical', 1) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Cable & Flex', 'cable-flex', 1),
       (sub_id, 'Sockets & Switches', 'sockets-switches', 2),
       (sub_id, 'Consumer Units', 'consumer-units', 3),
       (sub_id, 'Junction Boxes', 'junction-boxes', 4),
       (sub_id, 'Extension Leads', 'extension-leads', 5);

    -- 9.2 Lighting
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Lighting', 'lighting', 2) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Indoor Lighting', 'indoor-lighting', 1),
       (sub_id, 'Outdoor Lighting', 'outdoor-lighting', 2),
       (sub_id, 'Light Bulbs', 'light-bulbs', 3),
       (sub_id, 'Torches & Work Lights', 'torches-work-lights', 4);

    -- 9.3 Ventilation
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Ventilation', 'ventilation', 3) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Extractor Fans', 'extractor-fans', 1),
       (sub_id, 'Ducting', 'ducting', 2),
       (sub_id, 'Vents & Grilles', 'vents-grilles', 3);

-- ============================================================================
-- 10. SECURITY & IRONMONGERY
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Security & Ironmongery', 'security-ironmongery', '🔒', 10) RETURNING id INTO cat_id;

    -- 10.1 Door Furniture
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Door Furniture', 'door-furniture', 1) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Handles & Knobs', 'handles-knobs', 1),
       (sub_id, 'Locks & Latches', 'locks-latches', 2),
       (sub_id, 'Door Closers', 'door-closers', 3),
       (sub_id, 'Letter Plates', 'letter-plates', 4);

    -- 10.2 Hardware
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Hardware', 'hardware', 2) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Hinges', 'hinges', 1),
       (sub_id, 'Brackets', 'brackets', 2),
       (sub_id, 'Hooks', 'hooks', 3),
       (sub_id, 'Bolts', 'bolts', 4);

    -- 10.3 Security
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Security', 'security', 3) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Padlocks', 'padlocks', 1),
       (sub_id, 'CCTV & Alarms', 'cctv-alarms', 2),
       (sub_id, 'Safes', 'safes', 3),
       (sub_id, 'Window Security', 'window-security', 4);

-- ============================================================================
-- 11. FIXINGS & ADHESIVES
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Fixings & Adhesives', 'fixings-adhesives', '🔩', 11) RETURNING id INTO cat_id;

    -- 11.1 Screws
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Screws', 'screws', 1) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Woodscrews', 'woodscrews', 1),
       (sub_id, 'Decking Screws', 'decking-screws', 2),
       (sub_id, 'Drywall Screws', 'drywall-screws', 3),
       (sub_id, 'Coach Screws', 'coach-screws', 4);

    -- 11.2 Nails
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Nails', 'nails', 2) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Round Wire Nails', 'round-wire-nails', 1),
       (sub_id, 'Oval Brads', 'oval-brads', 2),
       (sub_id, 'Clout Nails', 'clout-nails', 3),
       (sub_id, 'Masonry Nails', 'masonry-nails', 4);

    -- 11.3 Fixings
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Fixings', 'fixings', 3) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Wall Plugs', 'wall-plugs', 1),
       (sub_id, 'Frame Fixings', 'frame-fixings', 2),
       (sub_id, 'Heavy Duty Anchors', 'heavy-duty-anchors', 3),
       (sub_id, 'Cavity Fixings', 'cavity-fixings', 4);

    -- 11.4 Adhesives
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Adhesives & Tapes', 'adhesives-tapes', 4) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Grab Adhesives', 'grab-adhesives', 1),
       (sub_id, 'Wood Glue', 'wood-glue', 2),
       (sub_id, 'Super Glue', 'super-glue', 3),
       (sub_id, 'Duct Tape', 'duct-tape', 4);

-- ============================================================================
-- 12. PLANT & EQUIPMENT
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Plant & Equipment', 'plant-equipment', '🚜', 12) RETURNING id INTO cat_id;

    -- 12.1 Excavators
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Excavators', 'excavators', 1) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Micro Excavators (<1T)', 'micro-excavators', 1),
       (sub_id, 'Mini Excavators (1-3T)', 'mini-excavators', 2),
       (sub_id, 'Midi Excavators (3-10T)', 'midi-excavators', 3),
       (sub_id, 'Crawler Excavators (>10T)', 'crawler-excavators', 4),
       (sub_id, 'Excavator Attachments', 'excavator-attachments', 5);

    -- 12.2 Dumpers
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Dumpers', 'dumpers', 2) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Site Dumpers', 'site-dumpers', 1),
       (sub_id, 'Tracked Dumpers', 'tracked-dumpers', 2),
       (sub_id, 'Muck Trucks', 'muck-trucks', 3);

    -- 12.3 Access Equipment
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Access Equipment', 'access-equipment', 3) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Scissor Lifts', 'scissor-lifts', 1),
       (sub_id, 'Cherry Pickers', 'cherry-pickers', 2),
       (sub_id, 'Scaffolding Towers', 'scaffolding-towers', 3),
       (sub_id, 'Ladders', 'ladders', 4);

    -- 12.4 Lifting & Handling
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Lifting & Handling', 'lifting-handling', 4) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Telehandlers', 'telehandlers', 1),
        (sub_id, 'Forklifts', 'forklifts', 2),
        (sub_id, 'Hoists', 'hoists', 3),
        (sub_id, 'Pallet Trucks', 'pallet-trucks', 4);

    -- 12.5 Compaction
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Compaction', 'compaction', 5) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Plate Compactors', 'plate-compactors', 1),
        (sub_id, 'Trench Rammers', 'trench-rammers', 2),
        (sub_id, 'Rollers', 'rollers', 3);

    -- 12.6 Power Generation
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Power Generation', 'power-generation', 6) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Generators', 'generators', 1),
        (sub_id, 'Lighting Towers', 'lighting-towers', 2),
        (sub_id, 'Compressors', 'compressors', 3);

    -- 12.7 Mixers
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Mixers', 'mixers', 7) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Cement Mixers', 'cement-mixers', 1),
        (sub_id, 'Paddle Mixers', 'paddle-mixers', 2);

-- ============================================================================
-- 13. METALWORK & FABRICATION
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Metalwork & Fabrication', 'metalwork-fabrication', '🏗️', 13) RETURNING id INTO cat_id;

    -- 13.1 Structural Beams
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Structural Beams', 'structural-beams', 1) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Universal Beams (UB)', 'universal-beams', 1),
       (sub_id, 'Universal Columns (UC)', 'universal-columns', 2),
       (sub_id, 'RSJ Beams', 'rsj-beams', 3),
       (sub_id, 'Parallel Flange Channels (PFC)', 'pfc', 4);

    -- 13.2 Hollow Sections
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Hollow Sections', 'hollow-sections', 2) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Square Hollow Section (SHS)', 'shs', 1),
       (sub_id, 'Rectangular Hollow Section (RHS)', 'rhs', 2),
       (sub_id, 'Circular Hollow Section (CHS)', 'chs', 3);

    -- 13.3 Bars & Angles
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Bars & Angles', 'bars-angles', 3) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Equal Angle', 'equal-angle', 1),
       (sub_id, 'Unequal Angle', 'unequal-angle', 2),
       (sub_id, 'Flat Bar', 'flat-bar', 3),
       (sub_id, 'Round Bar', 'round-bar', 4),
       (sub_id, 'Square Bar', 'square-bar', 5);

    -- 13.4 Sheet Metal & Mesh
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Sheet Metal & Mesh', 'sheet-metal-mesh', 4) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Steel Sheet', 'steel-sheet', 1),
       (sub_id, 'Galvanised Sheet', 'galvanised-sheet', 2),
       (sub_id, 'Chequer Plate', 'chequer-plate', 3),
       (sub_id, 'Weld Mesh', 'weld-mesh', 4),
       (sub_id, 'Open Steel Flooring', 'open-steel-flooring', 5);

-- ============================================================================
-- 14. MISCELLANEOUS & CONSUMABLES
-- ============================================================================
-- ============================================================================
-- 15. SITE SETUP
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Site Setup', 'site-setup', '🚧', 15) RETURNING id INTO cat_id;

    -- 15.1 Access & Storage
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Access & Storage', 'access-storage', 1) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
        (sub_id, 'Ladders & Steps', 'ladders-steps', 1),
        (sub_id, 'Barrows', 'barrows', 2),
        (sub_id, 'Tool Storage', 'tool-storage', 3),
        (sub_id, 'Site Boxes', 'site-boxes', 4);



    -- 15.3 Site Welfare
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Site Welfare', 'site-welfare', 3) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Portable Toilets', 'portable-toilets', 1),
       (sub_id, 'Canteen Equipment', 'canteen-equipment', 2),
       (sub_id, 'Site Office Supplies', 'site-office-supplies', 3),
       (sub_id, 'Cleaning Supplies', 'cleaning-supplies', 4);

    -- 15.4 Waste Management
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Waste Management', 'waste-management', 4) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Wheelie Bins', 'wheelie-bins', 1),
       (sub_id, 'Rubbish Chutes', 'rubbish-chutes', 2),
       (sub_id, 'Skip Bags', 'skip-bags', 3),
       (sub_id, 'Rubble Sacks', 'rubble-sacks', 4);

    -- 15.5 Fuels & Lubricants
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Fuels & Lubricants', 'fuels-lubricants', 5) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Jerry Cans', 'jerry-cans', 1),
       (sub_id, 'AdBlue', 'adblue', 2),
       (sub_id, 'Grease & Oil', 'grease-oil', 3),
       (sub_id, 'Red Diesel', 'red-diesel', 4);

    -- 15.6 Site Security
    INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES (cat_id, 'Site Security', 'site-security', 6) RETURNING id INTO sub_id;
    INSERT INTO sub_subcategories (subcategory_id, name, slug, sort_order) VALUES 
       (sub_id, 'Padlocks & Chains', 'padlocks-chains', 1),
       (sub_id, 'Security Fencing', 'security-fencing', 2),
       (sub_id, 'Safety Signs', 'safety-signs', 3);

-- ============================================================================
-- 16. MISCELLANEOUS
-- ============================================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Miscellaneous', 'miscellaneous', '📦', 16) RETURNING id INTO cat_id;

END $$;

-- Rename dimension columns from CM to MM to align with construction industry standards.
ALTER TABLE listings 
  RENAME COLUMN dimensions_length_cm TO dimensions_length_mm;

ALTER TABLE listings 
  RENAME COLUMN dimensions_width_cm TO dimensions_width_mm;

ALTER TABLE listings 
  RENAME COLUMN dimensions_height_cm TO dimensions_height_mm;

-- Convert existing values (1 cm = 10 mm)
UPDATE listings 
SET 
  dimensions_length_mm = dimensions_length_mm * 10,
  dimensions_width_mm = dimensions_width_mm * 10,
  dimensions_height_mm = dimensions_height_mm * 10;

-- Update comments
COMMENT ON COLUMN listings.dimensions_length_mm IS 'Length in millimeters';
COMMENT ON COLUMN listings.dimensions_width_mm IS 'Width in millimeters';
COMMENT ON COLUMN listings.dimensions_height_mm IS 'Height in millimeters';

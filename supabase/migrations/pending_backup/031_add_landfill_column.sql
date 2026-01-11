ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_landfill_saved_kg DECIMAL(10,2) DEFAULT 0;

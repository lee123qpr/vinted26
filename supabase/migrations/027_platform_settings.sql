-- Migration 027_platform_settings.sql

CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_fee_percentage DECIMAL(5,2) DEFAULT 5.00,
    is_maintenance_mode BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure only one row exists (Singleton table constraint)
CREATE UNIQUE INDEX enforce_single_row ON platform_settings((TRUE));

-- Seed the initial row
INSERT INTO platform_settings (platform_fee_percentage, is_maintenance_mode)
VALUES (5.00, false)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow public READ access to platform settings (needed for checkout fees)
CREATE POLICY "Public read access to platform settings" 
ON platform_settings FOR SELECT 
USING (true);

-- Allow only ADMIN to update settings
CREATE POLICY "Only admins can update settings" 
ON platform_settings FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = (select auth.uid()) AND is_admin = true
    )
);

-- Function to automatically update 'updated_at'
CREATE OR REPLACE FUNCTION update_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_platform_settings_updated_at_trigger
BEFORE UPDATE ON platform_settings
FOR EACH ROW EXECUTE FUNCTION update_platform_settings_updated_at();


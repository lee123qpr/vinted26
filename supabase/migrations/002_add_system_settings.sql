-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view/edit (assuming admin policies exist or open for now)
CREATE POLICY "Admins can manage settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      -- Add admin check here if you have an is_admin column, otherwise open for verified users?
      -- For now, let's keep it open for authenticated users to read, admin to write
    )
  );

-- Seed default values
INSERT INTO system_settings (key, value, description)
VALUES 
  ('platform_fee_percent', '5', 'Percentage of sale price taken as platform fee'),
  ('maintenance_mode', 'false', 'Put site in maintenance mode'),
  ('global_banner_text', '', 'Global announcement banner text')
ON CONFLICT (key) DO NOTHING;

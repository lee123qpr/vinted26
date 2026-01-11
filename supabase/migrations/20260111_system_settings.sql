
-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed defaults
INSERT INTO system_settings (key, value, is_active)
VALUES 
    ('maintenance_mode', 'false', false),
    ('global_banner_text', '', false)
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" 
ON system_settings 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE)
);

CREATE POLICY "Public can read active settings" 
ON system_settings FOR SELECT
USING (true);

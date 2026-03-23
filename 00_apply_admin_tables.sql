-- Consolidated Migration for Enterprise Admin Features

-- 1. Dynamic Platform Settings
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_fee_percentage DECIMAL(5,2) DEFAULT 5.00,
    is_maintenance_mode BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure only one row exists (Singleton table constraint)
CREATE UNIQUE INDEX IF NOT EXISTS enforce_single_row ON platform_settings((TRUE));

-- Seed the initial row
INSERT INTO platform_settings (platform_fee_percentage, is_maintenance_mode)
VALUES (5.00, false)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow public READ access to platform settings (needed for checkout fees)
DROP POLICY IF EXISTS "Public read access to platform settings" ON platform_settings;
CREATE POLICY "Public read access to platform settings" 
ON platform_settings FOR SELECT 
USING (true);

-- Allow only ADMIN to update settings
DROP POLICY IF EXISTS "Only admins can update settings" ON platform_settings;
CREATE POLICY "Only admins can update settings" 
ON platform_settings FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = true
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

DROP TRIGGER IF EXISTS update_platform_settings_updated_at_trigger ON platform_settings;
CREATE TRIGGER update_platform_settings_updated_at_trigger
BEFORE UPDATE ON platform_settings
FOR EACH ROW EXECUTE FUNCTION update_platform_settings_updated_at();

-- 2. Message Flags (Trust & Safety)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_messages_is_flagged ON messages(is_flagged) WHERE is_flagged = true;

CREATE OR REPLACE FUNCTION scan_message_for_flags()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.content ~* '(paypal|monzo|revolut|cash|pay me directly)' 
       OR NEW.content ~* '07[0-9]{9}' THEN
        NEW.is_flagged := true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_scan_message_insert ON messages;

CREATE TRIGGER trigger_scan_message_insert
BEFORE INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION scan_message_for_flags();


-- 3. Editable Email Templates Engine
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id VARCHAR(50) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access to email_templates" ON email_templates;
CREATE POLICY "Public read access to email_templates" 
ON email_templates FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Only admins can update email templates" ON email_templates;
CREATE POLICY "Only admins can update email templates" 
ON email_templates FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = true
    )
);

-- Insert default HTML templates
INSERT INTO email_templates (template_id, subject, body_html, description)
VALUES 
('welcome', 'Welcome to Skipped Marketplace!', '<h1>Welcome, {{username}}!</h1><p>We are thrilled to have you join our sustainable construction marketplace.</p>', 'The first email a user receives when they sign up.'),
('item-sold', 'Cha-ching! You sold an item', '<h2>Great news, {{sellerName}}!</h2><p>{{buyerName}} has purchased your <strong>{{itemName}}</strong> for {{itemPrice}}.</p>', 'Sent to sellers when a buyer completes checkout.'),
('order-confirmation', 'Order Confirmed: {{itemName}}', '<h2>Thanks for your order, {{buyerName}}!</h2><p>You have successfully purchased <strong>{{itemName}}</strong> for {{totalPrice}}. Here is your order ID: {{orderId}}.</p>', 'Sent to buyers as a receipt right after checkout.'),
('order-shipped', 'Update: Your item has shipped', '<h2>Hello {{buyerName}},</h2><p>Your order for <strong>{{itemName}}</strong> is on its way!</p>', 'Sent to buyers when sellers click Mark as Shipped.'),
('reset-password', 'Reset Your Password', '<h2>Password Reset Request</h2><p>Click the link below to securely reset your password.</p>', 'Security email for lost passwords.'),
('admin-warning', 'Account Warning Notice', '<h2>Important Account Notice</h2><p>Your account has violated our community guidelines.</p>', 'Sent manually or automatically to warn users of bad behavior.'),
('dispute-update', 'Action Required: Dispute Update', '<h2>Dispute Update for {{userName}}</h2><p>Dispute ID: {{disputeId}}</p><p><strong>Message:</strong> {{message}}</p>', 'Sent when an admin interacts with an open dispute.')
ON CONFLICT (template_id) DO UPDATE 
SET subject = EXCLUDED.subject, body_html = EXCLUDED.body_html;

-- Migration 029_email_templates.sql

CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'welcome', 'item_sold'
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Allow public read access (Required for Edge Functions/Server Actions to fetch templates quickly)
CREATE POLICY "Public read access to email_templates" 
ON email_templates FOR SELECT 
USING (true);

-- Allow admins ONLY to update templates
CREATE POLICY "Only admins can update email templates" 
ON email_templates FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = (select auth.uid()) AND is_admin = true
    )
);

-- Note: In production you would seed this table with your specific HTML blocks so the dashboard immediately has content to load.


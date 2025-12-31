-- Create table for newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert (subscribe)
CREATE POLICY "Allow anonymous subscription" 
ON newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- Policy: Allow service role (admin) to view all
CREATE POLICY "Allow service role to view subscribers" 
ON newsletter_subscribers 
FOR SELECT 
USING (auth.role() = 'service_role');

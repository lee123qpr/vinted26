
-- Enforce proper email format for newsletter subscribers
-- This hardens security by preventing invalid/malicious strings from being inserted
-- even with the open "ALLOW INSERT" policy.

-- Add a CHECK constraint to the email column
ALTER TABLE newsletter_subscribers
ADD CONSTRAINT email_validation_check 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Comment on constraint for documentation
COMMENT ON CONSTRAINT email_validation_check ON newsletter_subscribers IS 'Enforces basic email format validation';

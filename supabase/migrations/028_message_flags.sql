-- Migration 028_message_flags.sql

-- Add the 'is_flagged' column to the messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;

-- Create an index to speed up the admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_messages_is_flagged ON messages(is_flagged) WHERE is_flagged = true;

-- Function to automatically scan messages for keywords
CREATE OR REPLACE FUNCTION scan_message_for_flags()
RETURNS TRIGGER AS $$
BEGIN
    -- Flag if the message contains money apps, words like 'cash', or numbers that look like a UK phone number (11 digits, starting with 07)
    IF NEW.content ~* '(paypal|monzo|revolut|cash|pay me directly)' 
       OR NEW.content ~* '07[0-9]{9}' THEN
        NEW.is_flagged := true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run this before every insert
DROP TRIGGER IF EXISTS trigger_scan_message_insert ON messages;

CREATE TRIGGER trigger_scan_message_insert
BEFORE INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION scan_message_for_flags();

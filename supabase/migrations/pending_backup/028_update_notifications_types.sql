-- Drop the existing check constraint
ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;

-- Add the new check constraint with 'dispute_raised' included
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('offer_received', 'offer_accepted', 'offer_rejected', 'offer_countered', 'dispute_raised'));

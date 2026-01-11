-- Migration to add new notification types
-- We need to drop the old check constraint (if one exists) or modify the column type.
-- Assuming 'type' is a text column with a check constraint (common in Supabase for Enums).

DO $$
BEGIN
    -- Attempt to drop the existing constraint if it's named 'notifications_type_check'
    -- If it was created via Supabase UI or typical SQL, it likely has a name.
    -- If we don't know the name, we can try to drop any check constraint on the column.
    
    -- Option A: Drop specific constraint if known (Safest if we know it)
    -- ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
    
    -- Option B: Update the constraint to include new values
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

    ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN (
        'offer_received', 
        'offer_accepted', 
        'offer_rejected', 
        'offer_countered',
        'payment_succeeded',
        'order_shipped', 
        'order_completed', 
        'order_cancelled',
        'dispute_raised'
    ));

END $$;

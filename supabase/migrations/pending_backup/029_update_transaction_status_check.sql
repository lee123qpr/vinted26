-- Drop the existing check constraint on order_status
ALTER TABLE transactions DROP CONSTRAINT transactions_order_status_check;

-- Re-add the check constraint including 'shipped'
ALTER TABLE transactions ADD CONSTRAINT transactions_order_status_check 
CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'collected', 'delivered', 'completed', 'disputed', 'cancelled'));

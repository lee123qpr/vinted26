
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Ensure policy allows reading this column (redundant if using specific policy, but good for safety)
-- Actually, just the column add is enough if generic select * is used and policy allows it.

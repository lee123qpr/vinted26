
-- Add is_admin column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow admins to see all profiles
-- Drop policy if exists to avoid error
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = TRUE
  )
);

-- Note: The recursive check is handled in the later fix_admin_rls.sql, 
-- but we keep this basic structure here as the base.

-- Update RLS to allow admins to update any profile (optional, for management)
CREATE POLICY "Admins can update all profiles" 
ON profiles FOR UPDATE 
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

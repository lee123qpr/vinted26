
-- Fix RLS Recursion by using a Security Definer function

-- 1. Create function to check admin status safely
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- 3. Create new policy using the function
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (
  check_is_admin() = true
);

-- 4. Ensure users can read their OWN is_admin status (to pass middleware check)
-- Check if a policy exists, if not create simple one for own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (
  auth.uid() = id
);

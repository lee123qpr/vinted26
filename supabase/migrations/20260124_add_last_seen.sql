-- Migration: 20260124_add_last_seen.sql
-- Purpose: Track user activity and improve account deletion status

-- 1. Add last_seen to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen timestamptz;

-- 2. Create Trigger Function to sync auth.last_sign_in_at -> profiles.last_seen
CREATE OR REPLACE FUNCTION public.sync_last_seen()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen = NEW.last_sign_in_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- 3. Create Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_last_seen();

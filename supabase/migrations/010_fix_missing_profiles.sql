-- Fix missing profiles for existing users
-- This script inserts a profile row for any user in auth.users that doesn't have one in public.profiles.
-- This resolves the "foreign key constraint listings_seller_id_fkey" error.

INSERT INTO public.profiles (id, username, full_name, avatar_url)
SELECT 
    id, 
    -- Generate a default username if none exists (email prefix or random fallback)
    COALESCE(
        raw_user_meta_data->>'username',
        raw_user_meta_data->>'full_name', 
        split_part(email, '@', 1), 
        'user_' || substr(id::text, 1, 8)
    ),
    COALESCE(raw_user_meta_data->>'full_name', 'Anonymous User'),
    COALESCE(raw_user_meta_data->>'avatar_url', '')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Output result
DO $$
DECLARE
    count_fixed INTEGER;
BEGIN
    SELECT count(*) INTO count_fixed FROM public.profiles WHERE created_at > now() - interval '1 minute';
    RAISE NOTICE 'Fixed % missing profiles.', count_fixed;
END $$;

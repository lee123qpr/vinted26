-- Enable RLS for admin_logs to resolve Supabase security advisory
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Policy to allow only admins to read admin logs
CREATE POLICY "Admins can view logs" ON public.admin_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = (select auth.uid()) 
    AND profiles.role = 'admin'
  )
);

-- Policy to allow only admins to insert admin logs (if not using service_role key)
CREATE POLICY "Admins can insert logs" ON public.admin_logs
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = (select auth.uid()) 
    AND profiles.role = 'admin'
  )
);

-- Prevent updates and deletes entirely (immutable logs)
-- Not creating UPDATE/DELETE policies means they are implicitly denied.


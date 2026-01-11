-- Create Articles Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('articles', 'articles', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public Read
CREATE POLICY "Public Access Articles"
ON storage.objects FOR SELECT
USING (bucket_id = 'articles');

-- Policy: Admin/Auth Upload (Simplifying to Auth for now, or match Admin logic)
-- Note: complex exists checks on other tables in storage policies can be slow or restricted.
-- Using simple Auth check for insert.
CREATE POLICY "Auth Upload Articles"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'articles' AND auth.role() = 'authenticated');

-- Policy: Admin Update/Delete
CREATE POLICY "Auth Update/Delete Articles"
ON storage.objects FOR UPDATE
USING (bucket_id = 'articles' AND auth.role() = 'authenticated');

CREATE POLICY "Auth Delete Articles"
ON storage.objects FOR DELETE
USING (bucket_id = 'articles' AND auth.role() = 'authenticated');

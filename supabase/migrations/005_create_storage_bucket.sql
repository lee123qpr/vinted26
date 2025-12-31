-- Migration: 005_create_storage_bucket.sql
-- Purpose: Create 'listings' storage bucket and set up RLS policies.

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for the 'listings' bucket

-- 1. Public Read Access
-- Allow everyone to view images in the listings bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'listings' );

-- 2. Authenticated Upload Access
-- Allow authenticated users to upload files to the listings bucket
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listings' AND
  auth.role() = 'authenticated'
);

-- 3. Owner Delete/Update Access
-- Allow users to delete/update their own files (assuming path structure user_id/filename)
CREATE POLICY "Owner Manage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Owner Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

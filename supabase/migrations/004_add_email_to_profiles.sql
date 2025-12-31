-- Migration: 004_add_email_to_profiles.sql
-- Purpose: Add email column to profiles table to support the handle_new_user trigger.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

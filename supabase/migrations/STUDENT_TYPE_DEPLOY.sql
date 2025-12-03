-- QUICK DEPLOY: Student vs Non-Student Feature
-- Copy and paste this entire file into Supabase SQL Editor

-- Add is_student column to profiles table (defaults to true for existing users)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_student BOOLEAN DEFAULT true;

-- For existing users with colleges, set is_student to true
UPDATE public.profiles SET is_student = true WHERE college IS NOT NULL;

-- For existing users without colleges, you may want to set them as non-students
-- Uncomment the line below if you want this behavior:
-- UPDATE public.profiles SET is_student = false WHERE college IS NULL;

-- Verification query
SELECT 
  'is_student column added' as status,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_student = true) as students,
  COUNT(*) FILTER (WHERE is_student = false) as non_students
FROM public.profiles;

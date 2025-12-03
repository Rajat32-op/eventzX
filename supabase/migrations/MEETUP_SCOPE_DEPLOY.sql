-- MEETUP SCOPE FEATURE DEPLOYMENT
-- Run this in your Supabase SQL Editor

-- Add is_campus_only field to meetups table
-- This determines if a student's meetup is only for their campus or open to the city
ALTER TABLE public.meetups 
ADD COLUMN IF NOT EXISTS is_campus_only BOOLEAN DEFAULT true;

-- Update existing meetups
-- Set is_campus_only to true for all existing meetups (assuming they were campus-focused)
UPDATE public.meetups 
SET is_campus_only = true 
WHERE is_campus_only IS NULL;

-- Notes:
-- - For students: They can choose "Campus Only" (true) or "City Circle" (false)
-- - For non-students: Always false (their events are city-wide)
-- - City Circle feed shows: non-student events + student events with is_campus_only = false
-- - Campus feed shows: only events from the same campus (filtered by college)

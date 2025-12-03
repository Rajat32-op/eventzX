-- MEETUP CITY/COLLEGE FIELDS DEPLOYMENT
-- Run this in your Supabase SQL Editor

-- Add city and college fields to meetups table for proper filtering
ALTER TABLE public.meetups 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS college TEXT;

-- Update existing meetups to populate city and college from their creators
UPDATE public.meetups m
SET 
  city = p.city,
  college = p.college
FROM public.profiles p
WHERE m.creator_id = p.id
  AND (m.city IS NULL OR m.college IS NULL);

-- Notes:
-- - city: Stores the city where the meetup is happening (from creator's profile)
-- - college: Stores the college for campus-only meetups (from creator's profile)
-- - These fields enable exact matching instead of string searching in location
-- - New meetups will automatically have these fields populated on creation

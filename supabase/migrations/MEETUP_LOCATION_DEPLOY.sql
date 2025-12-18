-- event CITY/COLLEGE FIELDS DEPLOYMENT
-- Run this in your Supabase SQL Editor

-- Add city and college fields to events table for proper filtering
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS college TEXT;

-- Update existing events to populate city and college from their creators
UPDATE public.events m
SET 
  city = p.city,
  college = p.college
FROM public.profiles p
WHERE m.creator_id = p.id
  AND (m.city IS NULL OR m.college IS NULL);

-- Notes:
-- - city: Stores the city where the event is happening (from creator's profile)
-- - college: Stores the college for campus-only events (from creator's profile)
-- - These fields enable exact matching instead of string searching in location
-- - New events will automatically have these fields populated on creation

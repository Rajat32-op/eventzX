-- Add event_city column to profiles table for city preference
-- This allows users to see events from a different city than their current location
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS event_city TEXT;

-- Update existing users to have event_city same as their city initially
UPDATE public.profiles SET event_city = city WHERE event_city IS NULL AND city IS NOT NULL;

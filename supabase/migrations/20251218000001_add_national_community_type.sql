-- Add 'National' type to communities table
-- This migration updates the check constraint to include 'National' as a valid community type
-- Note: 'Interest' is kept for backward compatibility but removed from UI

-- Drop the existing check constraint
ALTER TABLE public.communities DROP CONSTRAINT IF EXISTS communities_type_check;

-- Add new check constraint that includes 'National' (keep Interest for existing data)
ALTER TABLE public.communities ADD CONSTRAINT communities_type_check 
  CHECK (type IN ('Campus', 'City', 'Interest', 'National'));

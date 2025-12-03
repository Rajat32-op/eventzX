-- Add is_campus_only field to meetups table
-- This determines if a student's meetup is only for their campus or open to the city
ALTER TABLE public.meetups 
ADD COLUMN IF NOT EXISTS is_campus_only BOOLEAN DEFAULT true;

-- For non-students, this field will be false (they only create city events)
-- For students, they can choose true (campus only) or false (open to city)

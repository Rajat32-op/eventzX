-- Add city field to meetups table for proper filtering
ALTER TABLE public.meetups 
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add college field to meetups table for proper filtering
ALTER TABLE public.meetups 
ADD COLUMN IF NOT EXISTS college TEXT;

-- Note: These fields will be automatically populated from the creator's profile when creating meetups
-- city: Always set from creator's city (for both students and non-students)
-- college: Set from creator's college (only for students)

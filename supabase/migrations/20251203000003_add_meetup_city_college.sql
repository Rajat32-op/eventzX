-- Add city field to events table for proper filtering
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add college field to events table for proper filtering
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS college TEXT;

-- Note: These fields will be automatically populated from the creator's profile when creating events
-- city: Always set from creator's city (for both students and non-students)
-- college: Set from creator's college (only for students)

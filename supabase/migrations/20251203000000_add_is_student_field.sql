-- Add is_student column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_student BOOLEAN DEFAULT true;

-- Update city for existing students based on their college
DO $$
DECLARE
  profile_record RECORD;
  college_city TEXT;
BEGIN
  FOR profile_record IN SELECT id, college FROM public.profiles WHERE college IS NOT NULL AND is_student = true LOOP
    -- Map college names to cities (this will need to be comprehensive)
    -- For now, we'll set it via application logic
    NULL;
  END LOOP;
END $$;

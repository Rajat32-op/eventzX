-- Create colleges table
CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(name, city)
);

-- Enable RLS
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read colleges
CREATE POLICY "Anyone can view colleges"
  ON public.colleges
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert colleges
CREATE POLICY "Authenticated users can add colleges"
  ON public.colleges
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for faster searches
CREATE INDEX idx_colleges_name ON public.colleges(name);
CREATE INDEX idx_colleges_city ON public.colleges(city);
CREATE INDEX idx_colleges_type ON public.colleges(type);

-- Function to add a new college
CREATE OR REPLACE FUNCTION add_college(
  p_name TEXT,
  p_city TEXT,
  p_type TEXT DEFAULT 'Other'
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  city TEXT,
  type TEXT
) AS $$
BEGIN
  -- Insert the college with auto-generated UUID
  INSERT INTO public.colleges (name, city, type, created_by)
  VALUES (trim(p_name), trim(p_city), p_type, auth.uid())
  ON CONFLICT (name, city) DO UPDATE
    SET name = EXCLUDED.name
  RETURNING colleges.id, colleges.name, colleges.city, colleges.type
  INTO id, name, city, type;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

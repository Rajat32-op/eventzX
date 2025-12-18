-- Create cities table
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- Enable RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read cities
CREATE POLICY "Anyone can view cities"
  ON public.cities
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert cities
CREATE POLICY "Authenticated users can add cities"
  ON public.cities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for faster searches (case-insensitive)
CREATE INDEX idx_cities_name_lower ON public.cities(LOWER(name));

-- Function to add a new city (checks for case-insensitive duplicates)
CREATE OR REPLACE FUNCTION add_city(
  p_name TEXT
)
RETURNS TABLE(
  id UUID,
  name TEXT
) AS $$
DECLARE
  v_city_id UUID;
  v_city_name TEXT;
BEGIN
  -- Check if city already exists (case-insensitive)
  SELECT cities.id, cities.name 
  INTO v_city_id, v_city_name
  FROM public.cities
  WHERE LOWER(cities.name) = LOWER(trim(p_name));
  
  IF v_city_id IS NOT NULL THEN
    -- City already exists, return the existing one
    RETURN QUERY SELECT v_city_id, v_city_name;
  ELSE
    -- Insert the new city
    INSERT INTO public.cities (name)
    VALUES (trim(p_name))
    RETURNING cities.id, cities.name
    INTO v_city_id, v_city_name;
    
    RETURN QUERY SELECT v_city_id, v_city_name;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migrate existing cities from colleges table to cities table
INSERT INTO public.cities (name)
SELECT DISTINCT trim(city)
FROM public.colleges
WHERE trim(city) != ''
ON CONFLICT (name) DO NOTHING;

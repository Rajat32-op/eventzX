-- Migration: Add is_online field to events table
-- This migration adds an is_online boolean field to distinguish between online and offline events

-- Step 1: Add the is_online column with a default value of false
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
-- Migration: Make location column nullable
-- This allows online events to have no location

ALTER TABLE events ALTER COLUMN location DROP NOT NULL;

-- Step 2: Update existing rows based on location field
-- Events with location are considered offline (is_online = false)
-- Events without location are considered online (is_online = true)
UPDATE events
SET is_online = CASE 
    WHEN location IS NULL OR location = '' THEN true
    ELSE false
END
WHERE is_online IS NULL;

-- Step 3: Add a comment for documentation
COMMENT ON COLUMN events.is_online IS 'Indicates if the event is online (true) or offline (false). For offline events, location is optional.';

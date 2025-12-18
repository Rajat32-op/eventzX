-- Migration: Add event link and national feed support
-- Date: 2025-12-16

-- Add event_link column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_link TEXT;

-- Add show_national column for national feed
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS show_national BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.events.event_link IS 'Google Form or event registration link';
COMMENT ON COLUMN public.events.show_national IS 'Whether event should appear in national feed (visible to everyone)';

-- Create index for national feed queries
CREATE INDEX IF NOT EXISTS idx_events_show_national ON public.events(show_national) WHERE show_national = true;

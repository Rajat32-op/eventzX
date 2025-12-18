-- Fix event_attendees table constraint
-- The constraint should be on (event_id, user_id) not just event_id
-- This allows multiple users to join the same event

-- Drop the incorrect unique constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'event_attendees_event_id_key'
    ) THEN
        ALTER TABLE public.event_attendees DROP CONSTRAINT event_attendees_event_id_key;
    END IF;
END $$;

-- Ensure the correct unique constraint exists on (event_id, user_id)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'event_attendees_event_id_user_id_key'
    ) THEN
        ALTER TABLE public.event_attendees ADD CONSTRAINT event_attendees_event_id_user_id_key UNIQUE(event_id, user_id);
    END IF;
END $$;

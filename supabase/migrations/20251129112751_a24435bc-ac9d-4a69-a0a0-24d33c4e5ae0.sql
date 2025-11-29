-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT message_target_check CHECK (
    (receiver_id IS NOT NULL AND community_id IS NULL) OR 
    (receiver_id IS NULL AND community_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received, or in communities they're members of
CREATE POLICY "Users can view their messages" ON public.messages
FOR SELECT USING (
  auth.uid() = sender_id OR 
  auth.uid() = receiver_id OR
  (community_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.community_members 
    WHERE community_id = messages.community_id 
    AND user_id = auth.uid()
  ))
);

-- Users can send messages
CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their messages" ON public.messages
FOR DELETE USING (auth.uid() = sender_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
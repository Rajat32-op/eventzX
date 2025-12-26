-- Allow community admins to add members to their communities
-- The existing policy only allows users to add themselves (auth.uid() = user_id)
-- This new policy allows admins to add other users

DROP POLICY IF EXISTS "Users can join communities" ON public.community_members;

-- Recreate the policy to allow both self-joining and admin adding members
CREATE POLICY "Users can join or admins can add members"
ON public.community_members FOR INSERT
TO authenticated
WITH CHECK (
  -- User joining themselves
  auth.uid() = user_id
  OR
  -- Admin adding another member
  EXISTS (
    SELECT 1 FROM public.community_members admin_check
    WHERE admin_check.community_id = community_id
      AND admin_check.user_id = auth.uid()
      AND admin_check.role = 'admin'
  )
);

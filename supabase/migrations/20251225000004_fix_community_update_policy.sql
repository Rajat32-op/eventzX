-- Fix the community update policy - the previous policy had issues with self-reference
-- Drop any existing update policies
DROP POLICY IF EXISTS "Community admins can update their communities" ON public.communities;
DROP POLICY IF EXISTS "Community creators can update their communities" ON public.communities;

-- Create a proper update policy that allows admins to update
CREATE POLICY "Community admins can update their communities"
ON public.communities FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = communities.id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = communities.id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
  )
);

-- Also allow the original creator to update (fallback)
CREATE POLICY "Community creators can update their communities"
ON public.communities FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Add role column to community_members table for admin functionality
ALTER TABLE public.community_members 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member' 
CHECK (role IN ('admin', 'member'));

-- Update existing creators to be admins
UPDATE public.community_members cm
SET role = 'admin'
FROM public.communities c
WHERE cm.community_id = c.id 
  AND cm.user_id = c.created_by;

-- Add policy for admins to manage members
CREATE POLICY "Community admins can remove members"
ON public.community_members FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.community_members admin_check
    WHERE admin_check.community_id = community_members.community_id
      AND admin_check.user_id = auth.uid()
      AND admin_check.role = 'admin'
  )
  OR user_id = auth.uid()
);

-- Allow admins to update community info
DROP POLICY IF EXISTS "Community creators can update their communities" ON public.communities;

CREATE POLICY "Community admins can update their communities"
ON public.communities FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = id
      AND user_id = auth.uid()
      AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = id
      AND user_id = auth.uid()
      AND role = 'admin'
  )
);

-- Make description optional (nullable)
ALTER TABLE public.communities ALTER COLUMN description DROP NOT NULL;

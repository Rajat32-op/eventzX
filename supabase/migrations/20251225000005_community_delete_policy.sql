-- Allow community admins to delete their communities
CREATE POLICY "Community admins can delete their communities"
ON public.communities FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = communities.id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
  )
  OR auth.uid() = created_by
);

// Supabase Edge Function to fetch public communities
// This function uses service role to bypass RLS for non-logged-in users

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}   

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Fetch all communities with essential information
    const { data: communitiesData, error: communitiesError } = await supabaseAdmin
      .from('communities')
      .select(`
        id,
        name,
        description,
        type,
        image_url,
        created_by,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (communitiesError) {
      console.error('Error fetching communities:', communitiesError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to fetch communities',
          error: communitiesError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch member counts for all communities
    const communityIds = communitiesData?.map(c => c.id) || []
    
    let memberCounts: Record<string, number> = {}
    
    if (communityIds.length > 0) {
      const { data: memberData, error: memberError } = await supabaseAdmin
        .from('community_members')
        .select('community_id')
        .in('community_id', communityIds)

      if (!memberError && memberData) {
        memberData.forEach((m: any) => {
          memberCounts[m.community_id] = (memberCounts[m.community_id] || 0) + 1
        })
      }
    }

    // Format communities with member counts (no join/admin status for public view)
    const formattedCommunities = communitiesData?.map((community: any) => ({
      ...community,
      member_count: memberCounts[community.id] || 0,
      is_joined: false,
      is_admin: false,
    })) || []

    return new Response(
      JSON.stringify({ 
        success: true, 
        communities: formattedCommunities 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'An unexpected error occurred',
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

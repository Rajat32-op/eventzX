// Supabase Edge Function to fetch public national events
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

    // Fetch only national events with essential information
    const { data: eventsData, error: eventsError } = await supabaseAdmin
      .from('events')
      .select(`
        id,
        title,
        description,
        date,
        time,
        location,
        category,
        creator_id,
        max_attendees,
        event_link,
        show_national,
        created_at,
        creator:profiles!events_creator_id_fkey(id, name, avatar_url, college, city)
      `)
      .eq('show_national', true)
      .order('created_at', { ascending: false })

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to fetch events',
          error: eventsError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch attendee counts for these events
    const eventIds = eventsData?.map(e => e.id) || []
    
    let attendeeCounts: Record<string, number> = {}
    
    if (eventIds.length > 0) {
      const { data: attendeeData, error: attendeeError } = await supabaseAdmin
        .from('event_attendees')
        .select('event_id')
        .in('event_id', eventIds)

      if (!attendeeError && attendeeData) {
        attendeeData.forEach((a: any) => {
          attendeeCounts[a.event_id] = (attendeeCounts[a.event_id] || 0) + 1
        })
      }
    }

    // Format events with attendee counts
    const formattedEvents = eventsData?.map((event: any) => ({
      ...event,
      attendee_count: attendeeCounts[event.id] || 0,
      is_joined: false, // Non-logged users can't be joined
      show_in_campus: null,
      show_in_city: null,
      city: null,
      college: null,
    })) || []

    return new Response(
      JSON.stringify({ 
        success: true, 
        events: formattedEvents 
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
        message: 'An unexpected error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

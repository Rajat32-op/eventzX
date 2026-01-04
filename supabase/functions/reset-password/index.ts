// Supabase Edge Function to reset user password
// This function has admin privileges to update auth.users table

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
    const { email, password, code } = await req.json()

    // Validate inputs
    if (!email || !password || !code) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Email, password, and verification code are required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Password must be at least 6 characters' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create admin client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const normalizedEmail = email.toLowerCase().trim()

    // Verify the OTP is still valid (should already be marked as used by verify function)
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('password_reset_otps')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('code', code)
      .eq('is_used', true)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpData) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Invalid or expired verification code' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }


    // Get user ID from profiles table (profiles.id = auth.users.id)
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .ilike('email', normalizedEmail)
      .single()

    if (profileError || !profileData) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'User not found' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update user password using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      profileData.id,
      { password }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Failed to update password' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Invalidate all remaining OTPs for this email
    await supabaseAdmin
      .from('password_reset_otps')
      .update({ is_used: true })
      .eq('email', normalizedEmail)
      .eq('is_used', false)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Password updated successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Reset password error:', errorMessage)
    return new Response(
      JSON.stringify({ 
        success: false,
        message: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

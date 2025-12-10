// Supabase Edge Function to send OTP emails via SMTP
// Deploy this to: supabase/functions/send-otp-email/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SMTP_HOSTNAME = Deno.env.get('SMTP_HOSTNAME') || 'smtp.gmail.com'
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '587')
const SMTP_USERNAME = Deno.env.get('SMTP_USERNAME') || ''
const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD') || ''
const SMTP_FROM_EMAIL = Deno.env.get('SMTP_FROM_EMAIL') || 'noreply@yourdomain.com'
const SMTP_FROM_NAME = Deno.env.get('SMTP_FROM_NAME') || 'EventzX'

interface RequestBody {
  email: string
  code: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendEmail(to: string, code: string) {
  const subject = 'Your EventzX Verification Code'
  
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EventzX Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🎉 EventzX
              </h1>
              <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">
                Discover events in your college and city
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Verification Code
              </h2>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for signing up with EventzX! Please use the following verification code to complete your registration:
              </p>
              
              <!-- OTP Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 20px 40px; display: inline-block;">
                      <p style="margin: 0; color: #3b82f6; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${code}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                This code will expire in <strong style="color: #3b82f6;">30 minutes</strong>.
              </p>
              
              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; margin: 20px 0;">
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                      ⚠️ <strong>Security Notice:</strong> If you didn't request this code, please ignore this email. Your account remains secure.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Need help? Contact us at <a href="mailto:support@eventzx.com" style="color: #3b82f6; text-decoration: none;">support@eventzx.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px;">
                © 2025 EventzX. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Discover hackathons, competitions, clubs, and events happening around you.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  const textBody = `
EventzX Verification Code

Your verification code is: ${code}

This code will expire in 30 minutes.

If you didn't request this code, please ignore this email.

Best regards,
EventzX Team
  `

  // Send email via Brevo (Sendinblue) SMTP using fetch API
  // Construct SMTP-style email using Brevo's API
  
  // For Brevo, we'll use their transactional email API
  const brevoApiKey = Deno.env.get('BREVO_API_KEY') || ''
  
  if (brevoApiKey) {
    // Use Brevo API (recommended - more reliable than SMTP)
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify({
        sender: {
          name: SMTP_FROM_NAME,
          email: SMTP_FROM_EMAIL
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlBody,
        textContent: textBody
      })
    })

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.text()
      throw new Error(`Brevo API error: ${brevoResponse.status} - ${errorData}`)
    }

    return { success: true }
  }
  
  // Fallback: Use native SMTP
  // Import SMTP library for Deno
  const encoder = new TextEncoder()
  
  try {
    const conn = await Deno.connect({
      hostname: SMTP_HOSTNAME,
      port: SMTP_PORT,
    })

    const reader = conn.readable.getReader()
    const writer = conn.writable.getWriter()

    // Helper to read SMTP response
    const readResponse = async () => {
      const { value } = await reader.read()
      return new TextDecoder().decode(value)
    }

    // Helper to send SMTP command
    const sendCommand = async (command: string) => {
      await writer.write(encoder.encode(command + '\r\n'))
    }

    // SMTP handshake
    await readResponse() // 220 greeting
    await sendCommand(`EHLO ${SMTP_HOSTNAME}`)
    await readResponse() // 250 response

    // SMTP AUTH LOGIN
    await sendCommand('AUTH LOGIN')
    await readResponse() // 334 Username
    await sendCommand(btoa(SMTP_USERNAME))
    await readResponse() // 334 Password
    await sendCommand(btoa(SMTP_PASSWORD))
    await readResponse() // 235 Authentication successful

    // Send email
    await sendCommand(`MAIL FROM:<${SMTP_FROM_EMAIL}>`)
    await readResponse() // 250 OK
    await sendCommand(`RCPT TO:<${to}>`)
    await readResponse() // 250 OK
    await sendCommand('DATA')
    await readResponse() // 354 Start mail input

    // Email headers and body
    const emailContent = [
      `From: ${SMTP_FROM_NAME} <${SMTP_FROM_EMAIL}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="boundary123"',
      '',
      '--boundary123',
      'Content-Type: text/plain; charset=UTF-8',
      '',
      textBody,
      '',
      '--boundary123',
      'Content-Type: text/html; charset=UTF-8',
      '',
      htmlBody,
      '',
      '--boundary123--',
      '.',
    ].join('\r\n')

    await sendCommand(emailContent)
    await readResponse() // 250 OK
    await sendCommand('QUIT')
    await readResponse() // 221 Bye

    conn.close()
    return { success: true }
  } catch (smtpError) {
    console.error('SMTP Error:', smtpError)
    throw new Error(`SMTP connection failed: ${smtpError.message}`)
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, code } = await req.json() as RequestBody

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await sendEmail(email, code)

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

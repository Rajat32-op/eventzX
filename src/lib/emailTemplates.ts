/**
 * Email Templates for OTP Verification
 * 
 * These templates can be used with any email service provider
 * (SendGrid, Mailgun, AWS SES, Resend, etc.)
 */

export const OTP_EMAIL_TEMPLATE = {
  subject: 'Your EventzX Verification Code',
  
  text: (code: string) => `
Your EventzX Verification Code

Your verification code is: ${code}

This code will expire in 30 minutes.

If you didn't request this code, please ignore this email.

Best regards,
EventzX Team
  `.trim(),
  
  html: (code: string) => `
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
  `.trim()
};

/**
 * Example usage with different email services:
 * 
 * // SendGrid
 * import sgMail from '@sendgrid/mail';
 * sgMail.setApiKey(process.env.SENDGRID_API_KEY);
 * await sgMail.send({
 *   to: userEmail,
 *   from: 'noreply@eventzx.com',
 *   subject: OTP_EMAIL_TEMPLATE.subject,
 *   text: OTP_EMAIL_TEMPLATE.text(otpCode),
 *   html: OTP_EMAIL_TEMPLATE.html(otpCode)
 * });
 * 
 * // Resend
 * import { Resend } from 'resend';
 * const resend = new Resend(process.env.RESEND_API_KEY);
 * await resend.emails.send({
 *   from: 'EventzX <noreply@eventzx.com>',
 *   to: userEmail,
 *   subject: OTP_EMAIL_TEMPLATE.subject,
 *   html: OTP_EMAIL_TEMPLATE.html(otpCode)
 * });
 * 
 * // Nodemailer (SMTP)
 * import nodemailer from 'nodemailer';
 * const transporter = nodemailer.createTransport({...});
 * await transporter.sendMail({
 *   from: 'EventzX <noreply@eventzx.com>',
 *   to: userEmail,
 *   subject: OTP_EMAIL_TEMPLATE.subject,
 *   text: OTP_EMAIL_TEMPLATE.text(otpCode),
 *   html: OTP_EMAIL_TEMPLATE.html(otpCode)
 * });
 */

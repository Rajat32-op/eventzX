import { supabase } from "@/integrations/supabase/client";

export interface PasswordResetOTPResponse {
  success: boolean;
  message: string;
  remainingAttempts?: number;
}

/**
 * Request a password reset OTP
 */
export async function requestPasswordResetOTP(email: string): Promise<PasswordResetOTPResponse> {
  try {
    const { data, error } = await (supabase.rpc as any)('create_password_reset_otp', {
      p_email: email.toLowerCase().trim()
    }) as { data: { code: string; expires_at: string; hourly_remaining: number }[] | null; error: any };

    if (error) {
      if (error.message?.includes('Rate limit')) {
        return {
          success: false,
          message: 'Too many requests. Please try again later.',
          remainingAttempts: 0
        };
      }
      
      return {
        success: false,
        message: error.message || 'Failed to send reset code'
      };
    }

    if (data && data.length > 0) {
      // Send email via Edge Function
      const { error: emailError } = await supabase.functions.invoke('send-otp-email', {
        body: { 
          action: 'password-reset',
          email: email.toLowerCase().trim(), 
          code: data[0].code 
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
      }

      return {
        success: true,
        message: 'Reset code sent to your email',
        remainingAttempts: data[0].hourly_remaining
      };
    }

    return {
      success: false,
      message: 'Failed to generate reset code'
    };
  } catch (error: any) {
    console.error('Error requesting password reset:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please try again.'
    };
  }
}

/**
 * Verify password reset OTP
 */
export async function verifyPasswordResetOTP(
  email: string, 
  code: string
): Promise<PasswordResetOTPResponse> {
  try {
    const { data, error } = await (supabase.rpc as any)('verify_password_reset_otp', {
      p_email: email.toLowerCase().trim(),
      p_code: code
    }) as { data: { success: boolean; message: string; remaining_attempts: number }[] | null; error: any };

    if (error) {
      return {
        success: false,
        message: error.message || 'Verification failed'
      };
    }

    if (data && data.length > 0) {
      return {
        success: data[0].success,
        message: data[0].message,
        remainingAttempts: data[0].remaining_attempts
      };
    }

    return {
      success: false,
      message: 'Verification failed'
    };
  } catch (error: any) {
    console.error('Error verifying password reset code:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please try again.'
    };
  }
}

/**
 * Get remaining password reset attempts
 */
export async function getPasswordResetAttemptsRemaining(email: string) {
  try {
    const { data } = await (supabase.rpc as any)('get_password_reset_attempts_remaining', {
      p_email: email.toLowerCase().trim()
    }) as { data: { hourly: number }[] | null };

    if (data && data.length > 0) {
      return { hourly: data[0].hourly };
    }

    return { hourly: 5 };
  } catch (error) {
    console.error('Error getting remaining attempts:', error);
    return { hourly: 5 };
  }
}

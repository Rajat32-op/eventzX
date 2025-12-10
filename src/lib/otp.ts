import { supabase } from '@/integrations/supabase/client';

interface OTPResponse {
  success: boolean;
  message: string;
  expiresAt?: string;
  remainingAttempts?: number;
}

interface CreateOTPResult {
  code: string;
  expires_at: string;
  remaining_attempts: number;
}

interface VerifyOTPResult {
  success: boolean;
  message: string;
  remaining_attempts: number;
}

interface RemainingAttemptsResult {
  remaining_hourly: number;
  remaining_current: number;
}

/**
 * Request a new OTP code
 */
export const requestOTP = async (email: string): Promise<OTPResponse> => {
  try {
    // Call the create_otp function
    // @ts-ignore - Custom RPC function not in generated types
    const { data, error } = await supabase.rpc('create_otp', {
      p_email: email.toLowerCase().trim()
    }) as { data: CreateOTPResult[] | null; error: any };

    if (error) {
      if (error.message.includes('Rate limit exceeded')) {
        return {
          success: false,
          message: 'Too many requests. Please try again after an hour.',
          remainingAttempts: 0
        };
      }
      throw error;
    }

    if (data && data.length > 0) {
      const result = data[0];
      
      // Send email via Supabase Edge Function
      const emailResponse = await supabase.functions.invoke('send-otp-email', {
        body: { 
          email: email.toLowerCase().trim(), 
          code: result.code 
        }
      });

      // Check if email sending failed
      if (emailResponse.error) {
        console.error('Email sending failed:', emailResponse.error);
        return {
          success: false,
          message: 'Failed to send email. Please check your email address and try again.'
        };
      }

      return {
        success: true,
        message: 'Verification code sent to your email',
        expiresAt: result.expires_at,
        remainingAttempts: result.remaining_attempts
      };
    }

    return {
      success: false,
      message: 'Failed to generate verification code'
    };
  } catch (error: any) {
    console.error('Error requesting OTP:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection and try again.'
    };
  }
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (email: string, code: string): Promise<OTPResponse> => {
  try {
    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return {
        success: false,
        message: 'Please enter a valid 6-digit code'
      };
    }

    // Call the verify_otp function
    // @ts-ignore - Custom RPC function not in generated types
    const { data, error } = await supabase.rpc('verify_otp', {
      p_email: email.toLowerCase().trim(),
      p_code: code
    }) as { data: VerifyOTPResult[] | null; error: any };

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      const result = data[0];
      return {
        success: result.success,
        message: result.message,
        remainingAttempts: result.remaining_attempts
      };
    }

    return {
      success: false,
      message: 'Verification failed. Please try again.'
    };
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection and try again.'
    };
  }
};

/**
 * Get remaining attempts for a user
 */
export const getRemainingAttempts = async (email: string): Promise<{ hourly: number; current: number }> => {
  try {
    // @ts-ignore - Custom RPC function not in generated types
    const { data, error } = await supabase.rpc('get_otp_attempts_remaining', {
      p_email: email.toLowerCase().trim()
    }) as { data: RemainingAttemptsResult[] | null; error: any };

    if (error) throw error;

    if (data && data.length > 0) {
      return {
        hourly: data[0].remaining_hourly,
        current: data[0].remaining_current
      };
    }

    return { hourly: 5, current: 5 };
  } catch (error) {
    console.error('Error getting remaining attempts:', error);
    return { hourly: 5, current: 5 };
  }
};

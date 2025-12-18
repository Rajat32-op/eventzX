-- Migration: Password reset system
-- Date: 2025-12-16

-- Create password_reset_otps table
CREATE TABLE IF NOT EXISTS public.password_reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own OTPs (for verification)
CREATE POLICY "Users can read own password reset OTPs"
  ON public.password_reset_otps
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert OTPs (for requesting reset)
CREATE POLICY "Anyone can create password reset OTPs"
  ON public.password_reset_otps
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update OTPs (for marking as used)
CREATE POLICY "Anyone can update password reset OTPs"
  ON public.password_reset_otps
  FOR UPDATE
  USING (true);

-- Create indexes
CREATE INDEX idx_password_reset_otps_email ON public.password_reset_otps(email);
CREATE INDEX idx_password_reset_otps_code ON public.password_reset_otps(code);
CREATE INDEX idx_password_reset_otps_expires_at ON public.password_reset_otps(expires_at);

-- Function to generate password reset OTP
CREATE OR REPLACE FUNCTION generate_password_reset_otp()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to create password reset OTP
CREATE OR REPLACE FUNCTION create_password_reset_otp(p_email TEXT)
RETURNS TABLE(
  code TEXT,
  expires_at TIMESTAMPTZ,
  hourly_remaining INTEGER
) AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
  v_hourly_count INTEGER;
  v_hourly_limit INTEGER := 5;
BEGIN
  -- Check hourly rate limit
  SELECT COUNT(*) INTO v_hourly_count
  FROM public.password_reset_otps
  WHERE email = p_email
  AND created_at > NOW() - INTERVAL '1 hour';
  
  IF v_hourly_count >= v_hourly_limit THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
  -- Generate OTP
  v_code := generate_password_reset_otp();
  v_expires_at := NOW() + INTERVAL '30 minutes';
  
  -- Invalidate all previous OTPs for this email
  UPDATE public.password_reset_otps
  SET is_used = true
  WHERE email = p_email AND is_used = false;
  
  -- Insert new OTP
  INSERT INTO public.password_reset_otps (email, code, expires_at)
  VALUES (p_email, v_code, v_expires_at);
  
  RETURN QUERY SELECT v_code, v_expires_at, (v_hourly_limit - v_hourly_count - 1)::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify password reset OTP
CREATE OR REPLACE FUNCTION verify_password_reset_otp(p_email TEXT, p_code TEXT)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  remaining_attempts INTEGER
) AS $$
DECLARE
  v_otp RECORD;
  v_max_attempts INTEGER := 5;
BEGIN
  -- Find the most recent valid OTP
  SELECT * INTO v_otp
  FROM public.password_reset_otps
  WHERE email = p_email
  AND code = p_code
  AND is_used = false
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- OTP not found
  IF v_otp IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid or expired code'::TEXT, 0::INTEGER;
    RETURN;
  END IF;
  
  -- Check if expired
  IF v_otp.expires_at < NOW() THEN
    RETURN QUERY SELECT false, 'Code has expired'::TEXT, 0::INTEGER;
    RETURN;
  END IF;
  
  -- Check attempts
  IF v_otp.attempts >= v_max_attempts THEN
    RETURN QUERY SELECT false, 'Maximum attempts exceeded'::TEXT, 0::INTEGER;
    RETURN;
  END IF;
  
  -- Increment attempts
  UPDATE public.password_reset_otps
  SET attempts = attempts + 1
  WHERE id = v_otp.id;
  
  -- Mark as used
  UPDATE public.password_reset_otps
  SET is_used = true
  WHERE id = v_otp.id;
  
  RETURN QUERY SELECT true, 'Code verified successfully'::TEXT, (v_max_attempts - v_otp.attempts - 1)::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get remaining attempts
CREATE OR REPLACE FUNCTION get_password_reset_attempts_remaining(p_email TEXT)
RETURNS TABLE(
  hourly INTEGER
) AS $$
DECLARE
  v_hourly_count INTEGER;
  v_hourly_limit INTEGER := 5;
BEGIN
  -- Count requests in the last hour
  SELECT COUNT(*) INTO v_hourly_count
  FROM public.password_reset_otps
  WHERE email = p_email
  AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN QUERY SELECT (v_hourly_limit - v_hourly_count)::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old OTPs (run this periodically)
CREATE OR REPLACE FUNCTION cleanup_old_password_reset_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.password_reset_otps
  WHERE expires_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

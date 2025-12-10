-- Create OTP verification table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_invalidated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  CONSTRAINT valid_code CHECK (code ~ '^\d{6}$')
);

-- Create index for faster lookups
CREATE INDEX idx_otp_user_email ON public.otp_verifications(user_email);
CREATE INDEX idx_otp_created_at ON public.otp_verifications(created_at);
CREATE INDEX idx_otp_expires_at ON public.otp_verifications(expires_at);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies (only backend functions can access)
CREATE POLICY "Service role can manage OTP verifications"
  ON public.otp_verifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to generate a random 6-digit OTP
CREATE OR REPLACE FUNCTION public.generate_otp_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

-- Function to check rate limit (max 5 OTPs per hour)
CREATE OR REPLACE FUNCTION public.check_otp_rate_limit(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM public.otp_verifications
  WHERE user_email = p_email
    AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN v_count < 5;
END;
$$;

-- Function to invalidate previous OTPs for a user
CREATE OR REPLACE FUNCTION public.invalidate_previous_otps(p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.otp_verifications
  SET is_invalidated = TRUE
  WHERE user_email = p_email
    AND is_verified = FALSE
    AND is_invalidated = FALSE;
END;
$$;

-- Function to create new OTP
CREATE OR REPLACE FUNCTION public.create_otp(p_email TEXT)
RETURNS TABLE(code TEXT, expires_at TIMESTAMPTZ, remaining_attempts INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  -- Check rate limit
  IF NOT public.check_otp_rate_limit(p_email) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Maximum 5 OTP requests per hour.';
  END IF;

  -- Invalidate previous OTPs
  PERFORM public.invalidate_previous_otps(p_email);

  -- Generate new code
  v_code := public.generate_otp_code();
  v_expires_at := NOW() + INTERVAL '30 minutes';

  -- Insert new OTP
  INSERT INTO public.otp_verifications (user_email, code, expires_at)
  VALUES (p_email, v_code, v_expires_at);

  -- Count requests in last hour
  SELECT COUNT(*)
  INTO v_count
  FROM public.otp_verifications
  WHERE user_email = p_email
    AND created_at > NOW() - INTERVAL '1 hour';

  RETURN QUERY SELECT v_code, v_expires_at, (5 - v_count) AS remaining_attempts;
END;
$$;

-- Function to verify OTP
CREATE OR REPLACE FUNCTION public.verify_otp(p_email TEXT, p_code TEXT)
RETURNS TABLE(success BOOLEAN, message TEXT, remaining_attempts INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_otp RECORD;
  v_attempts INTEGER;
  v_hourly_count INTEGER;
BEGIN
  -- Find the latest valid OTP for this email
  SELECT *
  INTO v_otp
  FROM public.otp_verifications
  WHERE user_email = p_email
    AND is_verified = FALSE
    AND is_invalidated = FALSE
  ORDER BY created_at DESC
  LIMIT 1;

  -- No OTP found
  IF v_otp IS NULL THEN
    RETURN QUERY SELECT FALSE, 'No verification code found. Please request a new code.', 0;
    RETURN;
  END IF;

  -- Check if expired
  IF v_otp.expires_at < NOW() THEN
    UPDATE public.otp_verifications
    SET is_invalidated = TRUE
    WHERE id = v_otp.id;
    
    RETURN QUERY SELECT FALSE, 'Verification code has expired. Please request a new code.', 0;
    RETURN;
  END IF;

  -- Increment attempt count
  UPDATE public.otp_verifications
  SET attempts = attempts + 1
  WHERE id = v_otp.id
  RETURNING attempts INTO v_attempts;

  -- Check if code matches
  IF v_otp.code = p_code THEN
    UPDATE public.otp_verifications
    SET is_verified = TRUE, verified_at = NOW()
    WHERE id = v_otp.id;
    
    RETURN QUERY SELECT TRUE, 'Verification successful!', 0;
    RETURN;
  ELSE
    -- Code doesn't match
    -- Calculate remaining attempts in current hour
    SELECT COUNT(*)
    INTO v_hourly_count
    FROM public.otp_verifications
    WHERE user_email = p_email
      AND created_at > NOW() - INTERVAL '1 hour';
    
    -- If too many attempts, invalidate
    IF v_attempts >= 5 THEN
      UPDATE public.otp_verifications
      SET is_invalidated = TRUE
      WHERE id = v_otp.id;
      
      RETURN QUERY SELECT FALSE, 'Too many incorrect attempts. Please request a new code.', (5 - v_hourly_count);
      RETURN;
    END IF;
    
    RETURN QUERY SELECT FALSE, 'Invalid verification code. Please try again.', (5 - v_attempts);
    RETURN;
  END IF;
END;
$$;

-- Function to get remaining attempts for a user
CREATE OR REPLACE FUNCTION public.get_otp_attempts_remaining(p_email TEXT)
RETURNS TABLE(remaining_hourly INTEGER, remaining_current INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hourly_count INTEGER;
  v_current_attempts INTEGER;
BEGIN
  -- Count requests in last hour
  SELECT COUNT(*)
  INTO v_hourly_count
  FROM public.otp_verifications
  WHERE user_email = p_email
    AND created_at > NOW() - INTERVAL '1 hour';

  -- Get current OTP attempts
  SELECT COALESCE(attempts, 0)
  INTO v_current_attempts
  FROM public.otp_verifications
  WHERE user_email = p_email
    AND is_verified = FALSE
    AND is_invalidated = FALSE
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN QUERY SELECT (5 - v_hourly_count), (5 - v_current_attempts);
END;
$$;

-- Cleanup function to remove old OTPs (can be run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_otps()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.otp_verifications
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

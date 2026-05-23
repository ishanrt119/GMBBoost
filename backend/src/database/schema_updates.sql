-- ─────────────────────────────────────────────────────────────────────────────
-- Monthly Credit Refill System
-- Run this in your Supabase SQL editor AFTER the main schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add tracking columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS credits_last_refill TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';

-- 2. Function: refill credits for all users whose last refill was 30+ days ago
CREATE OR REPLACE FUNCTION public.monthly_credit_refill()
RETURNS void AS $$
DECLARE
  free_credits  INTEGER := 50;
BEGIN
  UPDATE public.profiles
  SET
    credits            = free_credits,
    credits_last_refill = NOW()
  WHERE
    credits_last_refill < NOW() - INTERVAL '30 days'
    AND plan = 'free';

  RAISE LOG 'monthly_credit_refill: completed at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enable pg_cron extension (run once as superuser in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 4. Schedule the refill to run every day at midnight UTC
--    (it only refills users whose 30 days have elapsed)
SELECT cron.schedule(
  'monthly-credit-refill',   -- job name
  '0 0 * * *',               -- every day at 00:00 UTC
  'SELECT public.monthly_credit_refill()'
);

-- 5. Function: check if a user's credits should be refilled on login/request
--    (fallback in case cron misses a run)
CREATE OR REPLACE FUNCTION public.check_and_refill_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_credits          INTEGER;
  v_last_refill      TIMESTAMPTZ;
  v_plan             TEXT;
  free_credits       INTEGER := 50;
BEGIN
  SELECT credits, credits_last_refill, plan
  INTO v_credits, v_last_refill, v_plan
  FROM public.profiles
  WHERE user_id = p_user_id;

  -- Refill if 30 days have passed since last refill
  IF v_last_refill < NOW() - INTERVAL '30 days' AND v_plan = 'free' THEN
    UPDATE public.profiles
    SET credits = free_credits, credits_last_refill = NOW()
    WHERE user_id = p_user_id;
    RETURN free_credits;
  END IF;

  RETURN v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant execute to service role
GRANT EXECUTE ON FUNCTION public.monthly_credit_refill() TO service_role;
GRANT EXECUTE ON FUNCTION public.check_and_refill_credits(UUID) TO service_role;


-- ── Avatar URL support for Google OAuth ──────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;


-- ── Google OAuth support ──────────────────────────────────────────────────────
-- Run this to add avatar_url column if not already added
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update the auto-create profile trigger to support OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    full_name,
    avatar_url,
    credits,
    credits_last_refill,
    plan
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    50,
    NOW(),
    'free'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── Email Verification Setup ──────────────────────────────────────────────────
-- In Supabase Dashboard → Authentication → Email Templates
-- Set the "Confirm signup" redirect URL to:
-- http://localhost:3000/auth/callback
--
-- In Supabase Dashboard → Authentication → URL Configuration
-- Set Site URL: http://localhost:3000
-- Add Redirect URLs: http://localhost:3000/auth/callback
--
-- This ensures clicking "Verify Email" redirects to your app
-- which then exchanges the session for your JWT automatically.

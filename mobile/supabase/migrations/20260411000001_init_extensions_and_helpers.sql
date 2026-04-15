-- =====================================================================
-- 001 — Extensions, schemas, and shared helper functions
-- Hawaii DOE Financial Literacy Mobile App
-- =====================================================================

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive text for usernames/emails

-- ---------------------------------------------------------------------
-- Generic updated_at trigger function
-- Used by every table that has an updated_at column.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------
-- Role enum
-- The has_role() / current_user_role() helpers that depend on the
-- profiles table are defined in migration 002 after profiles is created.
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('student', 'parent', 'educator', 'admin');
  END IF;
END$$;

-- Age tier values used across the app:
--   under_13 — kids (COPPA)
--   13_17    — teens
--   18_plus  — adults
-- Stored as TEXT + CHECK rather than enum so the existing app code keeps working.

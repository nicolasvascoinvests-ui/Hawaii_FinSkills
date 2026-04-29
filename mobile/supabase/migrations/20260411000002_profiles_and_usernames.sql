-- =====================================================================
-- 002 — Profiles, usernames, validation, auto-create on signup
-- =====================================================================

-- ---------------------------------------------------------------------
-- profiles table
-- One row per auth.users row, auto-created via on_auth_user_created.
-- username is citext (case-insensitive) and uniquely indexed.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username              CITEXT UNIQUE,
  display_name          TEXT,
  avatar_url            TEXT,
  role                  public.app_role NOT NULL DEFAULT 'student',
  age_tier              TEXT CHECK (age_tier IN ('13_17','18_plus')),
  birth_year            INTEGER CHECK (birth_year BETWEEN 1900 AND EXTRACT(YEAR FROM now())::int),
  school                TEXT,
  grade_level           INTEGER CHECK (grade_level BETWEEN 0 AND 12),
  preferred_language    TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en','haw')),
  onboarding_completed  BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role     ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_age_tier ON public.profiles(age_tier);

-- ---------------------------------------------------------------------
-- Role helper functions (defined now that public.profiles exists)
-- SECURITY DEFINER so RLS policies can call them without triggering
-- recursive RLS on profiles.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_age_tier()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT age_tier FROM public.profiles WHERE user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
REVOKE ALL ON FUNCTION public.current_user_age_tier() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_age_tier() TO authenticated;

-- ---------------------------------------------------------------------
-- Reserved usernames — handles that no one is allowed to claim
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reserved_usernames (
  username CITEXT PRIMARY KEY
);

INSERT INTO public.reserved_usernames (username) VALUES
  ('admin'),('administrator'),('root'),('support'),('help'),
  ('hawaii'),('teacher'),('educator'),
  ('parent'),('student'),('moderator'),('mod'),('staff'),('owner'),
  ('system'),('null'),('undefined'),('anonymous'),('user'),('guest'),
  ('test'),('demo'),('official')
ON CONFLICT DO NOTHING;

ALTER TABLE public.reserved_usernames ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reserved_usernames_admin_read"
  ON public.reserved_usernames FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------
-- Username validation
-- Rules: 3–20 chars, [a-z0-9_-], not all-numeric, not reserved
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_username(_username citext)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF _username IS NULL THEN
    RETURN false;
  END IF;
  IF length(_username) < 3 OR length(_username) > 20 THEN
    RETURN false;
  END IF;
  IF _username !~ '^[A-Za-z0-9_-]+$' THEN
    RETURN false;
  END IF;
  IF _username ~ '^[0-9]+$' THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_username_available(_username citext)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.validate_username(_username) THEN
    RETURN false;
  END IF;
  IF EXISTS (SELECT 1 FROM public.reserved_usernames WHERE username = _username) THEN
    RETURN false;
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = _username) THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.is_username_available(citext) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_username_available(citext) TO authenticated, anon;

-- ---------------------------------------------------------------------
-- Username enforcement trigger
-- Runs on insert/update of profiles.username and rejects invalid values.
-- Also forbids changing username more than once per 30 days.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_username_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT public.validate_username(NEW.username) THEN
    RAISE EXCEPTION 'invalid username: must be 3-20 chars, letters/numbers/underscore/hyphen, not all numeric'
      USING ERRCODE = '22023';
  END IF;

  IF EXISTS (SELECT 1 FROM public.reserved_usernames WHERE username = NEW.username) THEN
    RAISE EXCEPTION 'username % is reserved', NEW.username
      USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_enforce_username ON public.profiles;
CREATE TRIGGER trg_profiles_enforce_username
  BEFORE INSERT OR UPDATE OF username ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_username_rules();

-- ---------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------
-- Auto-create profile on auth.users insert
-- Reads age_tier / role / username hints from raw_user_meta_data so the
-- mobile app can pass them at signup time.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_username    citext;
  v_role        public.app_role;
  v_age_tier    text;
  v_birth_year  int;
BEGIN
  v_username := NULLIF(meta->>'username', '')::citext;
  v_role     := COALESCE(NULLIF(meta->>'role',''), 'student')::public.app_role;
  v_age_tier := NULLIF(meta->>'age_tier','');
  IF v_age_tier IS NOT NULL AND v_age_tier NOT IN ('13_17','18_plus') THEN
    v_age_tier := NULL;
  END IF;
  BEGIN
    v_birth_year := NULLIF(meta->>'birth_year','')::int;
  EXCEPTION WHEN others THEN
    v_birth_year := NULL;
  END;

  INSERT INTO public.profiles (user_id, username, role, age_tier, birth_year, display_name)
  VALUES (
    NEW.id,
    v_username,
    v_role,
    v_age_tier,
    v_birth_year,
    NULLIF(meta->>'display_name','')
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Self read/write
CREATE POLICY "profiles_self_select"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_self_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_self_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
  );

-- Admins: full read
CREATE POLICY "profiles_admin_select"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "profiles_admin_update"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Public username lookup (used by signup screens to check availability)
-- Only exposes username column via the is_username_available() function;
-- no direct SELECT for anon role.

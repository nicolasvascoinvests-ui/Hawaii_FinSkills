-- =====================================================================
-- 015 — Server-side length caps + PostgREST rate limiting
-- =====================================================================
-- Zod validates at the client boundary, but a malicious client bypasses
-- that. Add CHECK constraints as a hard server-side cap and a per-user
-- rate limiter for high-risk INSERT paths (class join, submissions).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Length caps on user-controlled text columns
-- ---------------------------------------------------------------------

-- profiles (usernames already capped at 20 by validate_username)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_display_name_len,
  DROP CONSTRAINT IF EXISTS profiles_school_len,
  DROP CONSTRAINT IF EXISTS profiles_avatar_url_len;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_len CHECK (display_name IS NULL OR char_length(display_name) <= 60),
  ADD CONSTRAINT profiles_school_len       CHECK (school       IS NULL OR char_length(school) <= 120),
  ADD CONSTRAINT profiles_avatar_url_len   CHECK (avatar_url   IS NULL OR char_length(avatar_url) <= 2048);

-- classes
ALTER TABLE public.classes
  DROP CONSTRAINT IF EXISTS classes_name_len,
  DROP CONSTRAINT IF EXISTS classes_description_len,
  DROP CONSTRAINT IF EXISTS classes_school_name_len;

ALTER TABLE public.classes
  ADD CONSTRAINT classes_name_len        CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT classes_description_len CHECK (description IS NULL OR char_length(description) <= 500),
  ADD CONSTRAINT classes_school_name_len CHECK (school_name IS NULL OR char_length(school_name) <= 120);

-- assignments
ALTER TABLE public.assignments
  DROP CONSTRAINT IF EXISTS assignments_title_len,
  DROP CONSTRAINT IF EXISTS assignments_description_len;

ALTER TABLE public.assignments
  ADD CONSTRAINT assignments_title_len       CHECK (char_length(title) BETWEEN 1 AND 140),
  ADD CONSTRAINT assignments_description_len CHECK (description IS NULL OR char_length(description) <= 2000);

-- assignment_submissions feedback
ALTER TABLE public.assignment_submissions
  DROP CONSTRAINT IF EXISTS submissions_feedback_len;

ALTER TABLE public.assignment_submissions
  ADD CONSTRAINT submissions_feedback_len CHECK (feedback IS NULL OR char_length(feedback) <= 4000);

-- ---------------------------------------------------------------------
-- Per-user rate limiting
-- ---------------------------------------------------------------------
-- A rolling counter table. Each (user, action, window_start) row counts
-- how many times a user performed an action inside the current window.
-- Triggers on high-risk INSERT paths call enforce_rate_limit() which
-- increments the counter and raises if over the per-window cap.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limit_bucket (
  user_id       UUID NOT NULL,
  action        TEXT NOT NULL,
  window_start  TIMESTAMPTZ NOT NULL,
  count         INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, action, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_bucket_ws
  ON public.rate_limit_bucket(window_start);

-- Internal table; RLS disabled, no API grants.
ALTER TABLE public.rate_limit_bucket DISABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limit_bucket FROM PUBLIC, authenticated, anon;

CREATE OR REPLACE FUNCTION public.enforce_rate_limit(
  _action        text,
  _max_per_window integer,
  _window_seconds integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user  uuid := auth.uid();
  v_ws    timestamptz;
  v_count integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'rate_limit: anonymous call not permitted'
      USING ERRCODE = '42501';
  END IF;

  -- Floor current time to the window bucket.
  v_ws := to_timestamp(
    floor(extract(epoch FROM now()) / _window_seconds) * _window_seconds
  );

  INSERT INTO public.rate_limit_bucket (user_id, action, window_start, count)
  VALUES (v_user, _action, v_ws, 1)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET count = public.rate_limit_bucket.count + 1
  RETURNING count INTO v_count;

  IF v_count > _max_per_window THEN
    RAISE EXCEPTION 'rate limit exceeded for % (max % per %s seconds)',
      _action, _max_per_window, _window_seconds
      USING ERRCODE = 'P0001',
            HINT = 'slow down';
  END IF;

  -- Opportunistic cleanup of very old windows.
  DELETE FROM public.rate_limit_bucket
   WHERE window_start < now() - make_interval(secs => _window_seconds * 10);
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_rate_limit(text, integer, integer) FROM PUBLIC;
-- Only trigger functions (running as postgres) need this; no direct grant.

-- Trigger wrappers for specific actions
CREATE OR REPLACE FUNCTION public.rl_class_member_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.enforce_rate_limit('class_member_insert', 10, 300);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.rl_assignment_submission_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.enforce_rate_limit('assignment_submission_insert', 30, 300);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.rl_user_progress_upsert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.enforce_rate_limit('user_progress_upsert', 120, 60);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_rl_class_member_insert ON public.class_members;
CREATE TRIGGER trg_rl_class_member_insert
  BEFORE INSERT ON public.class_members
  FOR EACH ROW EXECUTE FUNCTION public.rl_class_member_insert();

DROP TRIGGER IF EXISTS trg_rl_assignment_submission_insert ON public.assignment_submissions;
CREATE TRIGGER trg_rl_assignment_submission_insert
  BEFORE INSERT ON public.assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.rl_assignment_submission_insert();

DROP TRIGGER IF EXISTS trg_rl_user_progress_upsert ON public.user_progress;
CREATE TRIGGER trg_rl_user_progress_upsert
  BEFORE INSERT OR UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.rl_user_progress_upsert();

NOTIFY pgrst, 'reload schema';

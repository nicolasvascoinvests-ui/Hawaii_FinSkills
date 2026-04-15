-- =====================================================================
-- 007 — Achievements, badges, streaks, points
-- Server-side awarded only; clients cannot mint badges directly.
-- =====================================================================

-- ---------------------------------------------------------------------
-- achievement_definitions — what badges exist
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  code         TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  icon         TEXT,
  category     TEXT NOT NULL CHECK (category IN ('progress','mastery','streak','engagement','milestone')),
  points       INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  age_tier     TEXT CHECK (age_tier IN ('13_17','18_plus')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievement_definitions_public_read"
  ON public.achievement_definitions FOR SELECT USING (true);

CREATE POLICY "achievement_definitions_admin_all"
  ON public.achievement_definitions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------
-- user_achievements
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_code TEXT NOT NULL REFERENCES public.achievement_definitions(code) ON DELETE CASCADE,
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata        JSONB,
  UNIQUE(user_id, achievement_code)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_achievements_self_select"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_achievements_admin_select"
  ON public.user_achievements FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- No insert/update/delete policies — achievements are awarded only by
-- SECURITY DEFINER functions or admin-side edge functions.

-- ---------------------------------------------------------------------
-- user_streaks — daily learning streak tracking
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak  INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak  INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_active_date DATE,
  total_points    INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_user_streaks_updated_at ON public.user_streaks;
CREATE TRIGGER trg_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_streaks_self_select"
  ON public.user_streaks FOR SELECT
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- record_daily_activity() — call from the app once per session
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_daily_activity()
RETURNS public.user_streaks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := (now() AT TIME ZONE 'Pacific/Honolulu')::date;
  v_row   public.user_streaks;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'must be authenticated';
  END IF;

  INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_active_date)
  VALUES (auth.uid(), 1, 1, v_today)
  ON CONFLICT (user_id) DO UPDATE
  SET current_streak = CASE
        WHEN public.user_streaks.last_active_date = v_today THEN public.user_streaks.current_streak
        WHEN public.user_streaks.last_active_date = v_today - 1 THEN public.user_streaks.current_streak + 1
        ELSE 1
      END,
      longest_streak = GREATEST(
        public.user_streaks.longest_streak,
        CASE
          WHEN public.user_streaks.last_active_date = v_today THEN public.user_streaks.current_streak
          WHEN public.user_streaks.last_active_date = v_today - 1 THEN public.user_streaks.current_streak + 1
          ELSE 1
        END
      ),
      last_active_date = v_today
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.record_daily_activity() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_daily_activity() TO authenticated;

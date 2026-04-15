-- =====================================================================
-- 005 — User progress, standard mastery, quiz attempts
-- Quiz attempts auto-update standard_mastery via trigger.
-- =====================================================================

-- ---------------------------------------------------------------------
-- user_progress
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id     UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  score         INTEGER CHECK (score BETWEEN 0 AND 100),
  attempts      INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user   ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson ON public.user_progress(lesson_id);

DROP TRIGGER IF EXISTS trg_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER trg_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_progress_self_select"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_progress_self_insert"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_self_update"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "user_progress_admin_select"
  ON public.user_progress FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------
-- standard_mastery — per user, per DOE standard
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.standard_mastery (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  standard_code     TEXT NOT NULL REFERENCES public.doe_standards(code),
  mastery_level     INTEGER NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 100),
  attempts          INTEGER NOT NULL DEFAULT 0,
  correct_count     INTEGER NOT NULL DEFAULT 0,
  total_questions   INTEGER NOT NULL DEFAULT 0,
  last_assessed_at  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, standard_code)
);

CREATE INDEX IF NOT EXISTS idx_standard_mastery_user     ON public.standard_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_standard_mastery_standard ON public.standard_mastery(standard_code);

DROP TRIGGER IF EXISTS trg_standard_mastery_updated_at ON public.standard_mastery;
CREATE TRIGGER trg_standard_mastery_updated_at
  BEFORE UPDATE ON public.standard_mastery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.standard_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "standard_mastery_self_select"
  ON public.standard_mastery FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "standard_mastery_admin_select"
  ON public.standard_mastery FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Mastery is written exclusively by the trigger below; no client-side write policy.

-- ---------------------------------------------------------------------
-- quiz_attempts
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id         UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  score             INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  total_questions   INTEGER NOT NULL DEFAULT 0 CHECK (total_questions >= 0),
  total_correct     INTEGER NOT NULL DEFAULT 0 CHECK (total_correct >= 0),
  answers           JSONB NOT NULL DEFAULT '[]'::jsonb,
  per_standard      JSONB NOT NULL DEFAULT '{}'::jsonb,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_taken_seconds >= 0),
  completed_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_lesson ON public.quiz_attempts(user_id, lesson_id);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_attempts_self_select"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "quiz_attempts_self_insert"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_attempts_admin_select"
  ON public.quiz_attempts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------
-- After a quiz attempt, fold per-standard results into standard_mastery.
-- per_standard is expected to be {"EI-1": {"correct": 3, "total": 4}, ...}
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_quiz_attempt_to_mastery()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec     RECORD;
  v_correct integer;
  v_total   integer;
BEGIN
  IF NEW.per_standard IS NULL OR jsonb_typeof(NEW.per_standard) <> 'object' THEN
    RETURN NEW;
  END IF;

  FOR rec IN SELECT key AS standard_code, value AS data FROM jsonb_each(NEW.per_standard) LOOP
    v_correct := COALESCE((rec.data->>'correct')::int, 0);
    v_total   := COALESCE((rec.data->>'total')::int, 0);

    IF v_total = 0 THEN
      CONTINUE;
    END IF;

    -- Skip unknown standards (defensive)
    IF NOT EXISTS (SELECT 1 FROM public.doe_standards WHERE code = rec.standard_code) THEN
      CONTINUE;
    END IF;

    INSERT INTO public.standard_mastery (
      user_id, standard_code, mastery_level, attempts,
      correct_count, total_questions, last_assessed_at
    ) VALUES (
      NEW.user_id, rec.standard_code,
      LEAST(100, GREATEST(0, ROUND((v_correct::numeric / v_total) * 100)::int)),
      1, v_correct, v_total, NEW.completed_at
    )
    ON CONFLICT (user_id, standard_code) DO UPDATE
    SET correct_count    = public.standard_mastery.correct_count    + EXCLUDED.correct_count,
        total_questions  = public.standard_mastery.total_questions  + EXCLUDED.total_questions,
        attempts         = public.standard_mastery.attempts + 1,
        last_assessed_at = EXCLUDED.last_assessed_at,
        mastery_level    = LEAST(100, GREATEST(0,
          ROUND(
            ((public.standard_mastery.correct_count + EXCLUDED.correct_count)::numeric
             / NULLIF(public.standard_mastery.total_questions + EXCLUDED.total_questions, 0)) * 100
          )::int
        ));
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quiz_attempt_apply_mastery ON public.quiz_attempts;
CREATE TRIGGER trg_quiz_attempt_apply_mastery
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.apply_quiz_attempt_to_mastery();

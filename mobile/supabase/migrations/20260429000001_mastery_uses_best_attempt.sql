-- =====================================================================
-- Mastery uses BEST attempt, not cumulative average
-- =====================================================================
-- Bug: mastery_level was computed as
--   (sum_correct / sum_total) * 100
-- across every attempt. A learner who failed once then aced a quiz
-- still sat at ~75 %, never crossing the 80 % "mastered" threshold —
-- so the certificate logic (best lesson score = 100) said "aced" while
-- the Learn-screen counter and Struggalo HP still said "not mastered".
--
-- Fix: mastery_level is now the BEST per-standard percentage ever
-- demonstrated. Cumulative correct_count / total_questions are still
-- summed for analytics. Backfill existing rows from quiz_attempts.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.apply_quiz_attempt_to_mastery()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec       RECORD;
  v_correct integer;
  v_total   integer;
  v_pct     integer;
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

    IF NOT EXISTS (SELECT 1 FROM public.standards WHERE code = rec.standard_code) THEN
      CONTINUE;
    END IF;

    v_pct := LEAST(100, GREATEST(0, ROUND((v_correct::numeric / v_total) * 100)::int));

    INSERT INTO public.standard_mastery (
      user_id, standard_code, mastery_level, attempts,
      correct_count, total_questions, last_assessed_at
    ) VALUES (
      NEW.user_id, rec.standard_code, v_pct,
      1, v_correct, v_total, NEW.completed_at
    )
    ON CONFLICT (user_id, standard_code) DO UPDATE
    SET correct_count    = public.standard_mastery.correct_count   + EXCLUDED.correct_count,
        total_questions  = public.standard_mastery.total_questions + EXCLUDED.total_questions,
        attempts         = public.standard_mastery.attempts + 1,
        last_assessed_at = EXCLUDED.last_assessed_at,
        mastery_level    = GREATEST(public.standard_mastery.mastery_level, EXCLUDED.mastery_level);
  END LOOP;

  RETURN NEW;
END;
$$;

-- Backfill: lift mastery_level to the best historical attempt per standard.
WITH best_per_standard AS (
  SELECT
    qa.user_id,
    sd.key AS standard_code,
    MAX(
      LEAST(100, GREATEST(0,
        ROUND(((sd.value->>'correct')::numeric
               / NULLIF((sd.value->>'total')::numeric, 0)) * 100)::int
      ))
    ) AS best_pct
  FROM public.quiz_attempts qa
  CROSS JOIN LATERAL jsonb_each(qa.per_standard) AS sd
  WHERE jsonb_typeof(qa.per_standard) = 'object'
    AND COALESCE((sd.value->>'total')::int, 0) > 0
  GROUP BY qa.user_id, sd.key
)
UPDATE public.standard_mastery sm
SET mastery_level = bps.best_pct
FROM best_per_standard bps
WHERE sm.user_id = bps.user_id
  AND sm.standard_code = bps.standard_code
  AND bps.best_pct > sm.mastery_level
  AND EXISTS (SELECT 1 FROM public.standards s WHERE s.code = bps.standard_code);

NOTIFY pgrst, 'reload schema';

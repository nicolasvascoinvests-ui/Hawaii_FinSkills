-- =====================================================================
-- 004 — Courses, lessons, and quiz questions
-- All content tables map to Hawaiʻi Financial Literacy standard codes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Standards reference table — populated in seed.sql
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.standards (
  code        TEXT PRIMARY KEY,
  theme_key   TEXT NOT NULL CHECK (theme_key IN ('earning_income','spending','saving','investing','managing_credit','managing_risk')),
  theme_label TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.standards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "standards_public_read"
  ON public.standards FOR SELECT
  USING (true);

-- ---------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT UNIQUE,
  title               TEXT NOT NULL,
  description         TEXT,
  theme               TEXT NOT NULL CHECK (theme IN ('earning_income','spending','saving','investing','managing_credit','managing_risk')),
  age_tier            TEXT CHECK (age_tier IN ('13_17','18_plus')),
  difficulty          TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  cover_image_url     TEXT,
  estimated_minutes   INTEGER NOT NULL DEFAULT 0 CHECK (estimated_minutes >= 0),
  order_index         INTEGER NOT NULL DEFAULT 0,
  standards_covered   TEXT[] NOT NULL DEFAULT '{}',
  is_published        BOOLEAN NOT NULL DEFAULT false,
  created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_theme      ON public.courses(theme);
CREATE INDEX IF NOT EXISTS idx_courses_age_tier   ON public.courses(age_tier);
CREATE INDEX IF NOT EXISTS idx_courses_published  ON public.courses(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_courses_standards  ON public.courses USING GIN (standards_covered);

DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_published_read"
  ON public.courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "courses_admin_all"
  ON public.courses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------
-- lessons
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lessons (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id           UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  slug                TEXT,
  title               TEXT NOT NULL,
  description         TEXT,
  lesson_type         TEXT NOT NULL DEFAULT 'reading' CHECK (lesson_type IN ('reading','video','interactive','quiz','simulation')),
  content             JSONB NOT NULL DEFAULT '{"sections":[]}'::jsonb,
  duration_minutes    INTEGER NOT NULL DEFAULT 0 CHECK (duration_minutes >= 0),
  order_index         INTEGER NOT NULL DEFAULT 0,
  standards_covered   TEXT[] NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_course    ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_standards ON public.lessons USING GIN (standards_covered);

DROP TRIGGER IF EXISTS trg_lessons_updated_at ON public.lessons;
CREATE TRIGGER trg_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lessons_published_read"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = lessons.course_id AND c.is_published = true
    )
  );

CREATE POLICY "lessons_admin_all"
  ON public.lessons FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------
-- quiz_questions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  question_type   TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice','true_false','fill_in','drag_match','matching','numeric')),
  question_text   TEXT NOT NULL,
  options         JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer  TEXT NOT NULL,
  explanation     TEXT,
  standard_code   TEXT NOT NULL REFERENCES public.standards(code),
  difficulty      TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  order_index     INTEGER NOT NULL DEFAULT 0,
  points          INTEGER NOT NULL DEFAULT 1 CHECK (points > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson   ON public.quiz_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_standard ON public.quiz_questions(standard_code);

DROP TRIGGER IF EXISTS trg_quiz_questions_updated_at ON public.quiz_questions;
CREATE TRIGGER trg_quiz_questions_updated_at
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_questions_published_read"
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON c.id = l.course_id
      WHERE l.id = quiz_questions.lesson_id AND c.is_published = true
    )
  );

CREATE POLICY "quiz_questions_admin_all"
  ON public.quiz_questions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

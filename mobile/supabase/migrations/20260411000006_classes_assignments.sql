-- =====================================================================
-- 006 — Classes, class members, assignments, submissions
-- Cross-table RLS lets educators see their students' work, and adds
-- educator/parent visibility into profiles, progress, and mastery.
-- =====================================================================

-- ---------------------------------------------------------------------
-- classes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  educator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  school_name TEXT,
  grade_level INTEGER CHECK (grade_level BETWEEN 0 AND 12),
  join_code   TEXT NOT NULL UNIQUE DEFAULT upper(substr(md5(random()::text), 1, 6)),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classes_educator ON public.classes(educator_id);

DROP TRIGGER IF EXISTS trg_classes_updated_at ON public.classes;
CREATE TRIGGER trg_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classes_educator_all"
  ON public.classes FOR ALL
  USING (
    auth.uid() = educator_id
    AND public.has_role(auth.uid(), 'educator')
  )
  WITH CHECK (
    auth.uid() = educator_id
    AND public.has_role(auth.uid(), 'educator')
  );

CREATE POLICY "classes_admin_all"
  ON public.classes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------
-- class_members
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.class_members (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id  UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_class_members_user  ON public.class_members(user_id);
CREATE INDEX IF NOT EXISTS idx_class_members_class ON public.class_members(class_id);

ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- helper to break circular RLS between classes & class_members
CREATE OR REPLACE FUNCTION public.is_member_of_class(_class_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_members
    WHERE class_id = _class_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.educator_owns_class(_class_id uuid, _educator_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = _class_id AND educator_id = _educator_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_member_of_class(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_member_of_class(uuid, uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.educator_owns_class(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.educator_owns_class(uuid, uuid) TO authenticated;

-- Students join (insert) themselves
CREATE POLICY "class_members_self_join"
  ON public.class_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Students see their own memberships
CREATE POLICY "class_members_self_select"
  ON public.class_members FOR SELECT
  USING (auth.uid() = user_id);

-- Students leave their own memberships
CREATE POLICY "class_members_self_delete"
  ON public.class_members FOR DELETE
  USING (auth.uid() = user_id);

-- Educators see / remove members of classes they own
CREATE POLICY "class_members_educator_select"
  ON public.class_members FOR SELECT
  USING (public.educator_owns_class(class_id, auth.uid()));

CREATE POLICY "class_members_educator_delete"
  ON public.class_members FOR DELETE
  USING (public.educator_owns_class(class_id, auth.uid()));

-- Students can see a class they belong to
CREATE POLICY "classes_member_select"
  ON public.classes FOR SELECT
  USING (public.is_member_of_class(id, auth.uid()));

-- ---------------------------------------------------------------------
-- assignments
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id          UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  course_id         UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  due_date          TIMESTAMPTZ,
  standards_covered TEXT[] NOT NULL DEFAULT '{}',
  created_by        UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);

DROP TRIGGER IF EXISTS trg_assignments_updated_at ON public.assignments;
CREATE TRIGGER trg_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignments_educator_manage"
  ON public.assignments FOR ALL
  USING (public.educator_owns_class(class_id, auth.uid()))
  WITH CHECK (public.educator_owns_class(class_id, auth.uid()));

CREATE POLICY "assignments_member_select"
  ON public.assignments FOR SELECT
  USING (public.is_member_of_class(class_id, auth.uid()));

-- ---------------------------------------------------------------------
-- assignment_submissions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','submitted','graded','returned')),
  score         INTEGER CHECK (score BETWEEN 0 AND 100),
  feedback      TEXT,
  submitted_at  TIMESTAMPTZ,
  graded_at     TIMESTAMPTZ,
  graded_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_user       ON public.assignment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.assignment_submissions(assignment_id);

DROP TRIGGER IF EXISTS trg_submissions_updated_at ON public.assignment_submissions;
CREATE TRIGGER trg_submissions_updated_at
  BEFORE UPDATE ON public.assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submissions_self_all"
  ON public.assignment_submissions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "submissions_educator_select"
  ON public.assignment_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_submissions.assignment_id
        AND public.educator_owns_class(a.class_id, auth.uid())
    )
  );

CREATE POLICY "submissions_educator_grade"
  ON public.assignment_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_submissions.assignment_id
        AND public.educator_owns_class(a.class_id, auth.uid())
    )
  );

-- ---------------------------------------------------------------------
-- Educator visibility into student profiles, progress, and mastery
-- (FERPA-scoped: only students in classes they own)
-- ---------------------------------------------------------------------
CREATE POLICY "profiles_educator_select_class_members"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_members cm
      JOIN public.classes c ON c.id = cm.class_id
      WHERE cm.user_id = profiles.user_id AND c.educator_id = auth.uid()
    )
  );

CREATE POLICY "user_progress_educator_select_class_members"
  ON public.user_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_members cm
      JOIN public.classes c ON c.id = cm.class_id
      WHERE cm.user_id = user_progress.user_id AND c.educator_id = auth.uid()
    )
  );

CREATE POLICY "standard_mastery_educator_select_class_members"
  ON public.standard_mastery FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_members cm
      JOIN public.classes c ON c.id = cm.class_id
      WHERE cm.user_id = standard_mastery.user_id AND c.educator_id = auth.uid()
    )
  );


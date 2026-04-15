-- =====================================================================
-- 008 — FERPA audit log
-- Append-only, admin-only read. Triggers on sensitive tables write
-- automatic audit rows for create / update / delete events.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acting_role   TEXT,
  action        TEXT NOT NULL CHECK (action IN ('view','create','update','delete')),
  resource_type TEXT NOT NULL,
  resource_id   UUID,
  metadata      JSONB,
  ip_address    INET,
  user_agent    TEXT,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user        ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource    ON public.audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_occurred_at ON public.audit_log(occurred_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Authenticated users can append their own rows (used by app-level logging)
CREATE POLICY "audit_log_self_insert"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can read
CREATE POLICY "audit_log_admin_select"
  ON public.audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Append-only by design — no UPDATE / DELETE policies.
-- Even admins cannot rewrite the log via PostgREST.

-- ---------------------------------------------------------------------
-- Generic auto-audit trigger for sensitive tables
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.write_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action     text;
  v_resource_id uuid;
  v_meta jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_resource_id := (row_to_json(NEW)::jsonb->>'id')::uuid;
    v_meta := jsonb_build_object('table', TG_TABLE_NAME, 'new', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_resource_id := (row_to_json(NEW)::jsonb->>'id')::uuid;
    v_meta := jsonb_build_object('table', TG_TABLE_NAME);
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_resource_id := (row_to_json(OLD)::jsonb->>'id')::uuid;
    v_meta := jsonb_build_object('table', TG_TABLE_NAME, 'old', to_jsonb(OLD));
  END IF;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata, occurred_at)
  VALUES (auth.uid(), v_action, TG_TABLE_NAME, v_resource_id, v_meta, now());

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach to sensitive tables
DROP TRIGGER IF EXISTS trg_audit_profiles ON public.profiles;
CREATE TRIGGER trg_audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.write_audit_event();

DROP TRIGGER IF EXISTS trg_audit_user_progress ON public.user_progress;
CREATE TRIGGER trg_audit_user_progress
  AFTER INSERT OR UPDATE OR DELETE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.write_audit_event();

DROP TRIGGER IF EXISTS trg_audit_quiz_attempts ON public.quiz_attempts;
CREATE TRIGGER trg_audit_quiz_attempts
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.write_audit_event();

DROP TRIGGER IF EXISTS trg_audit_assignment_submissions ON public.assignment_submissions;
CREATE TRIGGER trg_audit_assignment_submissions
  AFTER INSERT OR UPDATE OR DELETE ON public.assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.write_audit_event();

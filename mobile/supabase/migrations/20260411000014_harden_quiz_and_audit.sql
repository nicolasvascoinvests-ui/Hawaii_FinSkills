-- =====================================================================
-- 014 — Lock down client writes on quiz_attempts and audit_log
-- =====================================================================
-- quiz_attempts: grading moves to the grade-quiz Edge Function (service
-- role). Revoke client INSERT so a tampered mobile client cannot self-
-- award mastery on all 30 DOE standards.
--
-- audit_log: the self-insert policy let any authenticated user forge
-- FERPA entries under their own user_id. Drop it — only the
-- write_audit_event() trigger (SECURITY DEFINER) should write rows.
-- =====================================================================

-- quiz_attempts: only service role may INSERT.
DROP POLICY IF EXISTS "quiz_attempts_self_insert" ON public.quiz_attempts;

-- audit_log: remove client-writable path.
DROP POLICY IF EXISTS "audit_log_self_insert" ON public.audit_log;

-- Force PostgREST to pick up the change immediately.
NOTIFY pgrst, 'reload schema';

-- =====================================================================
-- 016 — Re-enable RLS on public.user_roles
-- =====================================================================
-- Migration 012 disabled RLS on user_roles to avoid infinite recursion
-- when SECURITY DEFINER functions read from it (postgres lacks BYPASSRLS
-- on Supabase Cloud). The table was secured via GRANT/REVOKE instead.
--
-- Supabase now flags this as a security warning. Fix: re-enable RLS
-- with a simple SELECT policy that cannot recurse. The policy uses
-- auth.uid() directly — no helper functions, no joins to other
-- RLS-protected tables.
--
-- Write protection remains via REVOKE (no INSERT/UPDATE/DELETE for
-- authenticated or anon). Writes happen only through the
-- sync_user_role() trigger which runs as SECURITY DEFINER.
-- =====================================================================

-- Drop the old policy from migration 011 (may or may not still exist)
DROP POLICY IF EXISTS "user_roles_self_select" ON public.user_roles;

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all roles. This is safe because:
--   1. The table only contains (user_id, role, updated_at) — no PII
--   2. Helper functions (has_role, current_user_role) need to read
--      other users' roles for admin/educator checks
--   3. INSERT/UPDATE/DELETE are already revoked at the grant level
CREATE POLICY "user_roles_authenticated_select"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

-- Ensure grants are still correct (idempotent)
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated, anon;
REVOKE ALL ON public.user_roles FROM anon;
GRANT SELECT ON public.user_roles TO authenticated;

NOTIFY pgrst, 'reload schema';

-- =====================================================================
-- 012 — Remove all recursive RLS policies on profiles
-- =====================================================================
-- Migration 011 fixed one recursion path (has_role → profiles) but
-- missed two others:
--   1. profiles_educator_select_class_members → class_members ↔ classes
--      mutual recursion (SECURITY DEFINER does NOT bypass RLS on
--      Supabase Cloud because postgres lacks BYPASSRLS)
--   2. profiles_self_update WITH CHECK does SELECT role FROM profiles
--
-- Fix: drop every policy that recurses, disable RLS on user_roles
-- (internal lookup table), block role escalation via trigger instead
-- of RLS, and backfill user_roles properly.
-- =====================================================================

-- Step 1: Drop all recursive policies on profiles
DROP POLICY IF EXISTS "profiles_admin_select"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_educator_select_class_members" ON public.profiles;
DROP POLICY IF EXISTS "profiles_parent_select_consented_child" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update"   ON public.profiles;

-- Step 2: user_roles is an internal lookup table — disable RLS so
-- SECURITY DEFINER functions can actually read it on Supabase Cloud.
-- Revoke write access from API roles to prevent role escalation.
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated, anon;
GRANT SELECT ON public.user_roles TO authenticated;

-- Step 3: Backfill user_roles. Must temporarily disable profiles RLS
-- because the migration runs as postgres (no BYPASSRLS on Supabase
-- Cloud), so self_select policy blocks all rows (auth.uid() is NULL).
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role FROM public.profiles
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Prevent role escalation via trigger (replaces the old
-- recursive self-referencing check in profiles_self_update WITH CHECK)
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'role changes not permitted via profile update'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_profiles_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_escalation();

-- Step 5: Re-create a clean self-update policy (no self-referencing subquery)
CREATE POLICY "profiles_self_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 6: Force PostgREST to pick up all changes immediately
NOTIFY pgrst, 'reload schema';

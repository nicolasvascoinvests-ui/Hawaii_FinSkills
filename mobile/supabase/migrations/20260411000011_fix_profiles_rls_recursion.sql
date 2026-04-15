-- =====================================================================
-- 011 — Fix infinite RLS recursion on public.profiles
-- =====================================================================
-- The has_role() / current_user_role() helpers in migration 002 queried
-- public.profiles from within an RLS policy on public.profiles itself.
-- On Supabase Cloud the postgres role does not have BYPASSRLS, so
-- SECURITY DEFINER alone is not enough: every profile SELECT re-enters
-- the admin_select policy, which calls has_role, which SELECTs profiles,
-- which evaluates the admin_select policy again — infinite recursion,
-- returned to clients as HTTP 500.
--
-- Fix: move role lookups to a dedicated public.user_roles table that is
-- never touched by a recursive policy. The helper functions keep the
-- same signature so every call site in migrations 002–010 stays valid.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL DEFAULT 'student',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role FROM public.profiles
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_self_select" ON public.user_roles;
CREATE POLICY "user_roles_self_select"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies: user_roles is written only by the
-- sync trigger below (SECURITY DEFINER, bypasses RLS via table ownership).

CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, updated_at)
  VALUES (NEW.user_id, NEW.role, now())
  ON CONFLICT (user_id) DO UPDATE
    SET role = EXCLUDED.role,
        updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_sync_user_role ON public.profiles;
CREATE TRIGGER trg_profiles_sync_user_role
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role();

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

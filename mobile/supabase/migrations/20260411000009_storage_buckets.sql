-- =====================================================================
-- 009 — Storage buckets and policies
-- avatars        — public read, authenticated own write
-- course-content — authenticated read, admin write
-- =====================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('course-content', 'course-content', false)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- avatars: public read, owner-write under {user_id}/...
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "avatars_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_insert"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_update"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_delete"  ON storage.objects;

CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------
-- course-content: any authenticated user can read; only admins write
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "course_content_auth_read"  ON storage.objects;
DROP POLICY IF EXISTS "course_content_admin_write" ON storage.objects;
DROP POLICY IF EXISTS "course_content_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "course_content_admin_delete" ON storage.objects;

CREATE POLICY "course_content_auth_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'course-content'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "course_content_admin_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'course-content'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "course_content_admin_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'course-content'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "course_content_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'course-content'
    AND public.has_role(auth.uid(), 'admin')
  );


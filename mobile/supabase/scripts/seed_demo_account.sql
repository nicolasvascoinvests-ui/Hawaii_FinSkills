-- =====================================================================
-- Demo account seed — FinSkill Path
-- =====================================================================
--
-- Creates a ready-to-use demo login so reviewers can try the app
-- before purchase. Email confirmation is bypassed (email_confirmed_at
-- is set at insert time).
--
--   Email:    Admin@useraccount.com
--   Password: 123Admin!
--
-- How to run (pick one):
--   A) Supabase Dashboard -> SQL Editor -> New query -> paste this file
--      -> Run.
--   B) CLI (from repo /mobile dir, with project linked):
--      supabase db query --linked --file supabase/scripts/seed_demo_account.sql
--
-- Idempotent — re-running deletes the previous demo user (and all their
-- data, via ON DELETE CASCADE) and recreates them cleanly.
--
-- Implementation note:
--   We set session_replication_role='replica' during the seed so
--   user-defined triggers (rate limiters, username enforcement, etc.)
--   do not fire — those triggers assume an authenticated session, which
--   does not exist when the script runs via CLI or the SQL Editor.
--   Because that also skips the on_auth_user_created trigger, we insert
--   the profiles row manually.
-- =====================================================================

DO $demo$
DECLARE
  demo_email    text := 'Admin@useraccount.com';
  demo_password text := '123Admin!';
  demo_user_id  uuid := 'd0000000-0000-4000-8000-000000000001';
  hashed_pw     text;
BEGIN
  -- Clean slate: cascades remove old profile/progress/mastery/etc.
  DELETE FROM auth.users WHERE lower(email) = lower(demo_email);

  hashed_pw := crypt(demo_password, gen_salt('bf'));

  -- Skip user-defined triggers (rate limiters, username enforcement,
  -- updated_at, on_auth_user_created) for the duration of this block.
  SET LOCAL session_replication_role = 'replica';

  -- -------------------------------------------------------------------
  -- auth.users — the actual login record. email_confirmed_at = now()
  -- is what bypasses the confirmation-email flow.
  -- -------------------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    demo_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    demo_email,
    hashed_pw,
    now(),
    jsonb_build_object('provider','email','providers', jsonb_build_array('email')),
    jsonb_build_object('display_name','Demo User','age_tier','18_plus'),
    now(), now(), '', '', '', ''
  );

  -- -------------------------------------------------------------------
  -- auth.identities — links the email provider to the user. Required
  -- for password login to succeed.
  -- -------------------------------------------------------------------
  INSERT INTO auth.identities (
    id, user_id, provider_id, provider, identity_data,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    demo_user_id,
    demo_user_id::text,
    'email',
    jsonb_build_object('sub', demo_user_id::text, 'email', demo_email, 'email_verified', true),
    now(), now(), now()
  );

  -- -------------------------------------------------------------------
  -- public.profiles — normally auto-populated by the
  -- on_auth_user_created trigger, but that trigger is skipped while
  -- session_replication_role = 'replica', so insert it explicitly.
  -- -------------------------------------------------------------------
  INSERT INTO public.profiles
    (user_id, username, display_name, role, age_tier, birth_year,
     preferred_language, onboarding_completed, created_at, updated_at)
  VALUES
    (demo_user_id, 'demo_user', 'Demo User', 'student', '18_plus', 1990,
     'en', true, now(), now());

  -- -------------------------------------------------------------------
  -- Seed realistic progress: first two lessons of "Earning Income 101"
  -- completed, third in progress. Lesson IDs come from migration 0013.
  -- -------------------------------------------------------------------
  INSERT INTO public.user_progress
    (user_id, lesson_id, status, score, attempts, time_spent_seconds, started_at, completed_at)
  VALUES
    (demo_user_id, 'a0000001-0001-0000-0000-000000000001', 'completed',    92, 1,  540, now() - interval '6 days', now() - interval '6 days'),
    (demo_user_id, 'a0000001-0002-0000-0000-000000000001', 'completed',    88, 2,  720, now() - interval '4 days', now() - interval '3 days'),
    (demo_user_id, 'a0000001-0003-0000-0000-000000000001', 'in_progress', NULL, 1,  180, now() - interval '1 day',  NULL);

  -- -------------------------------------------------------------------
  -- Standard mastery — a spread across themes so the dashboard shows
  -- real movement on the 30-standard tracker.
  -- -------------------------------------------------------------------
  INSERT INTO public.standard_mastery
    (user_id, standard_code, mastery_level, attempts, correct_count, total_questions, last_assessed_at)
  VALUES
    (demo_user_id, 'EI-1', 92, 1, 11, 12, now() - interval '6 days'),
    (demo_user_id, 'EI-2', 88, 2,  8, 10, now() - interval '3 days'),
    (demo_user_id, 'SP-2', 75, 1,  6,  8, now() - interval '2 days'),
    (demo_user_id, 'SV-1', 60, 1,  3,  5, now() - interval '2 days'),
    (demo_user_id, 'SV-3', 40, 1,  2,  5, now() - interval '1 day');

  -- -------------------------------------------------------------------
  -- A couple of earned badges (codes come from migration 0010 seed).
  -- -------------------------------------------------------------------
  INSERT INTO public.user_achievements (user_id, achievement_code, earned_at)
  VALUES
    (demo_user_id, 'first_lesson', now() - interval '6 days'),
    (demo_user_id, 'first_quiz',   now() - interval '6 days'),
    (demo_user_id, 'streak_3',     now() - interval '3 days');

  -- -------------------------------------------------------------------
  -- Streak + points so the home screen has a visible streak number.
  -- -------------------------------------------------------------------
  INSERT INTO public.user_streaks
    (user_id, current_streak, longest_streak, last_active_date, total_points)
  VALUES
    (demo_user_id, 4, 4, CURRENT_DATE, 45);

  RAISE NOTICE 'Demo account ready: % (id %)', demo_email, demo_user_id;
END
$demo$;

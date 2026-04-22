-- =====================================================================
-- Demo account seed — Hawaii DOE Financial Literacy app
-- =====================================================================
--
-- Creates a ready-to-use demo login for the DOE client to try the app
-- before purchase. Email confirmation is bypassed (email_confirmed_at
-- is set at insert time).
--
--   Email:    Admin@useraccount.com
--   Password: 123useraccount
--
-- How to run:
--   Supabase Dashboard -> SQL Editor -> New query -> paste this file ->
--   Run. It is idempotent — re-running deletes the previous demo user
--   (and all their data, via ON DELETE CASCADE) and recreates them
--   cleanly.
--
-- Notes:
--   * Role stays 'student' so the demo experience matches a real user.
--   * Some lesson progress, standard mastery, achievements, and a
--     streak are seeded so the dashboard is not empty on first login.
--   * The email is not real — do not rely on password reset emails.
--     To rotate the password, just re-run this script with a new value
--     in the `demo_password` variable below.
-- =====================================================================

DO $demo$
DECLARE
  demo_email    text := 'Admin@useraccount.com';
  demo_password text := '123useraccount';
  demo_user_id  uuid := 'd0000000-0000-4000-8000-000000000001';
  hashed_pw     text;
BEGIN
  -- Clean slate: cascades remove old profile/progress/mastery/etc.
  DELETE FROM auth.users WHERE lower(email) = lower(demo_email);

  hashed_pw := crypt(demo_password, gen_salt('bf'));

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
    jsonb_build_object('display_name','DOE Demo','age_tier','18_plus'),
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
  -- The on_auth_user_created trigger has already inserted a profile
  -- row. Fill in the demo-friendly fields. 'admin' / 'demo' usernames
  -- are reserved, so we use 'doe_demo'.
  -- -------------------------------------------------------------------
  UPDATE public.profiles
     SET username             = 'doe_demo',
         display_name         = 'DOE Demo',
         age_tier             = '18_plus',
         birth_year           = 1990,
         preferred_language   = 'en',
         onboarding_completed = true
   WHERE user_id = demo_user_id;

  -- -------------------------------------------------------------------
  -- Seed realistic progress: first two lessons of "Earning Income 101"
  -- completed, third in progress. Lesson IDs come from migration 0013.
  -- -------------------------------------------------------------------
  INSERT INTO public.user_progress
    (user_id, lesson_id, status, score, attempts, time_spent_seconds, started_at, completed_at)
  VALUES
    (demo_user_id, 'a0000001-0001-0000-0000-000000000001', 'completed',    92, 1,  540, now() - interval '6 days', now() - interval '6 days'),
    (demo_user_id, 'a0000001-0002-0000-0000-000000000001', 'completed',    88, 2,  720, now() - interval '4 days', now() - interval '3 days'),
    (demo_user_id, 'a0000001-0003-0000-0000-000000000001', 'in_progress', NULL, 1,  180, now() - interval '1 day',  NULL)
  ON CONFLICT (user_id, lesson_id) DO NOTHING;

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
    (demo_user_id, 'SV-3', 40, 1,  2,  5, now() - interval '1 day')
  ON CONFLICT (user_id, standard_code) DO NOTHING;

  -- -------------------------------------------------------------------
  -- A couple of earned badges (codes come from migration 0010 seed).
  -- -------------------------------------------------------------------
  INSERT INTO public.user_achievements (user_id, achievement_code, earned_at)
  VALUES
    (demo_user_id, 'first_lesson', now() - interval '6 days'),
    (demo_user_id, 'first_quiz',   now() - interval '6 days'),
    (demo_user_id, 'streak_3',     now() - interval '3 days')
  ON CONFLICT (user_id, achievement_code) DO NOTHING;

  -- -------------------------------------------------------------------
  -- Streak + points so the home screen has a visible streak number.
  -- -------------------------------------------------------------------
  INSERT INTO public.user_streaks
    (user_id, current_streak, longest_streak, last_active_date, total_points)
  VALUES
    (demo_user_id, 4, 4, CURRENT_DATE, 45)
  ON CONFLICT (user_id) DO UPDATE
    SET current_streak   = EXCLUDED.current_streak,
        longest_streak   = EXCLUDED.longest_streak,
        last_active_date = EXCLUDED.last_active_date,
        total_points     = EXCLUDED.total_points;

  RAISE NOTICE 'Demo account ready: % (id %)', demo_email, demo_user_id;
END
$demo$;

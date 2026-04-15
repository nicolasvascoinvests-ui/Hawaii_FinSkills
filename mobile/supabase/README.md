# Supabase — Hawaii DOE App

Database schema, RLS policies, triggers, and storage configuration for the
Hawaii DOE Financial Literacy mobile app's Supabase backend.

## Layout

```
supabase/
├── config.toml                # Supabase CLI project config (project_ref + auth)
├── seed.sql                   # DOE standards + achievement definitions
├── migrations/
│   ├── 20260411000001_init_extensions_and_helpers.sql
│   ├── 20260411000002_profiles_and_usernames.sql
│   ├── 20260411000004_courses_lessons_quizzes.sql
│   ├── 20260411000005_progress_mastery_attempts.sql
│   ├── 20260411000006_classes_assignments.sql
│   ├── 20260411000007_achievements_and_streaks.sql
│   ├── 20260411000008_audit_log_ferpa.sql
│   └── 20260411000009_storage_buckets.sql
└── functions/                 # Edge Functions (added later)
```

## What you get when you apply these migrations

| Area              | Tables / objects |
|-------------------|------------------|
| Auth & users      | `profiles` (with usernames, citext + reserved list + validation), auto-create trigger |
| Courses           | `doe_standards`, `courses`, `lessons`, `quiz_questions` |
| Progress          | `user_progress`, `standard_mastery`, `quiz_attempts` (auto-rolls into mastery) |
| Classes           | `classes`, `class_members`, `assignments`, `assignment_submissions` |
| Gamification      | `achievement_definitions`, `user_achievements`, `user_streaks` |
| FERPA             | `audit_log` (append-only, admin read) + auto-audit triggers on sensitive tables |
| Storage           | `avatars`, `course-content` buckets with RLS |

Every table has Row Level Security enabled. Defaults are deny-all; access
is granted explicitly:

- Students see only their own rows.
- Educators see students enrolled in classes they own.
- Admins see everything (via the `has_role()` SECURITY DEFINER helper).

## Apply to the "Hawaii DOE App" project

### One-time setup

1. Install the Supabase CLI: <https://supabase.com/docs/guides/cli>
2. From the Supabase dashboard for the *Hawaii DOE App* project, copy
   **Project Reference ID** (Project Settings → General).
3. Open `supabase/config.toml` and replace
   `REPLACE_WITH_HAWAII_DOE_APP_PROJECT_REF` with that ref.
4. Log in and link the project:

```bash
cd mobile
supabase login
supabase link --project-ref <your-project-ref>
```

### Apply schema and seed (CLI — recommended)

```bash
cd mobile
supabase db push          # applies every migration in supabase/migrations/
supabase db execute --file supabase/seed.sql   # loads standards + achievements
```

### Apply schema (Dashboard fallback)

If you can't use the CLI right now, open the project in the Supabase
Dashboard, go to **SQL Editor → New query**, then paste each migration
file in numeric order and run it. Run `seed.sql` last.

> The migrations are idempotent (`CREATE ... IF NOT EXISTS`,
> `ON CONFLICT DO NOTHING`, `DROP TRIGGER IF EXISTS`), so re-running is safe.

### Wire the mobile app to the new project

1. Create `mobile/.env` (copy from `.env.example`).
2. Fill in `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   from the dashboard (Project Settings → API).
3. Restart Expo so the env vars are picked up:

```bash
npx expo start -c
```

## Username system

- Stored as `citext` so "Alex" and "alex" cannot both exist.
- 3–20 characters, only `[A-Za-z0-9_-]`, never all-numeric.
- Reserved words (admin, doe, hawaii, ...) are blocked via the
  `reserved_usernames` table.
- A `BEFORE INSERT/UPDATE` trigger enforces every rule server-side.
- Signup screens can call `is_username_available(username)` over RPC
  to check before submit.

## Auth signup metadata contract

When the app calls `supabase.auth.signUp({ email, password, options: { data: ... } })`,
include any of these in `data` and `handle_new_user()` will pull them
into the new profile row:

```json
{
  "username":     "kalani23",
  "display_name": "Kalani M.",
  "role":         "student",
  "age_tier":     "13_17"
}
```

Allowed `age_tier` values: `"13_17" | "18_plus"`.
Allowed `role` values: `"student" | "parent" | "educator" | "admin"`.

## Verifying after apply

Run these in the SQL editor and confirm each returns rows you expect:

```sql
-- 30 standards loaded?
SELECT count(*) FROM public.doe_standards;             -- expect 30

-- RLS enabled on every public table?
SELECT relname FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity;
-- expect zero rows

-- Auth trigger exists?
SELECT tgname FROM pg_trigger WHERE tgname='on_auth_user_created';
```

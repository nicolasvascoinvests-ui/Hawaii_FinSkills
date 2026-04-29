-- =====================================================================
-- 015 — Rename `doe_standards` to `standards`
-- =====================================================================
-- The historical migrations 004/005/010 originally created a table
-- named `doe_standards`. Those files have been updated to use the new
-- name on fresh installs. This migration renames the table on any
-- database where the old name still exists, so the foreign-key
-- references in `quiz_questions.standard_code` and
-- `standard_mastery.standard_code` keep pointing at the same rows.
--
-- Idempotent — does nothing if `doe_standards` is already gone.
-- =====================================================================

ALTER TABLE IF EXISTS public.doe_standards RENAME TO standards;

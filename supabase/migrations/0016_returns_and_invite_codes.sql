-- Reconcile local schema with production (drift captured 2026-07-27).
--
-- These objects were built on production via the dashboard and never committed
-- as migrations, so `supabase db reset` produced a schema too old to load a
-- prod data snapshot (the pull-prod-data pipeline failed with
-- `column "return_requested_at" of relation "bookings" does not exist` and a
-- missing `invite_codes` relation). This migration adds exactly what prod has.
--
-- Intentionally OMITTED: production also gates signups with an invite-code
-- trigger on auth.users (public.check_invite_code + public.enforce_invite_code,
-- which reads raw_user_meta_data->>'invite_code'). That trigger is NOT
-- recreated here — it would reject the demo/sanitize auth.users rows that
-- seed.sql and scripts/supabase/sanitize-local.sql insert without an invite
-- code. Local signups stay ungated. Recreate it deliberately if ever needed.

-- Tool-return flow on bookings ----------------------------------------------
CREATE TYPE return_condition AS ENUM ('like_new', 'good', 'fair', 'damaged');

ALTER TABLE bookings
    ADD COLUMN return_requested_at TIMESTAMPTZ,
    ADD COLUMN return_condition    return_condition,
    ADD COLUMN return_notes        TEXT,
    ADD COLUMN return_photo_urls   TEXT[] NOT NULL DEFAULT '{}';

-- Invite codes --------------------------------------------------------------
CREATE TABLE invite_codes (
    code       TEXT PRIMARY KEY,
    label      TEXT,
    max_uses   INTEGER,
    uses       INTEGER     NOT NULL DEFAULT 0,
    is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Matches production grants (RLS is on with no policies, so anon/authenticated
-- get no row access despite the table-level grant; service_role bypasses RLS).
GRANT ALL ON TABLE invite_codes TO anon;
GRANT ALL ON TABLE invite_codes TO authenticated;
GRANT ALL ON TABLE invite_codes TO service_role;

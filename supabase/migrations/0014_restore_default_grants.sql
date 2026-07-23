-- Restores the table/sequence/function privileges that a Supabase project
-- normally has by default.
--
-- Why this is needed: when migrations are applied by pasting them into the
-- dashboard SQL editor (rather than via `supabase db reset` / CLI), the objects
-- are created without the default privileges Supabase grants to the PostgREST
-- roles. The result is `42501 permission denied for table X` on every request,
-- even from service_role. 10 of 12 tables were in this state.
--
-- Safety: these grants are intentionally coarse — that is how Supabase ships.
-- Row-level access is enforced by RLS, which is ENABLED on every table in this
-- schema (verified). Grants let a role reach the table; RLS decides which rows.
-- Do not add a table to this schema without also enabling RLS on it.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Cover objects created by future migrations too.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- `favorites` is per-user data with no public-read policy: keep anon out of it
-- entirely rather than relying on RLS alone.
REVOKE ALL ON public.favorites FROM anon;
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;

-- TKT-00002: "Easy pass signup eg. Google".
--
-- The obstacle is not the OAuth wiring — the PKCE callback at
-- /api/auth/callback already exchanges any `?code=` for a session and is
-- provider-agnostic. It's the signup gate.
--
-- Production gates auth.users inserts with enforce_invite_code(), which reads
-- raw_user_meta_data->>'invite_code'. A Google signup carries Google's claims
-- (email, name, picture, sub) and no invite code, so signInWithOAuth would
-- succeed locally and fail in production with a raw "Database error saving new
-- user". signInWithOAuth also has no `data:` option to smuggle metadata
-- through the way signUp does.
--
-- Fix: accept a signup when the address is on an explicit allowlist, fed from
-- the waiting list. Everyone else still needs a code, so the pilot stays
-- closed.

-- Allowlist ----------------------------------------------------------------
CREATE TABLE approved_emails (
    email      TEXT PRIMARY KEY,
    note       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Emails are compared case-insensitively; store them folded so the primary key
-- can't hold Two@x.com and two@x.com as separate rows.
ALTER TABLE approved_emails
    ADD CONSTRAINT approved_emails_lowercase CHECK (email = lower(email));

ALTER TABLE approved_emails ENABLE ROW LEVEL SECURITY;

-- Same shape as invite_codes: RLS on with no policies, so anon/authenticated
-- get no row access despite the table grant. Reached only through the
-- SECURITY DEFINER functions below (service_role bypasses RLS).
GRANT ALL ON TABLE approved_emails TO anon;
GRANT ALL ON TABLE approved_emails TO authenticated;
GRANT ALL ON TABLE approved_emails TO service_role;

-- Signup gate ---------------------------------------------------------------
-- Replaces the production function. Behaviour is unchanged for email/password
-- signups; the only new branch is the allowlist, which is what lets a Google
-- signup through without an invite code.
--
-- NOTE: as in 0016, the TRIGGER is deliberately NOT created here. Attaching it
-- locally would reject the demo rows seed.sql and sanitize-local.sql insert
-- without an invite code. Replacing the function is inert where nothing is
-- attached, so this stays safe to run locally while keeping the definition
-- under version control instead of only in the dashboard.
CREATE OR REPLACE FUNCTION public.enforce_invite_code()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  v_code text := NEW.raw_user_meta_data->>'invite_code';
  v_ok boolean;
begin
  -- Pre-approved address: no code needed. This is the OAuth path — Google
  -- never supplies an invite code.
  if NEW.email is not null
     and exists (select 1 from approved_emails where email = lower(NEW.email))
  then
    return NEW;
  end if;

  if v_code is null or v_code = '' then
    raise exception 'An invite code is required to sign up.';
  end if;

  update invite_codes
    set uses = uses + 1
    where code = v_code and is_active
      and (max_uses is null or uses < max_uses)
    returning true into v_ok;

  if v_ok is null then
    raise exception 'Invalid or expired invite code.';
  end if;

  return NEW;
end;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_invite_code() FROM anon, authenticated;

-- check_invite_code ---------------------------------------------------------
-- Also production-only until now (0016 omitted it alongside the trigger),
-- which meant the registration form's pre-check threw locally instead of
-- returning false, and e2e/invite-signup.spec.ts could never pass. It is
-- read-only and gates nothing, so unlike the trigger there is no reason to
-- keep it out of the local schema.
CREATE OR REPLACE FUNCTION public.check_invite_code(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  select exists (
    select 1 from invite_codes
    where code = p_code and is_active
      and (max_uses is null or uses < max_uses)
  );
$$;

GRANT EXECUTE ON FUNCTION public.check_invite_code(text) TO anon, authenticated;

-- Companion check for the allowlist, so the sign-in UI can tell a rejected
-- tester why without leaking the whole list.
CREATE OR REPLACE FUNCTION public.is_email_approved(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  select exists (select 1 from approved_emails where email = lower(p_email));
$$;

GRANT EXECUTE ON FUNCTION public.is_email_approved(text) TO anon, authenticated;

-- Profile creation ----------------------------------------------------------
-- Google sends `name` / `full_name` and `picture`, never `display_name`, so
-- without this every Google user would be named after their email local-part
-- (e.g. "jane.doe") with no avatar.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
            NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
            NULLIF(NEW.raw_user_meta_data->>'name', ''),
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
            NULLIF(NEW.raw_user_meta_data->>'picture', '')
        )
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Seed the allowlist with the pilot testers who reported this batch of
-- tickets, so Google sign-in is usable the moment the provider is enabled.
INSERT INTO approved_emails (email, note) VALUES
    ('tucker@bitcrafttech.com', 'Pilot — Nathaniel Tucker')
ON CONFLICT (email) DO NOTHING;

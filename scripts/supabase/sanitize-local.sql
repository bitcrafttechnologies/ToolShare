-- Run only against the LOCAL database, only after loading a production data
-- snapshot (see load-snapshot-local.sh, which is the only thing that should
-- invoke this file).
--
-- Two jobs:
--  1. Backfill auth.users for every public.profiles row the snapshot brought
--     in. The snapshot never contains real auth.users rows (pull-prod-data.sh
--     excludes the auth schema entirely), so profiles.id would otherwise be a
--     dangling reference. Every synthesized account uses a fake @local.test
--     email and the same known dev password so you can log in as any of them.
--  2. Scrub the PII columns that live directly on public.profiles.

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  -- Nullable with no default, but GoTrue scans them into Go strings: leaving
  -- them NULL makes every sign-in 500 with "Database error querying schema".
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  p.id,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'user-' || substr(p.id::text, 1, 8) || '@local.test',
  crypt('localdev123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  '', '', '', ''
from public.profiles p
left join auth.users u on u.id = p.id
where u.id is null
on conflict (id) do nothing;

update public.profiles
set
  email = 'user-' || substr(id::text, 1, 8) || '@local.test',
  phone = null,
  age_verification_doc_url = null,
  license_url = null,
  stripe_customer_id = null,
  fcm_token = null,
  apns_token = null;

-- Note: this does not scrub free-text content (e.g. messages.body) — those
-- can still contain whatever a real renter/owner typed, including phone
-- numbers or addresses shared in chat. Fine for local UI/flow testing, but
-- don't paste message content from a synced snapshot anywhere outside your
-- machine.

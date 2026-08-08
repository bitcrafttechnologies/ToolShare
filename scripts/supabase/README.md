# Pulling production into local dev

Production (`pfmytliqqyzewlmhmwpr`, "Toolshed") is the only source of truth.
These scripts only ever **read** from it — nothing here can write to
production:

- `db pull` / `db dump` are introspection/`pg_dump` operations (`SELECT`s
  under the hood).
- Nothing in this directory calls `supabase db push`, `db reset --linked`, or
  `migration up --linked` — those are the only CLI commands that write to a
  linked remote, and they're intentionally never used here.
- `link-prod.sh` is hardcoded to the production ref (`PROD_REF` in `lib.sh`);
  every other script refuses to run unless the CLI is linked to exactly that
  project, so linking to the wrong project (e.g. the unrelated "LocalsOnly"
  project) fails closed instead of silently pulling the wrong data.
- Every write goes to `LOCAL_DB_URL` (`127.0.0.1:54322`, the fixed Supabase
  CLI local default), hardcoded in `lib.sh` — no script accepts a host as an
  argument or env var, so there's no way to point a "local" load at a remote
  database by mistake.

## One-time setup

```bash
pnpm db:link          # links the CLI to production; prompts for the DB password
                       # (Project Settings > Database in the dashboard, not your login)
supabase start         # boots the local stack (needs Docker running)
```

Set `SUPABASE_DB_PASSWORD` in your shell to skip the interactive password
prompt on `db:link` — never pass it in chat or commit it anywhere.

## Day to day

```bash
pnpm db:refresh --pull   # full refresh: pull a fresh prod data snapshot, then
                          # rebuild local schema from migrations/ and load it
pnpm db:refresh           # same, but reuses the last snapshot on disk (faster)
pnpm db:reset             # plain local reset with the demo seed.sql data —
                          # no production data, no network call
```

Schema changes are pulled separately and deliberately, since they land as a
new file in `supabase/migrations/` that should be reviewed and committed like
any other migration:

```bash
pnpm db:pull-schema
```

## What "keep Supabase only production content" means here

- `supabase/.prod-snapshots/` (gitignored) holds raw data dumps. They contain
  real emails/phone numbers/identity-doc URLs until they're loaded locally —
  don't send these files anywhere.
- `pull-prod-data.sh` dumps the `public` schema only. It never touches `auth`
  or `storage` — real credentials and password hashes never leave production.
- After loading, `sanitize-local.sql` runs automatically and:
  - synthesizes local-only `auth.users` rows (`user-<id8>@local.test` /
    `localdev123`) for every carried-over profile, since the snapshot has no
    real auth rows to satisfy the `profiles.id → auth.users.id` foreign key
  - blanks `profiles.email`, `phone`, `age_verification_doc_url`,
    `license_url`, `stripe_customer_id`, `fcm_token`, `apns_token`
- **Not scrubbed:** free-text content such as `messages.body` — a synced chat
  message can still contain whatever a real user typed (a phone number, an
  address). Fine for local UI testing on your own machine; don't paste it
  anywhere else.

Production itself is never modified by any of this — these scripts only
change what's on your laptop.

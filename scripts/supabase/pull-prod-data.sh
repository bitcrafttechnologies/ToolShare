#!/usr/bin/env bash
# Dumps PRODUCTION *data* (public schema only) to a local, gitignored snapshot
# file. Read-only against production — this is a pg_dump, it issues SELECTs
# and never writes.
#
# Deliberately excludes the `auth` and `storage` schemas: real user emails,
# phone numbers, and password hashes never leave production. Local dev
# accounts are synthesized separately by load-snapshot-local.sh, and PII
# columns inside public.profiles (email, phone, doc URLs, Stripe id, push
# tokens) get scrubbed by sanitize-local.sql right after loading.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
source scripts/supabase/lib.sh
require_repo_root

scripts/supabase/link-prod.sh
require_linked_to_prod

mkdir -p supabase/.prod-snapshots
stamp="$(date +%Y%m%d-%H%M%S)"
out="supabase/.prod-snapshots/data-${stamp}.sql"

echo "Dumping production data (public schema only) to ${out}..."
# Exclude reference tables that the committed migrations already seed
# (0003 categories, 0010 project_types + project_type_tools). Their rows exist
# in local right after `db reset`, so re-inserting the same rows from the dump
# would fail on duplicate primary keys and roll back the whole load. Their data
# is identical to what the migrations seed, so nothing is lost.
supabase db dump --data-only --schema public \
  --exclude "public.categories,public.project_types,public.project_type_tools" \
  --file "$out"

ln -sf "$(basename "$out")" supabase/.prod-snapshots/latest.sql

cat <<EOF

Done: ${out}
This file contains raw production rows (renter/owner emails, phone numbers,
identity-doc URLs) and is gitignored (supabase/.prod-snapshots/) — never commit it.
Load it into your local DB with: pnpm db:load-snapshot
EOF

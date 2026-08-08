#!/usr/bin/env bash
# Loads a data snapshot (from pull-prod-data.sh) into the LOCAL database, then
# sanitizes it. Runs psql inside the local stack's own postgres container
# (via local_psql in lib.sh) rather than connecting out to a host/port, so
# there's no argument or env var that could point this at production.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
source scripts/supabase/lib.sh
require_repo_root

snapshot="${1:-supabase/.prod-snapshots/latest.sql}"
if [ ! -e "$snapshot" ]; then
  echo "error: no snapshot at $snapshot. Run 'pnpm db:pull-data' first." >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
  echo "error: local Supabase stack isn't running. Run 'supabase start' first." >&2
  exit 1
fi

echo "Loading $snapshot into local DB..."
# FK checks are disabled for the load because the snapshot excludes auth.users
# (see pull-prod-data.sh) — sanitize-local.sql backfills those rows next, and
# only then would the foreign keys actually resolve.
{
  echo "begin;"
  echo "set local session_replication_role = replica;"
  cat "$snapshot"
  echo "commit;"
} | local_psql

echo "Sanitizing PII and backfilling local auth accounts..."
local_psql < scripts/supabase/sanitize-local.sql

cat <<'EOF'

Done. Local database now has production-shaped data with PII scrubbed.
Every carried-over user can be logged into locally as user-<id8>@local.test / localdev123.
EOF

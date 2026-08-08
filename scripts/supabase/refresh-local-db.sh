#!/usr/bin/env bash
# Rebuilds the LOCAL database from the committed migrations, then loads a
# sanitized copy of production data on top. Never touches production.
#
# Usage:
#   pnpm db:refresh          # reuse the most recent snapshot on disk
#   pnpm db:refresh --pull   # pull a fresh snapshot from prod first
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
source scripts/supabase/lib.sh
require_repo_root

pull=false
for arg in "$@"; do
  [ "$arg" = "--pull" ] && pull=true
done

if [ "$pull" = true ] || [ ! -e supabase/.prod-snapshots/latest.sql ]; then
  scripts/supabase/pull-prod-data.sh
fi

echo "Resetting local database from migrations (schema only, no demo seed)..."
supabase db reset --local --no-seed

scripts/supabase/load-snapshot-local.sh

echo
echo "Local database ready: schema from migrations/ + sanitized production data."

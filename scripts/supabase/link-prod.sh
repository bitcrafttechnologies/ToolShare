#!/usr/bin/env bash
# Links the Supabase CLI to the ToolShare PRODUCTION project.
#
# This only lets later commands (db pull / db dump) authenticate — it does not
# write anything to the project. Nothing in this directory ever calls
# `supabase db push`, `db reset --linked`, or `migration up --linked`, so
# being linked never puts production at risk of a stray write.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
source scripts/supabase/lib.sh
require_repo_root

current_ref="$(cat supabase/.temp/project-ref 2>/dev/null || true)"
if [ "$current_ref" = "$PROD_REF" ]; then
  echo "Already linked to production ($PROD_REF)."
  exit 0
fi

echo "Linking to ToolShare production ($PROD_REF)."
echo "You'll be prompted for the database password (Project Settings > Database in the"
echo "Supabase dashboard — NOT your supabase.com login). Set SUPABASE_DB_PASSWORD in your"
echo "shell environment first to skip the interactive prompt."
echo

if [ -n "${SUPABASE_DB_PASSWORD:-}" ]; then
  supabase link --project-ref "$PROD_REF" --password "$SUPABASE_DB_PASSWORD"
else
  supabase link --project-ref "$PROD_REF"
fi

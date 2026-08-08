#!/usr/bin/env bash
# Pulls the current PRODUCTION schema into a new local migration file for review.
#
# `supabase db pull` only introspects information_schema/pg_catalog on the
# remote database — it is read-only against production. The output is a new
# file under supabase/migrations/; nothing is written to prod, and nothing is
# written to your local database either until you run `supabase db reset`.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
source scripts/supabase/lib.sh
require_repo_root

scripts/supabase/link-prod.sh
require_linked_to_prod

echo "Pulling schema from production ($PROD_REF)..."
supabase db pull --schema public,graphql_public

cat <<'EOF'

Done. Review the new file under supabase/migrations/ (diff it against the
previous schema) before committing — treat it like any other migration.
Nothing was written to production or to your local database.
EOF

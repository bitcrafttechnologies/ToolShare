#!/usr/bin/env bash
# Shared constants/helpers for the scripts in this directory.
# Sourced, not executed directly.

PROD_REF="pfmytliqqyzewlmhmwpr" # "Toolshed" — the only project these scripts may read from
DB_CONTAINER="supabase_db_ToolShare" # local stack's postgres container (from config.toml project_id)
LOCAL_DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres" # for reference / a native psql install

local_psql() {
  # Runs psql inside the local stack's own container instead of requiring a
  # host-installed psql client. Always local-only: the container only exists
  # when `supabase start` is running, and it's never anything but the local DB.
  docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 "$@"
}

require_repo_root() {
  cd "$(git rev-parse --show-toplevel)"
}

require_linked_to_prod() {
  local ref
  ref="$(cat supabase/.temp/project-ref 2>/dev/null || true)"
  if [ "$ref" != "$PROD_REF" ]; then
    echo "error: supabase CLI is not linked to production ($PROD_REF); currently linked to '${ref:-<none>}'." >&2
    echo "Run: pnpm db:link" >&2
    exit 1
  fi
}

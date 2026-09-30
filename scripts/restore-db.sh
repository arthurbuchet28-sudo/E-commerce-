#!/usr/bin/env bash
# Restores an encrypted backup made by scripts/backup-db.sh into an EMPTY Supabase project
# (new project, no migration applied). Procedure: docs/sauvegardes.md.
#
#   SUPABASE_DB_URL="postgresql://…"   connection string of the target project
#   scripts/restore-db.sh backups/premiere-vente-YYYYMMDD-HHMM.tar.age path/to/age-identity.txt
#
# The schema is rebuilt from supabase/migrations (not from schema.sql): a Supabase dump leaves
# out what the migrations create in Supabase-managed schemas, such as the trigger on auth.users
# that creates member profiles. The migrations must be those of the backup's commit.
set -euo pipefail

archive="${1:?Usage: scripts/restore-db.sh ARCHIVE.tar.age IDENTITY_FILE}"
identity="${2:?Usage: scripts/restore-db.sh ARCHIVE.tar.age IDENTITY_FILE}"
: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL to the target project (see docs/sauvegardes.md)}"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
age -d -i "$identity" "$archive" | tar -C "$work" -xz

backup_commit="$(cat "$work/commit.txt" 2>/dev/null || echo unknown)"
current_commit="$(git rev-parse HEAD 2>/dev/null || echo unknown)"
if [ "$backup_commit" != "$current_commit" ] && [ "${RESTORE_ANY_COMMIT:-}" != "1" ]; then
  echo "This backup was made at commit $backup_commit; the working copy is at $current_commit." >&2
  echo "Run: git checkout $backup_commit (or set RESTORE_ANY_COMMIT=1 if no migration changed)." >&2
  exit 1
fi

host="$(printf '%s' "$SUPABASE_DB_URL" | sed -E 's#^[^@]*@([^:/]+).*#\1#')"
if [ "${RESTORE_CONFIRM:-}" != "$host" ]; then
  read -r -p "Restore into $host? Type the host name to confirm: " answer
  [ "$answer" = "$host" ] || { echo "Cancelled."; exit 1; }
fi

echo "1/3 Roles…"
psql "$SUPABASE_DB_URL" --variable ON_ERROR_STOP=1 --quiet --file "$work/roles.sql"
echo "2/3 Schema (migrations)…"
pnpm exec supabase db push --db-url "$SUPABASE_DB_URL" --yes
echo "3/3 Data…"
# Triggers disabled while loading (Supabase's documented restore order).
psql "$SUPABASE_DB_URL" --single-transaction --variable ON_ERROR_STOP=1 --quiet \
  --command 'SET session_replication_role = replica' \
  --file "$work/data.sql"
if [ -d "$work/fichiers" ]; then
  echo "Course files (needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY of the target)…"
  node scripts/storage-files.mjs upload "$work/fichiers"
fi
echo "Restore finished. Follow the checks in docs/sauvegardes.md."

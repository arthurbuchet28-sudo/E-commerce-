#!/usr/bin/env bash
# Encrypted logical backup of the Supabase database (roles, schema, data).
# Procedure and restoration: docs/sauvegardes.md.
#
#   SUPABASE_DB_URL="postgresql://…"      connection string (Supabase > Connect > Session pooler)
#   BACKUP_AGE_RECIPIENT="age1…"          public key: backups are readable only with the private key
#   BACKUP_INCLUDE_FILES=1                 also copy the course files (bucket « ressources »);
#                                          needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
#   scripts/backup-db.sh [output-dir]      default: ./backups (ignored by git)
set -euo pipefail

: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL (see docs/sauvegardes.md)}"
: "${BACKUP_AGE_RECIPIENT:?Set BACKUP_AGE_RECIPIENT, the age public key (see docs/sauvegardes.md)}"
command -v age >/dev/null || { echo "age is required: https://age-encryption.org" >&2; exit 1; }

out_dir="${1:-backups}"
stamp="$(date -u +%Y%m%d-%H%M)"
work="$(mktemp -d)"
# Plain-text dumps contain personal data: always delete them, even on failure.
trap 'rm -rf "$work"' EXIT
mkdir -p "$out_dir"

echo "Dumping roles, schema and data…"
# Restoration rebuilds the schema from the migrations of this commit (see restore-db.sh).
git rev-parse HEAD > "$work/commit.txt" 2>/dev/null || echo "unknown" > "$work/commit.txt"
pnpm exec supabase db dump --db-url "$SUPABASE_DB_URL" --role-only -f "$work/roles.sql"
pnpm exec supabase db dump --db-url "$SUPABASE_DB_URL" -f "$work/schema.sql"
# Storage feature tables the site does not use; the postgres role cannot restore them.
pnpm exec supabase db dump --db-url "$SUPABASE_DB_URL" --data-only --use-copy \
  -x storage.buckets_vectors -x storage.buckets_analytics -x storage.vector_indexes \
  -f "$work/data.sql"

parts=(commit.txt roles.sql schema.sql data.sql)
if [ "${BACKUP_INCLUDE_FILES:-}" = "1" ]; then
  echo "Copying course files…"
  node scripts/storage-files.mjs download "$work/fichiers"
  parts+=(fichiers)
fi

archive="$out_dir/premiere-vente-$stamp.tar.age"
tar -C "$work" -cz "${parts[@]}" | age -r "$BACKUP_AGE_RECIPIENT" -o "$archive"
echo "Backup written: $archive"
sha256sum "$archive" 2>/dev/null || shasum -a 256 "$archive"

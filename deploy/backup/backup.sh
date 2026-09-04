#!/bin/sh
set -eu

: "${RESTIC_REPOSITORY:?RESTIC_REPOSITORY is required}"
: "${DB_HOST:?DB_HOST is required}"
: "${DB_NAME:?DB_NAME is required}"
: "${DB_USER:?DB_USER is required}"
: "${DB_PASSWORD:?DB_PASSWORD is required}"

export RESTIC_PASSWORD_FILE=/run/secrets/restic_password
export AWS_SHARED_CREDENTIALS_FILE=/run/secrets/aws_credentials

test -s "$RESTIC_PASSWORD_FILE"
test -s "$AWS_SHARED_CREDENTIALS_FILE"

if ! restic snapshots >/dev/null 2>&1; then
  restic init
fi

while true; do
  backup_tmp="$(mktemp -d /tmp/quickwork-backup.XXXXXX)"
  cleanup() {
    rm -rf -- "$backup_tmp"
  }
  trap cleanup EXIT INT TERM

  MYSQL_PWD="$DB_PASSWORD" mariadb-dump \
    --host="$DB_HOST" \
    --user="$DB_USER" \
    --single-transaction \
    --quick \
    --skip-lock-tables \
    --databases "$DB_NAME" > "$backup_tmp/mysql.sql"

  tar -C /uploads -czf "$backup_tmp/uploads.tar.gz" .
  restic backup "$backup_tmp" --tag quickwork-production
  restic forget --tag quickwork-production --keep-daily 7 --keep-weekly 4 --keep-monthly 12 --prune

  cleanup
  trap - EXIT INT TERM
  sleep "${BACKUP_INTERVAL_SECONDS:-86400}"
done

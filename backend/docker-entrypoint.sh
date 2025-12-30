#!/bin/sh
set -e

# Try to apply migrations (retry loop)
MAX_TRIES=10
n=1
until [ $n -gt $MAX_TRIES ]
do
  echo "[entrypoint] Attempting DB migrations (try $n/$MAX_TRIES)"
  if python migrate.py; then
    echo "[entrypoint] Migrations succeeded"
    break
  fi
  n=$((n+1))
  echo "[entrypoint] Migrations failed, retrying in 3s..."
  sleep 3
done

# Execute the CMD (gunicorn by default)
exec "$@"

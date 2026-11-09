#!/bin/sh
# Prepares the database and starts the API. Every step is idempotent,
# so the container can be restarted or redeployed any number of times.
set -e

echo "[entrypoint] applying migrations"
./node_modules/.bin/prisma migrate deploy

echo "[entrypoint] seeding"
node dist/prisma/seed/seed.js

echo "[entrypoint] starting API"
exec node dist/src/main.js

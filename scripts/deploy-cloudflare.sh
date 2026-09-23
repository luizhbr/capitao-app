#!/usr/bin/env sh
set -eu

ENVIRONMENT="${1:-production}"
EXTRA="${2:-}"

if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
  echo "Uso: sh scripts/deploy-cloudflare.sh [production|staging] [--dry-run]" >&2
  exit 2
fi

node ./scripts/check-cloudflare-env.mjs "$ENVIRONMENT"

if [ "$ENVIRONMENT" = "staging" ] && [ -f .env.staging.local ]; then
  set -a
  . ./.env.staging.local
  set +a
elif [ -f .env.production.local ]; then
  set -a
  . ./.env.production.local
  set +a
elif [ -f .env.local ]; then
  set -a
  . ./.env.local
  set +a
fi

if [ "$EXTRA" = "--dry-run" ]; then
  npm run cf:build
  if [ "$ENVIRONMENT" = "staging" ]; then
    npx @vinext/cloudflare deploy --env staging --skip-build --dry-run
  else
    npx @vinext/cloudflare deploy --skip-build --dry-run
  fi
  exit 0
fi

npx vinext check
npm run cf:build

if [ "$ENVIRONMENT" = "staging" ]; then
  npx @vinext/cloudflare deploy --env staging --skip-build
else
  npx @vinext/cloudflare deploy --skip-build
fi

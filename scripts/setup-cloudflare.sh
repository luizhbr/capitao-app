#!/usr/bin/env sh
set -eu

echo "[CAPITÃO] Instalando dependências..."
npm install

echo "[CAPITÃO] Verificando compatibilidade com vinext..."
npx vinext check

echo "[CAPITÃO] Gerando tipos Wrangler..."
npx wrangler types --config wrangler.jsonc || true

echo ""
echo "Próximos passos:"
echo "  1. cp .env.production.example .env.production.local"
echo "  2. preencha Supabase + URL pública"
echo "  3. npx wrangler login"
echo "  4. npx wrangler whoami"
echo "  5. npm run cf:deploy:dry"
echo "  6. npm run cf:deploy"

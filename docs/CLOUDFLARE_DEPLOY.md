# CAPITÃO — Deploy na Cloudflare Workers

Produção principal:

```text
GitHub -> Cloudflare Workers -> CAPITÃO PWA -> Supabase
```

## Pré-requisitos

- Node compatível com `.nvmrc`
- Conta Cloudflare
- Projeto Supabase
- Wrangler autenticado localmente ou `CLOUDFLARE_API_TOKEN` em CI

## Variáveis

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICAVEL
NEXT_PUBLIC_APP_URL=https://SEU_DOMINIO
CLOUDFLARE_ACCOUNT_ID=SEU_ACCOUNT_ID
```

Nunca coloque `service_role` em uma variável `NEXT_PUBLIC_*`.

## Deploy local

```bash
npm install
npx wrangler login
npm run cf:check
npm run typecheck
npm run cf:deploy:dry
npm run cf:deploy
```

## GitHub Actions

Configure em **Settings -> Secrets and variables -> Actions**:

### Repository secrets

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

### Repository variable

```text
NEXT_PUBLIC_APP_URL
```

Cada push para `main` pode executar o workflow de deploy.

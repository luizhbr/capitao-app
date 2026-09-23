# Deploy do CAPITÃO

A estratégia oficial é:

1. **Produção principal:** Cloudflare Workers + Supabase.
2. **Rota de independência:** Docker + Coolify + VPS.

Para Cloudflare, use o guia canônico:

- [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md)

## Docker / Coolify

O repositório contém `Dockerfile` multi-stage. O build Docker ativa `CAPITAO_DEPLOY_TARGET=docker`, fazendo o Next gerar `output: standalone`.

### Teste local

```bash
cp .env.example .env.local
npm run docker:build
npm run docker:run
```

Ou:

```bash
docker compose up --build
```

### Coolify

1. Crie uma aplicação a partir do repositório Git.
2. Escolha **Dockerfile** como método de build.
3. Porta interna: `3000`.
4. Adicione as variáveis de ambiente.
5. Associe o domínio.
6. Habilite health checks e deploy automático por push, se desejado.

O banco permanece no Supabase.

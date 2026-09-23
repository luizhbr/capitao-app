# CAPITÃO App

Super app cívico-econômico de Capitão Andrade/MG: economia local, turismo, produtos da cidade, cooperativas, tecnologia e acompanhamento do plano Capitão 2040.

## Stack

- Next.js + React + TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL, Auth, Storage e RLS)
- PWA
- Cloudflare Workers como deploy principal
- Docker/Coolify como rota alternativa

## Segurança

O frontend usa somente a URL do projeto Supabase e a publishable key. Chaves secret/service-role nunca devem ser expostas no browser ou commitadas no repositório. A autorização é aplicada em PostgreSQL com grants + Row Level Security.

O backend hospedado já passou por teste E2E HTTP com dois usuários Auth reais: o JWT do usuário A não conseguiu ler, alterar ou excluir o perfil do usuário B.

## Estrutura

```text
src/
  app/
  components/
  lib/
supabase/
  migrations/
  tests/
docs/
.github/workflows/
```

A base deste repositório é mantida alinhada ao projeto Supabase **Capitão App**.

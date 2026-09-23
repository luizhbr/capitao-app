# Arquitetura — CAPITÃO

## Princípio

O CAPITÃO é uma PWA web-first com baixo acoplamento à infraestrutura. O produto deve poder rodar em Cloudflare Workers ou em um container Docker sem reescrever os domínios de negócio.

## Stack

- Next.js 16 / App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui + Base UI
- CAPITÃO Design System
- Motion
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- PWA (manifest + service worker)
- Cloudflare Workers via vinext como produção principal
- Docker/Coolify como rota de self-hosting

## Camadas

```text
UI / PWA
  ↓
Next.js App Router
  ↓
Services / Use Cases
  ↓
Repositories / Adapters
  ↓
Supabase + APIs externas
```

## Infraestrutura

### Produção principal

```text
Cliente
  ↓
Cloudflare edge
  ↓
Worker (vinext / Next.js)
  ↓
Supabase
```

### Alternativa self-hosted

```text
Cliente
  ↓
Cloudflare DNS/CDN (opcional)
  ↓
VPS + Coolify
  ↓
Docker / Next.js standalone
  ↓
Supabase
```

## Regra de desacoplamento

Recursos específicos do host devem ficar atrás de interfaces/adapters.

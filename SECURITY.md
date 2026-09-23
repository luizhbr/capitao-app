# Security Policy — CAPITÃO

Never commit passwords, Supabase secret keys, database connection strings, Cloudflare API tokens, JWT signing secrets, private certificates, or user exports.

Use `.env.local` / `.dev.vars` locally and platform secret stores in production. Only files ending in `.example` may contain placeholders.

Every app-facing table must have explicit privileges and Row Level Security. Sensitive tables belong in the non-exposed `private` schema. The exposed Data API schema is `api` only.

`src/lib/supabase/admin.ts` creates an RLS-bypassing client. Import it only from trusted server-side modules.

Before release run:

```bash
npm run security:scan
npm run typecheck
npm run lint
supabase db lint
supabase test db
```

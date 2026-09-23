# CAPITÃO — Supabase security baseline

The application uses a **deny-by-default** database design. A Supabase publishable key is expected to be visible in browsers; it is not a database password. Data protection comes from explicit Postgres grants and Row Level Security (RLS).

## Required production settings

1. **Data API → Exposed schemas:** expose `api` only.
2. **Never expose `private`.**
3. Run `npm run security:scan`, `supabase db lint`, and `supabase test db` before production.
4. Keep `private-user-assets` private.
5. Require email confirmation and keep anonymous sign-ins disabled unless intentionally needed.
6. Require MFA/AAL2 for privileged administration.
7. Review Security Advisor before each production release and after database migrations.

## API keys

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: browser-safe by design. RLS must protect all exposed data.
- `SUPABASE_SECRET_KEY`: privileged server-only key. Store it as a Cloudflare Worker secret only when needed.

## Important rule

A UI permission check is convenience only. Authorization must live in Postgres RLS or trusted server-side code.

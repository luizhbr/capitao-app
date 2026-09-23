# Live backend — Capitão App

Hosted Supabase project used by development:

- Project name: `Capitão App`
- Project ref: `jfufhsrhlatsstcdvhmb`
- Application-facing schema: `api`
- Internal schema: `private`
- Private Storage bucket: `private-user-assets`

Do not commit project secret/service-role keys, database passwords, access tokens or user exports. The browser uses only the project URL and publishable key. Authorization is enforced by PostgreSQL grants + RLS.

## Verified hosted E2E authorization

Two temporary Supabase Auth users were created and logged in with passwords over HTTP. Their real access JWTs were then used against the Data API:

- A and B login: HTTP 200;
- A could read and update A;
- A reading B: HTTP 200 with zero rows;
- A updating B: HTTP 200 with zero rows changed;
- A deleting B: HTTP 403;
- privileged verification confirmed B remained intact;
- temporary users were removed after the test;
- Security Advisor returned zero lints after cleanup.

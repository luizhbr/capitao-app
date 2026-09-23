# CAPITÃO — Production Security Gate

Production must not be opened to real citizen data until every item below is verified.

## Supabase platform

- [ ] Production project is separate from development/staging.
- [ ] Only the intended application schema (`api`) is exposed to the Data API.
- [ ] `private` is not exposed.
- [ ] RLS is enabled on every app-owned table.
- [ ] `anon` and `authenticated` grants follow least privilege.
- [ ] Security Advisor has no unresolved critical/high findings.
- [ ] Anonymous sign-ins are disabled.
- [ ] Email confirmation is enabled.
- [ ] Cloudflare Turnstile is enabled before public signup/password-reset launch.
- [ ] MFA is required for privileged CAPITÃO administrators.

## Secrets

- [ ] Browser only receives `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- [ ] `SUPABASE_SECRET_KEY` exists only in trusted server/Cloudflare secret storage.
- [ ] No secret/service-role key is committed to GitHub, bundled into JS, logged, or exposed in client responses.

## Release rule

No production release containing a new table, function, storage policy, admin endpoint, or privileged role is approved until its negative authorization tests exist.

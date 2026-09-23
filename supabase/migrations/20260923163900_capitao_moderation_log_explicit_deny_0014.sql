-- CAPITÃO — explicit deny for private moderation audit log (0014)
-- The private schema is not exposed through PostgREST. This explicit policy keeps
-- RLS intent machine-checkable and silences the "RLS enabled, no policy" advisor.

drop policy if exists moderation_log_explicit_deny on private.moderation_log;

create policy moderation_log_explicit_deny
on private.moderation_log
for all
to anon, authenticated
using (false)
with check (false);

revoke all on private.moderation_log from anon, authenticated;
grant all on private.moderation_log to service_role;

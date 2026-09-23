-- CAPITÃO — authenticated admin gate RPC (0017)
-- Removes the need for a service-role secret in the web runtime just to decide
-- whether the current signed-in user can enter /admin.

create or replace function api.can_moderate()
returns boolean
language sql
stable
security definer
set search_path = private, api, pg_temp
as $$
  select auth.uid() is not null
     and private.has_moderator_role();
$$;

revoke all on function api.can_moderate() from public, anon;
grant execute on function api.can_moderate() to authenticated, service_role;

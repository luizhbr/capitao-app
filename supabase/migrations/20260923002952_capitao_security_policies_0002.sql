revoke all on schema private from public, anon, authenticated;
revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all sequences in schema private from public, anon, authenticated;
revoke all on all routines in schema private from public, anon, authenticated;

revoke all on schema api from public;
grant usage on schema api to anon, authenticated, service_role;

alter default privileges for role postgres in schema api revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema api revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema api revoke execute on functions from anon, authenticated;

alter default privileges for role postgres in schema private revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema private revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema private revoke execute on functions from public, anon, authenticated;

alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated;

revoke all on api.profiles from anon, authenticated;
revoke all on api.projects from anon, authenticated;

grant select on api.profiles to authenticated;
grant update (display_name, avatar_path) on api.profiles to authenticated;
grant select on api.projects to anon, authenticated;

create policy profile_select_own on api.profiles
for select to authenticated
using ((select auth.uid()) = id);

create policy profile_update_own on api.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy project_select_public on api.projects
for select to anon, authenticated
using (is_public = true);

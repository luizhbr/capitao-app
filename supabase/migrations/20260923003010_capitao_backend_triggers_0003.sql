grant usage on schema private to service_role;
grant all on all tables in schema private to service_role;
grant all on all sequences in schema private to service_role;
grant execute on all routines in schema private to service_role;

alter default privileges for role postgres in schema api grant all on tables to service_role;
alter default privileges for role postgres in schema api grant all on sequences to service_role;
alter default privileges for role postgres in schema api grant execute on functions to service_role;
alter default privileges for role postgres in schema private grant all on tables to service_role;
alter default privileges for role postgres in schema private grant all on sequences to service_role;
alter default privileges for role postgres in schema private grant execute on functions to service_role;

create or replace function private.set_updated_at()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into api.profiles (id, display_name)
  values (new.id, nullif(left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 80), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function private.handle_new_user();

drop trigger if exists profiles_set_updated_at on api.profiles;
create trigger profiles_set_updated_at before update on api.profiles
for each row execute function private.set_updated_at();

drop trigger if exists projects_set_updated_at on api.projects;
create trigger projects_set_updated_at before update on api.projects
for each row execute function private.set_updated_at();

insert into api.projects (slug, title, summary, status, progress, is_public)
values ('energia-solar-cooperativa','Energia Solar Cooperativa','Projeto piloto para estudar geração compartilhada e redução de custos energéticos.','viability',42,true)
on conflict (slug) do update
set title=excluded.title, summary=excluded.summary, status=excluded.status,
    progress=excluded.progress, is_public=excluded.is_public, updated_at=now();

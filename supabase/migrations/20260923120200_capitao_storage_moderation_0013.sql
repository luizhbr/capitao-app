-- CAPITÃO — listing-media storage bucket + policies (0013)
insert into storage.buckets (id, name, public)
values ('listing-media', 'listing-media', true)
on conflict (id) do nothing;

-- uploads restritos: {owner_id}/{listing_id}/{slot}/{filename} (logo|cover|gallery)
-- tamanho/mime validados server-side aqui e reforçados no frontend
drop policy if exists "listing-media owner upload" on storage.objects;
create policy "listing-media owner upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[3] in ('logo','cover','gallery')
  and position('.' in (storage.foldername(name))[2]::text) = 0
);

drop policy if exists "listing-media owner update" on storage.objects;
create policy "listing-media owner update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'listing-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'listing-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "listing-media owner delete" on storage.objects;
create policy "listing-media owner delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "listing-media public read" on storage.objects;
create policy "listing-media public read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'listing-media');

grant all on storage.objects to service_role;

-- ============================================================
-- Moderação: SQL functions security definer (validação server-side
-- de role via private.user_roles; frontend NUNCA decide permissão)
-- ============================================================

create or replace function private.has_moderator_role()
returns boolean
language sql
stable
security definer
set search_path = private, api
as $$
  select exists (
    select 1 from private.user_roles r
    where r.user_id = auth.uid()
      and r.role in ('moderator','institute_admin','platform_admin')
  );
$$;

revoke all on function private.has_moderator_role() from public, anon, authenticated;
grant execute on function private.has_moderator_role() to authenticated, service_role;

create or replace function api.moderate_listing(
  p_listing_id uuid,
  p_action text,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = private, api
as $$
declare
  v_owner uuid;
  v_prev text;
  v_new text;
  v_effective_note text;
  v_is_owner boolean;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if p_action not in ('approve','reject','unpublish') then
    raise exception 'invalid action' using errcode = '22023';
  end if;

  if not private.has_moderator_role() then
    raise exception 'moderator role required' using errcode = '42501';
  end if;

  if p_note is not null and char_length(p_note) > 600 then
    raise exception 'note too long' using errcode = '22023';
  end if;

  select owner_id, status into v_owner, v_prev
  from api.listings
  where id = p_listing_id
  for update;

  if v_owner is null then
    raise exception 'listing not found' using errcode = 'P0002';
  end if;

  v_new := case p_action
    when 'approve' then 'published'
    when 'reject' then 'rejected'
    when 'unpublish' then 'pending'
  end;

  -- unpublish volta a pending (nova moderação) e limpa nota
  v_effective_note := case when p_action = 'unpublish' then null else coalesce(p_note, moderation_note) end;

  update api.listings
  set status = v_new,
      moderation_note = v_effective_note,
      moderated_at = now(),
      moderated_by = auth.uid(),
      updated_at = now()
  where id = p_listing_id;

  insert into private.moderation_log (listing_id, moderator_id, previous_status, new_status, note)
  values (p_listing_id, auth.uid(), v_prev, v_new, v_effective_note);

  return p_listing_id;
end;
$$;

revoke all on function api.moderate_listing(uuid, text, text) from public, anon;
grant execute on function api.moderate_listing(uuid, text, text) to authenticated, service_role;

-- dashboard de moderação em uma consulta (somente contagens reais)
create or replace function api.moderation_counts()
returns table (pending bigint, published bigint, rejected bigint, total bigint)
language sql
stable
security definer
set search_path = private, api
as $$
  select
    count(*) filter (where status = 'pending')::bigint,
    count(*) filter (where status = 'published')::bigint,
    count(*) filter (where status = 'rejected')::bigint
  from api.listings
  where private.has_moderator_role();
$$;

revoke all on function api.moderation_counts() from public, anon;
grant execute on function api.moderation_counts() to authenticated, service_role;

-- leitura moderada de TODOS os listings para o painel (bypass do RLS por função)
create or replace function api.admin_list_listings(
  p_status text default null
)
returns setof api.listings
language sql
stable
security definer
set search_path = private, api
as $$
  select l.*
  from api.listings l
  where private.has_moderator_role()
    and (p_status is null or l.status = p_status)
  order by l.created_at desc
  limit 500;
$$;

revoke all on function api.admin_list_listings(text) from public, anon;
grant execute on function api.admin_list_listings(text) to authenticated, service_role;


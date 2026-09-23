-- CAPITÃO — sync production hotfixes + harden moderation/media (0015)

-- Owners can set/edit map coordinates, but protected moderation fields remain unavailable.
grant insert (latitude, longitude) on api.listings to authenticated;
grant update (latitude, longitude) on api.listings to authenticated;

-- Media is private by default. Public access is granted only through RLS/signed URLs
-- for published listings; owners retain access to their own pending media.
update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']
where id = 'listing-media';

drop policy if exists "listing-media owner upload" on storage.objects;
create policy "listing-media owner upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[3] in ('logo','cover','gallery')
  and exists (
    select 1
    from api.listings l
    where l.id::text = (storage.foldername(name))[2]
      and l.owner_id = auth.uid()
  )
);

drop policy if exists "listing-media owner update" on storage.objects;
create policy "listing-media owner update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'listing-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from api.listings l
    where l.id::text = (storage.foldername(name))[2]
      and l.owner_id = auth.uid()
  )
)
with check (
  bucket_id = 'listing-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[3] in ('logo','cover','gallery')
  and exists (
    select 1
    from api.listings l
    where l.id::text = (storage.foldername(name))[2]
      and l.owner_id = auth.uid()
  )
);

drop policy if exists "listing-media owner delete" on storage.objects;
create policy "listing-media owner delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from api.listings l
    where l.id::text = (storage.foldername(name))[2]
      and l.owner_id = auth.uid()
  )
);

drop policy if exists "listing-media public read" on storage.objects;
create policy "listing-media public read"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'listing-media'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1
      from api.listings l
      where l.id::text = (storage.foldername(name))[2]
        and l.status = 'published'
        and l.is_active = true
    )
  )
);

-- A user editing a published listing cannot silently bypass moderation.
create or replace function private.requeue_listing_after_owner_edit()
returns trigger
language plpgsql
set search_path = private, api, pg_temp
as $$
begin
  if auth.uid() = old.owner_id
     and old.status = 'published'
     and new.status = old.status
     and (
       new.name is distinct from old.name
       or new.category is distinct from old.category
       or new.description is distinct from old.description
       or new.phone is distinct from old.phone
       or new.whatsapp is distinct from old.whatsapp
       or new.address is distinct from old.address
       or new.neighborhood is distinct from old.neighborhood
       or new.latitude is distinct from old.latitude
       or new.longitude is distinct from old.longitude
     )
  then
    new.status := 'pending';
    new.moderation_note := null;
    new.moderated_at := null;
    new.moderated_by := null;
  end if;

  return new;
end;
$$;

drop trigger if exists listings_requeue_after_owner_edit on api.listings;
create trigger listings_requeue_after_owner_edit
before update on api.listings
for each row execute function private.requeue_listing_after_owner_edit();

revoke all on function private.requeue_listing_after_owner_edit() from public, anon, authenticated;

-- Fix moderation note carry-forward and NULL action handling.
create or replace function api.moderate_listing(
  p_listing_id uuid,
  p_action text,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = private, api, pg_temp
as $$
declare
  v_owner uuid;
  v_prev text;
  v_new text;
  v_effective_note text;
  v_previous_note text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if p_action is null or p_action not in ('approve','reject','unpublish') then
    raise exception 'invalid action' using errcode = '22023';
  end if;

  if not private.has_moderator_role() then
    raise exception 'moderator role required' using errcode = '42501';
  end if;

  if p_note is not null and char_length(p_note) > 600 then
    raise exception 'note too long' using errcode = '22023';
  end if;

  select owner_id, status, moderation_note
  into v_owner, v_prev, v_previous_note
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

  v_effective_note := case
    when p_action = 'unpublish' then null
    else coalesce(p_note, v_previous_note)
  end;

  update api.listings
  set status = v_new,
      moderation_note = v_effective_note,
      moderated_at = now(),
      moderated_by = auth.uid(),
      updated_at = now()
  where id = p_listing_id;

  insert into private.moderation_log (
    listing_id, moderator_id, previous_status, new_status, note
  )
  values (
    p_listing_id, auth.uid(), v_prev, v_new, v_effective_note
  );

  return p_listing_id;
end;
$$;

revoke all on function api.moderate_listing(uuid, text, text) from public, anon;
grant execute on function api.moderate_listing(uuid, text, text) to authenticated, service_role;

-- Fix return shape: total is the fourth declared output column.
create or replace function api.moderation_counts()
returns table (pending bigint, published bigint, rejected bigint, total bigint)
language sql
stable
security definer
set search_path = private, api, pg_temp
as $$
  select
    count(*) filter (where status = 'pending')::bigint,
    count(*) filter (where status = 'published')::bigint,
    count(*) filter (where status = 'rejected')::bigint,
    count(*)::bigint
  from api.listings
  where private.has_moderator_role();
$$;

revoke all on function api.moderation_counts() from public, anon;
grant execute on function api.moderation_counts() to authenticated, service_role;

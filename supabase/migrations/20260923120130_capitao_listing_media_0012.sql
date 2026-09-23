-- CAPITÃO — listing media table + RLS (0012)
create table if not exists api.listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references api.listings(id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  storage_path text not null check (char_length(storage_path) between 3 and 500),
  media_type text not null check (media_type in ('logo','cover','gallery')),
  position smallint not null default 0 check (position between 0 and 50),
  created_at timestamptz not null default now(),
  unique (listing_id, storage_path)
);

create index if not exists listing_media_listing_idx on api.listing_media (listing_id, media_type, position);

alter table api.listing_media enable row level security;

revoke all on api.listing_media from anon, authenticated;

-- leitura pública apenas de mídia de listings publicados/ativos ou do próprio dono
grant select on api.listing_media to anon, authenticated;
grant insert (listing_id, storage_path, media_type, position, owner_id) on api.listing_media to authenticated;
grant update (storage_path, media_type, position) on api.listing_media to authenticated;
grant delete on api.listing_media to authenticated;

drop policy if exists listing_media_public_read on api.listing_media;
create policy listing_media_public_read
on api.listing_media
for select
to anon, authenticated
using (
  exists (
    select 1 from api.listings l
    where l.id = listing_id
      and l.status = 'published'
      and l.is_active = true
  )
);

drop policy if exists listing_media_owner_read on api.listing_media;
create policy listing_media_owner_read
on api.listing_media
for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists listing_media_owner_insert on api.listing_media;
create policy listing_media_owner_insert
on api.listing_media
for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
  and (select auth.uid()) = (select l.owner_id from api.listings l where l.id = listing_id)
  and storage_path like (owner_id::text || '/%')
);

drop policy if exists listing_media_owner_update on api.listing_media;
create policy listing_media_owner_update
on api.listing_media
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check (
  (select auth.uid()) = owner_id
  and storage_path like (owner_id::text || '/%')
);

drop policy if exists listing_media_owner_delete on api.listing_media;
create policy listing_media_owner_delete
on api.listing_media
for delete
to authenticated
using ((select auth.uid()) = owner_id);

grant all on api.listing_media to service_role;


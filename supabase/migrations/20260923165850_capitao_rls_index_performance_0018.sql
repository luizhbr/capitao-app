-- CAPITÃO — RLS/index performance hardening (0018)

create index if not exists listings_owner_idx
  on api.listings (owner_id);

create index if not exists listings_moderated_by_idx
  on api.listings (moderated_by)
  where moderated_by is not null;

create index if not exists listing_media_owner_idx
  on api.listing_media (owner_id);

create index if not exists moderation_log_listing_idx
  on private.moderation_log (listing_id);

create index if not exists moderation_log_moderator_idx
  on private.moderation_log (moderator_id);

-- One SELECT policy per table/role path avoids evaluating multiple permissive
-- policies for every authenticated read while preserving public + owner access.
drop policy if exists listings_public_read on api.listings;
drop policy if exists listings_owner_read on api.listings;

create policy listings_read
on api.listings
for select
to anon, authenticated
using (
  (status = 'published' and is_active = true)
  or ((select auth.uid()) = owner_id)
);

drop policy if exists listing_media_public_read on api.listing_media;
drop policy if exists listing_media_owner_read on api.listing_media;

create policy listing_media_read
on api.listing_media
for select
to anon, authenticated
using (
  ((select auth.uid()) = owner_id)
  or exists (
    select 1
    from api.listings l
    where l.id = listing_id
      and l.status = 'published'
      and l.is_active = true
  )
);

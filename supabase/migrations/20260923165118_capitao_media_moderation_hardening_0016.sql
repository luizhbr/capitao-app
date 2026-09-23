-- CAPITÃO — media moderation hardening (0016)

-- Public storage reads require a real api.listing_media row linked to a
-- published/active listing. Owners may still read their own pending media.
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
      from api.listing_media m
      join api.listings l on l.id = m.listing_id
      where m.storage_path = name
        and l.status = 'published'
        and l.is_active = true
    )
  )
);

-- Any owner-driven media change to a published listing sends the listing back
-- to moderation. The trigger runs with definer rights so protected status fields
-- never need to be granted to the owner.
create or replace function private.requeue_listing_after_media_change()
returns trigger
language plpgsql
security definer
set search_path = private, api, pg_temp
as $$
declare
  v_listing_id uuid;
  v_owner_id uuid;
begin
  if tg_op = 'DELETE' then
    v_listing_id := old.listing_id;
    v_owner_id := old.owner_id;
  else
    v_listing_id := new.listing_id;
    v_owner_id := new.owner_id;
  end if;

  if auth.uid() = v_owner_id then
    update api.listings
    set status = 'pending',
        moderation_note = null,
        moderated_at = null,
        moderated_by = null,
        updated_at = now()
    where id = v_listing_id
      and owner_id = v_owner_id
      and status = 'published';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke all on function private.requeue_listing_after_media_change() from public, anon, authenticated;

drop trigger if exists listing_media_requeue_after_owner_change on api.listing_media;
create trigger listing_media_requeue_after_owner_change
after insert or update or delete on api.listing_media
for each row execute function private.requeue_listing_after_media_change();

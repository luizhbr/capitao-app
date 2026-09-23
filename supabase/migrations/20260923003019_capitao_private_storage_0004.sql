insert into storage.buckets (id, name, public)
values ('private-user-assets', 'private-user-assets', false)
on conflict (id) do update set public = false;

create policy private_assets_select_own on storage.objects
for select to authenticated
using (
  bucket_id = 'private-user-assets'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy private_assets_insert_own_folder on storage.objects
for insert to authenticated
with check (
  bucket_id = 'private-user-assets'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy private_assets_update_own on storage.objects
for update to authenticated
using (
  bucket_id = 'private-user-assets'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'private-user-assets'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy private_assets_delete_own on storage.objects
for delete to authenticated
using (
  bucket_id = 'private-user-assets'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

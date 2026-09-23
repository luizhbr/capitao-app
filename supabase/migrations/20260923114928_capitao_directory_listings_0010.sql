create table if not exists api.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  category text not null check (category in ('commerce','food','services','tourism','producer','tech')),
  description text check (description is null or char_length(description) <= 1000),
  phone text check (phone is null or char_length(phone) <= 30),
  whatsapp text check (whatsapp is null or char_length(whatsapp) <= 30),
  address text check (address is null or char_length(address) <= 200),
  neighborhood text check (neighborhood is null or char_length(neighborhood) <= 100),
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table api.listings enable row level security;

revoke all on api.listings from anon, authenticated;

grant select on api.listings to anon, authenticated;
grant insert (name, category, description, phone, whatsapp, address, neighborhood) on api.listings to authenticated;
grant update (name, category, description, phone, whatsapp, address, neighborhood) on api.listings to authenticated;
grant delete on api.listings to authenticated;

drop policy if exists listings_public_read on api.listings;
create policy listings_public_read
on api.listings
for select
to anon, authenticated
using (status = 'published' and is_active = true);

drop policy if exists listings_owner_read on api.listings;
create policy listings_owner_read
on api.listings
for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists listings_owner_insert on api.listings;
create policy listings_owner_insert
on api.listings
for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
  and status = 'pending'
  and is_active = true
);

drop policy if exists listings_owner_update on api.listings;
create policy listings_owner_update
on api.listings
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists listings_owner_delete on api.listings;
create policy listings_owner_delete
on api.listings
for delete
to authenticated
using ((select auth.uid()) = owner_id);

drop trigger if exists listings_set_updated_at on api.listings;
create trigger listings_set_updated_at
before update on api.listings
for each row execute function private.set_updated_at();

grant all on api.listings to service_role;

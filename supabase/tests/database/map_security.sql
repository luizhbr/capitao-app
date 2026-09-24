begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

select has_column('api','listings','latitude','listings has latitude');
select has_column('api','listings','longitude','listings has longitude');
select has_column('api','listings','geocoding_status','listings has geocoding_status');
select has_column('api','listings','geocoding_source','listings has geocoding_source');
select has_column('api','listings','geocoded_at','listings has geocoded_at');

select ok(has_column_privilege('authenticated','api.listings','latitude','INSERT'),'authenticated can insert latitude');
select ok(has_column_privilege('authenticated','api.listings','longitude','INSERT'),'authenticated can insert longitude');
select ok(has_column_privilege('authenticated','api.listings','geocoding_status','UPDATE'),'authenticated can update geocoding status');
select ok(not has_column_privilege('authenticated','api.listings','status','UPDATE'),'authenticated cannot self-publish');

select ok(
  exists (
    select 1
    from pg_constraint
    where conname = 'listings_coords_range'
  ),
  'coordinate range constraint exists'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname='api'
      and tablename='listings'
      and policyname='listings_read'
  ),
  'public and owner listing reads are RLS protected'
);

select * from finish();
rollback;

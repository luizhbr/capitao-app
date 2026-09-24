-- CAPITÃO — geocoding metadata for shared city map (0019)

alter table api.listings
  add column if not exists geocoding_status text,
  add column if not exists geocoding_source text,
  add column if not exists geocoded_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'listings_geocoding_status_check'
  ) then
    alter table api.listings
      add constraint listings_geocoding_status_check
      check (
        geocoding_status is null
        or geocoding_status in ('pending','resolved','manual','failed')
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'listings_geocoding_source_check'
  ) then
    alter table api.listings
      add constraint listings_geocoding_source_check
      check (
        geocoding_source is null
        or geocoding_source in ('nominatim','manual','import')
      );
  end if;
end $$;

grant insert (geocoding_status, geocoding_source, geocoded_at)
  on api.listings to authenticated;

grant update (geocoding_status, geocoding_source, geocoded_at)
  on api.listings to authenticated;

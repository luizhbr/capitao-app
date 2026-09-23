-- CAPITÃO — admin fields + moderation history + coordinates (0011)
-- Aditivo: não altera colunas existentes. Campos novos são opcionais.

alter table api.listings
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists moderation_note text,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references auth.users(id) on delete set null;

-- coordenadas válidas apenas em pares (ambas nulas ou ambas presentes e em range)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'listings_coords_range'
  ) then
    alter table api.listings
      add constraint listings_coords_range
      check (
        (latitude is null and longitude is null)
        or (
          latitude is not null and longitude is not null
          and latitude between -90 and 90
          and longitude between -180 and 180
        )
      );
  end if;
end $$;

-- nota de moderação limitada
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'listings_moderation_note_len'
  ) then
    alter table api.listings
      add constraint listings_moderation_note_len
      check (moderation_note is null or char_length(moderation_note) <= 600);
  end if;
end $$;

-- histórico de moderação (schema private, sem exposição)
create table if not exists private.moderation_log (
  id bigint generated always as identity primary key,
  listing_id uuid not null references api.listings(id) on delete cascade,
  moderator_id uuid not null references auth.users(id) on delete cascade,
  previous_status text not null,
  new_status text not null,
  note text check (note is null or char_length(note) <= 600),
  created_at timestamptz not null default now()
);

alter table private.moderation_log enable row level security;

revoke all on private.moderation_log from public, anon, authenticated;
grant all on private.moderation_log to service_role;


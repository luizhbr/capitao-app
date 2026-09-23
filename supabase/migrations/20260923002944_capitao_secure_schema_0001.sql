create schema if not exists api;
create schema if not exists private;

create table if not exists api.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 80),
  avatar_path text check (avatar_path is null or char_length(avatar_path) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists api.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 160),
  summary text check (summary is null or char_length(summary) <= 2000),
  status text not null default 'idea' check (status in ('idea','research','viability','project','funding','execution','done')),
  progress smallint not null default 0 check (progress between 0 and 100),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists private.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('moderator','institute_admin','platform_admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

alter table api.profiles enable row level security;
alter table api.projects enable row level security;
alter table private.user_roles enable row level security;

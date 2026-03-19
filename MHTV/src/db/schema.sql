create extension if not exists pg_trgm;

create table if not exists sources (
  id text primary key,
  name text not null,
  enabled boolean not null default true,
  priority integer not null default 100,
  base_region text,
  last_ingested_at timestamptz,
  status text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists source_feeds (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references sources(id) on delete cascade,
  feed_type text not null,
  region text,
  url text,
  checksum text,
  fetched_at timestamptz,
  parsed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  unique (source_id, feed_type, region, url)
);

create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  stremio_id text not null unique,
  canonical_slug text not null unique,
  name text not null,
  tvg_id text,
  tvg_name text,
  tvg_logo text,
  group_title text not null,
  source_id text not null references sources(id),
  region text,
  country_code text,
  language text,
  is_nsfw boolean not null default false,
  is_geo_blocked boolean not null default false,
  quality text,
  stream_mode text not null default 'hls',
  website text,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  searchable text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists channel_aliases (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  alias text not null,
  alias_type text not null,
  unique (channel_id, alias, alias_type)
);

create table if not exists channel_streams (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  source_id text not null references sources(id),
  stream_url text not null,
  backup_stream_url text,
  referer text,
  user_agent text,
  http_headers jsonb not null default '{}'::jsonb,
  quality text,
  priority integer not null default 100,
  is_active boolean not null default true,
  last_checked_at timestamptz,
  failure_count integer not null default 0,
  unique (channel_id, source_id, stream_url)
);

create table if not exists programmes (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  xmltv_channel_id text,
  title text not null,
  subtitle text,
  description text,
  category text[] not null default '{}',
  start_at timestamptz not null,
  end_at timestamptz not null,
  episode_num text,
  season integer,
  episode integer,
  artwork jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  unique (channel_id, start_at, end_at, title)
);

create table if not exists ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references sources(id),
  feed_id uuid references source_feeds(id),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null,
  channels_seen integer not null default 0,
  programmes_seen integer not null default 0,
  error_summary text,
  stats jsonb not null default '{}'::jsonb
);

create index if not exists idx_channels_group_title on channels(group_title);
create index if not exists idx_channels_source_region on channels(source_id, region);
create index if not exists idx_channels_tvg_id on channels(tvg_id);
create index if not exists idx_channels_searchable_trgm on channels using gin (searchable gin_trgm_ops);
create index if not exists idx_channel_streams_channel_priority on channel_streams(channel_id, priority);
create index if not exists idx_programmes_channel_start on programmes(channel_id, start_at desc);
create index if not exists idx_programmes_time on programmes(start_at, end_at);

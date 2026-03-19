# MHTV Setup

This guide explains how to get MHTV running from scratch.

## What You Need

- Docker Desktop or Docker Engine with `docker compose`
- A Supabase project
- Node.js 20+ only if you want to run MHTV without Docker

## Project Layout

- `reference/`: frontend style source used by the config page
- `tvapp/`: local clone of TVApp2
- `src/`: MHTV server, addon, ingestion worker, and UI
- `src/db/schema.sql`: database schema you must apply in Supabase
- `.env.example`: environment template

## 1. Create Supabase

Create a Supabase project, then collect:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Open the SQL editor in Supabase and run the contents of:

- [src/db/schema.sql](/C:/Users/cmanb/Documents/Projects/MHTV/src/db/schema.sql)

That creates the tables MHTV uses for cached channels, streams, and EPG data.

## 2. Create Your `.env`

Copy `.env.example` to `.env`.

Minimum required values:

```env
PORT=7000
BASE_URL=http://localhost:7000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_SCHEMA=public
INGEST_CRON=0 */6 * * *
STREAM_PROBE_TIMEOUT_MS=1000
USER_AGENT=MHTV/0.1 (+https://mediahoard.local)
PROXY_REFERER=https://i.mjh.nz/
TVAPP_BASE_URL=http://tvapp:4124
TVAPP_HEALTH_URL=http://tvapp:4124/api/health
TVAPP_M3U_PATH=/shared/tvapp/playlist.m3u8
TVAPP_XMLTV_PATH=/shared/tvapp/xmltv.xml
MJH_PROVIDER_URLS=https://i.mjh.nz/PlutoTV/us.m3u8,https://i.mjh.nz/SamsungTVPlus/us.m3u8
MJH_EPG_URLS=https://i.mjh.nz/PlutoTV/us.xml,https://i.mjh.nz/SamsungTVPlus/us.xml
```

## 3. Run With Docker

From the project root:

```powershell
docker compose up --build
```

This starts:

- `mhtv`: the Express server and Stremio addon
- `tvapp`: a TVApp2 container feeding cached playlist and XMLTV data into the shared volume

## 4. Open the App

After the containers start, open:

- Config page: `http://localhost:7000/`
- Health check: `http://localhost:7000/health`
- Default manifest: `http://localhost:7000/manifest.json`

## 5. Trigger Ingestion

MHTV reads only from cached database data. It does not fetch playlists on user requests.

To run ingestion immediately:

```powershell
docker compose exec mhtv node dist/ingestion/worker.js
```

You can also wait for the cron schedule from `INGEST_CRON`.

## 6. Test the Addon

After ingestion completes:

- open the config page at `http://localhost:7000/`
- select sources and regions
- click the generate button
- copy the `stremio://...` URL into Stremio

You can also test a manifest directly in the browser:

```text
http://localhost:7000/manifest.json
```

If you generate a custom config, the URL format will be:

```text
http://localhost:7000/<config-token>/manifest.json
```

## 7. Test Catalogs and Streams

Example routes:

```text
http://localhost:7000/catalog/tv/mhtv-search/search=cnn.json
http://localhost:7000/meta/tv/mhtv:channel:us-cnn-us.json
```

Exact channel ids depend on ingested data.

## 8. Run Without Docker

Only do this if you want to debug locally.

First install dependencies:

```powershell
npm.cmd install
```

Build and start:

```powershell
npm.cmd run build
npm.cmd start
```

For local non-Docker runs, set these `.env` values to real files on disk:

```env
TVAPP_M3U_PATH=C:\path\to\playlist.m3u8
TVAPP_XMLTV_PATH=C:\path\to\xmltv.xml
TVAPP_BASE_URL=http://localhost:4124
TVAPP_HEALTH_URL=http://localhost:4124/api/health
```

## Troubleshooting

### Config page loads, but catalogs are empty

Usually means ingestion has not run yet, or Supabase schema was not applied.

Check:

- `docker compose exec mhtv node dist/ingestion/worker.js`
- Supabase tables exist
- `.env` values are correct

### TVApp data is missing

The current compose file expects TVApp output files at:

- `/shared/tvapp/playlist.m3u8`
- `/shared/tvapp/xmltv.xml`

If your TVApp container writes somewhere else, update:

- `TVAPP_M3U_PATH`
- `TVAPP_XMLTV_PATH`
- the shared volume mapping in [docker-compose.yml](/C:/Users/cmanb/Documents/Projects/MHTV/docker-compose.yml)

Note:

- the current compose file uses the published `ghcr.io/thebinaryninja/tvapp2:latest` image because the local upstream Docker build path can fail during `s6-overlay` init
- the local `tvapp/` clone is still kept in the repo for development and future local-source integration work

### Streams fail in Stremio

Check:

- the provider actually ingested stream URLs
- proxy route works at `/proxy`
- HEAD probing is not timing out too aggressively for your network

You can increase:

```env
STREAM_PROBE_TIMEOUT_MS=1500
```

## Quick Start Summary

1. Create Supabase.
2. Run the SQL schema.
3. Create `.env`.
4. Run `docker compose up --build`.
5. Run `docker compose exec mhtv node dist/ingestion/worker.js`.
6. Open `http://localhost:7000/`.
7. Generate the Stremio install URL and test it.

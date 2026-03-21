# MH Addons

This repository contains the full local `MediaHoard` addon suite:

- `MHStreams`: streaming media aggregation addon
- `MHMetadata`: metadata aggregation addon
- `MHTV`: live TV / IPTV addon
- root dashboard: local launcher and status page for the full suite

The goal of this repo is to let you run, develop, and manage all three addons together from one workspace.

## What’s In This Repo

### Root

- `README.md`: current local dev notes
- `scripts/dashboard.mjs`: root dashboard server
- `scripts/dev.mjs`: root multi-app dev runner
- `package.json`: root scripts for dashboard/dev

### MHStreams

`MHStreams` is the stream aggregation layer for MediaHoard/Stremio. It unifies streams from built-in tools, imported addons, and debrid-connected sources into a single configurable interface.

Core strengths:

- unified stream results from multiple addons and services
- centralized filtering, sorting, formatting, and deduplication
- built-in scrapers and integrations
- metadata/catalog coordination from one UI
- strong MediaHoard-focused customization

### MHMetadata

`MHMetadata` is the metadata aggregation layer. It combines data from multiple sources for movies, series, anime, catalogs, artwork, streaming availability, and search.

Core strengths:

- multi-source metadata selection per media type
- rich artwork from multiple providers
- strong anime support
- custom catalogs and streaming catalogs
- secure per-user configuration and caching

### MHTV

`MHTV` is the live TV / IPTV addon. It provides a dedicated config UI and Stremio addon for channel catalogs and streams, backed by ingestion and cached playlist/XMLTV data.

Core strengths:

- IPTV-focused config experience
- cached ingestion instead of live user-request fetching
- provider and region controls
- manifest-token-based installs

## Root Dev Workflow

From the repo root:

```powershell
npm run dev
```

That starts:

- root dashboard at `http://localhost:4100`
- `MHStreams` UI at `http://localhost:3200`
- `MHStreams` addon backend at `http://localhost:3201`
- `MHMetadata` UI at `http://localhost:5173`
- `MHMetadata` addon backend at `http://localhost:3232`
- `MHTV` at `http://localhost:7000`

## First-Time Setup

Install dependencies inside each project first:

```powershell
cd MHStreams
pnpm install

cd ..\MHMetadata
npm install

cd ..\MHTV
npm install

cd ..
```

Then run:

```powershell
npm run dev
```

## Local Ports

These ports are reserved by the root runner:

- `4100`: root dashboard
- `3200`: `MHStreams` UI
- `3201`: `MHStreams` addon backend
- `5173`: `MHMetadata` UI
- `3232`: `MHMetadata` addon backend
- `7000`: `MHTV`

If any of those ports are already in use, the root runner exits early.

## Dashboard

Open:

```text
http://localhost:4100
```

The dashboard:

- links directly to all three addons
- shows current reachability of each main UI port
- acts as the landing page for local development

## Addon Overview

## MHStreams

`MHStreams` is a MediaHoard stream aggregator originally forked from `AIOStreams`.

It is designed to act as a master hub for stream sources, combining results from multiple addons, services, and built-in tools into one output list.

### MHStreams Features

- unified stream results from multiple sources
- one-click configuration for supported addons/services
- live updates and centralized settings
- support for importing external MediaHoard/Stremio addons
- built-in filtering and sorting engine
- custom formatter / templating system
- proxy support through internal or external services

### MHStreams Built-In Tools

Examples called out in the existing docs:

- Google Drive integration
- TorBox Search
- Knaben
- Zilean
- AnimeTosho
- Torrent Galaxy
- Bitmagnet
- Jackett
- Prowlarr
- NZBHydra
- Newznab
- Torznab

### MHStreams Dev

Frontend:

```powershell
cd MHStreams\packages\frontend
npm run dev
```

Workspace-level install:

```powershell
cd MHStreams
pnpm install
```

Main project readme:

- [MHStreams/README.md](/C:/Users/cmanb/Documents/Projects/MH-Addons/MHStreams/README.md)

## MHMetadata

`MHMetadata` is a multi-source Stremio metadata addon focused on power-user control over providers, artwork, search, and catalogs.

### MHMetadata Features

- metadata source selection for movies, series, and anime
- artwork from TMDB, TVDB, Fanart.tv, AniList, RPDB, and more
- anime support across MAL, AniList, Kitsu, AniDB, TVDB, and IMDb-linked flows
- custom catalogs and streaming catalogs
- dynamic search with optional AI-powered search
- secure per-user config loading/saving
- Redis-backed caching and config storage

### MHMetadata Key Endpoints

- `/stremio/:userUUID/:compressedConfig/manifest.json`
- `/api/config/save`
- `/api/config/load/:userUUID`
- `/api/config/update/:userUUID`
- `/api/config/is-trusted/:uuid`
- `/poster/:type/:id`
- `/resize-image`
- `/api/image/blur`

### MHMetadata Dev

Backend:

```powershell
cd MHMetadata
npm run dev:server
```

Frontend:

```powershell
cd MHMetadata
npm run dev
```

Main project readme:

- [MHMetadata/README.md](/C:/Users/cmanb/Documents/Projects/MH-Addons/MHMetadata/README.md)

## MHTV

`MHTV` is the dedicated live TV / IPTV addon in this repo.

It uses cached ingestion and a dedicated config page instead of fetching playlists directly on user requests.

### MHTV Project Layout

- `src/`: server, addon, ingestion worker, and UI
- `src/db/schema.sql`: required Supabase schema
- `reference/`: config-page style source
- `tvapp/`: local clone of TVApp2
- `.env.example`: environment template

### MHTV Requirements

- Docker Desktop or Docker Engine with `docker compose`
- Supabase project
- Node.js 20+ for non-Docker local runs

### MHTV Minimum Environment Values

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

### MHTV Docker Run

From the `MHTV` project root:

```powershell
docker compose up --build
```

### MHTV Important URLs

- config page: `http://localhost:7000/`
- health check: `http://localhost:7000/health`
- default manifest: `http://localhost:7000/manifest.json`

### MHTV Ingestion

To run ingestion immediately:

```powershell
docker compose exec mhtv node dist/ingestion/worker.js
```

### MHTV Local Non-Docker Run

```powershell
cd MHTV
npm.cmd install
npm.cmd run build
npm.cmd start
```

Main setup doc:

- [MHTV/SETUP.md](/C:/Users/cmanb/Documents/Projects/MH-Addons/MHTV/SETUP.md)

## Per-Project Build Commands

### MHStreams Frontend

```powershell
cd MHStreams\packages\frontend
npm run build
```

### MHMetadata

```powershell
cd MHMetadata
npm run build
```

### MHTV

```powershell
cd MHTV
npm run build
```

## Suggested Daily Workflow

1. Install dependencies in each project once.
2. Start everything from the repo root with `npm run dev`.
3. Open the root dashboard at `http://localhost:4100`.
4. Use each addon UI directly:
   - `MHStreams`: `http://localhost:3200`
   - `MHMetadata`: `http://localhost:5173`
   - `MHTV`: `http://localhost:7000`
5. Build individual projects from their own directories when needed.

## Credits

This repo builds on the work of multiple upstream projects and maintainers.

Notable upstream references mentioned in the existing docs include:

- `AIOStreams` / Viren070
- Cedya77 / AIOMetadata-related work
- Stremio
- TMDB
- TVDB
- MyAnimeList
- AniList
- Fanart.tv
- MDBList
- RPDB
- TVApp2

See the original project readmes for the fuller credit lists.

## Disclaimer

This repository aggregates and configures third-party data sources and addon integrations.

- it does not claim ownership of third-party metadata, streams, or external services
- data availability and accuracy are not guaranteed
- users are responsible for complying with applicable laws and service terms

## Reference Docs

- [README.md](/C:/Users/cmanb/Documents/Projects/MH-Addons/README.md)
- [MHStreams/README.md](/C:/Users/cmanb/Documents/Projects/MH-Addons/MHStreams/README.md)
- [MHMetadata/README.md](/C:/Users/cmanb/Documents/Projects/MH-Addons/MHMetadata/README.md)
- [MHTV/SETUP.md](/C:/Users/cmanb/Documents/Projects/MH-Addons/MHTV/SETUP.md)

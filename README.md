# MH Addons Local Dev

This repo contains three separate local addon projects:

- `MHStreams`
- `MHMetadata`
- `MHTV`

## Root Command

From the repo root:

```powershell
npm run dev
```

That starts:

- the root dashboard at `http://localhost:4100`
- `MHStreams` on `http://localhost:3200`
- `MHStreams` addon backend on `http://localhost:3201`
- `MHMetadata` UI on `http://localhost:5173`
- `MHMetadata` addon backend on `http://localhost:3232`
- `MHTV` on `http://localhost:7000`

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

After that, run:

```powershell
npm run dev
```

## Dashboard

Open:

```text
http://localhost:4100
```

The dashboard links directly to all three addons and shows whether each main UI port is reachable.

## Standard Local Ports

These ports are reserved by the root dev runner:

- `4100`: root dashboard
- `3200`: `MHStreams` UI
- `3201`: `MHStreams` addon backend
- `5173`: `MHMetadata` UI
- `3232`: `MHMetadata` addon backend
- `7000`: `MHTV`

If any of those ports are already in use, the root runner exits early and tells you which one blocked startup.

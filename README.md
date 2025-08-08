# Waypoint — prototype v0.4

This is a Vite + React + MapLibre prototype for Waypoint.

## Quick Deploy (Vercel)

1. Go to https://vercel.com (sign in with Google/GitHub).
2. Click **New Project** → **Upload** and drop this folder (zip the project if needed).
3. Vercel detects Vite automatically. Confirm:
   - **Build Command:** `vite build`
   - **Output Directory:** `dist`
4. Click **Deploy**. Wait 30–60 seconds for your live URL.

## Local Dev

```bash
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173).

## Features in v0.4

- MapLibre map centered by your GPS (blur/exact toggle)
- 3-mile general-area sharing (privacy-focused option)
- Layer toggles + opacity sliders for:
  - USGS Shaded Relief
  - USGS Topo
  - ESA WorldCover (demo tiles)

## Coming next

- BirdCast migration intensity layer toggle
- eBird recent observations overlay
- Trace property boundary (save locally)

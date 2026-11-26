# TerraFauna

An interactive static web atlas for comparative zoology, evolutionary taxonomy, IUCN conservation status tracking, and verified wildlife bioacoustics.

## Overview

TerraFauna organizes curated taxonomic profiles along a scroll-driven botanical evolutionary tree, paired with an interactive taxonomic database drawer, species specimen inspection modal, live search and IUCN status filtering, and authentic field recordings.

### Highlights

- **Curated Species Catalog**: 116 curated taxa spanning mammals, domestic species and breeds, birds, reptiles, amphibians, marine fauna, monotremes, and insects.
- **Personal Custom Entries (`Add Animal`)**: Add your own animal notes, compressed device photos or image URLs, device audio uploads or audio URLs, and attached reference links saved privately in your browser's storage (`localStorage` & `IndexedDB`) on your device—never modifying the global catalog.
- **Authentic Wildlife Audio**: 66 local field recordings stored in `audio/` with playback controls synced directly to the navigation drawer (`Play`, `Pause`, `Stop`). Species without a verified local recording explicitly display playback unavailable rather than using fabricated sound.
- **Interactive Inspection**: Taxonomic classification, IUCN conservation breakdown (`CR`, `EN`, `VU`, `NT`, `LC`, `DD`), habitat and trophic profiles, evolutionary tree navigation, and live GBIF record enrichment where available.
- **Themes & Display Modes**: Dark and light themes with a toggleable frosted-glass (`Glossy`) surface mode and responsive layouts across desktop and mobile viewports.

## Project Structure

```text
.
├── index.html          # Main application entry point
├── css/                # Theme palettes, layout rules, and glassmorphism styles
├── js/                 # Application logic, catalog datasets, and audio player
├── audio/              # Verified wildlife audio recordings (.ogg, .oga, .mp3, .wav)
├── dev-server.js       # Zero-dependency local Node.js static dev server
├── package.json        # Local dev scripts and metadata
├── _headers            # Cloudflare Pages cache & security headers
└── README.md
```

## Run Locally

Requires Node.js (static HTML/CSS/ES modules with no build step or npm dependencies):

```bash
node dev-server.js
```

Then open `http://localhost:8000` in your browser.

## Deploy to Cloudflare Pages (Recommended with GitHub)

TerraFauna is a pure static site with zero build dependencies (`index.html` at repository root):

1. Push this repository to GitHub.
2. In the **Cloudflare Dashboard**, go to **Workers & Pages -> Create -> Pages -> Connect to Git**.
3. Select your GitHub repository and configure:
   - **Production branch**: `main`
   - **Framework preset**: `None`
   - **Build command**: *(leave blank)*
   - **Build output directory**: `/` *(or leave blank / root)*
4. Click **Save and Deploy**. Every future `git push` to `main` automatically deploys an update.

> **Note**: Because all asset and `audio/` links use relative paths (`./audio/...`), the site also works cleanly on **GitHub Pages** subpaths if needed.

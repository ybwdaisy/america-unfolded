# America Unfolded

> Explore American history through maps.

A free, static atlas of U.S. territorial formation, 1776–1959. An independently written application with dated Newberry geometry, 15 sourced chapters, a guided story, and no accounts, database, paid map API or analytics.

## Run locally

Node.js 22 or later:

```sh
npm ci --ignore-scripts
npm run dev
```

Open http://localhost:4173. The server builds once on startup; after source edits, run `npm run build` and refresh. `npm run build` emits the static site in `dist/`.

## Verify

```sh
npm test
npx playwright install webkit
npm run test:browser
```

Browser tests use an installed Google Chrome and Playwright WebKit. Mobile tests use iPhone emulation and synthetic touch gestures; they do not certify a physical iPhone or the Safari app. See [docs/VERIFICATION.md](docs/VERIFICATION.md) for the actual recorded results and limitations.

## Data and chapters

- `src/data/events.mjs`: editorial event dates, summaries, source links and story route.
- `public/data/manifest.json`: dated snapshot index, lazy loaded.
- `public/data/snapshot-*.json`: TopoJSON, with original source record properties and citations.
- `public/data/modern.json`: December 31, 2000 state/district reference, not a current boundary survey.
- `scripts/generate_maps.py` and `scripts/topology.mjs`: reproducible conversion from the official source archive.
- `docs/DATA-PROVENANCE.json`: archive URL, SHA-256 and encoding details.
- `docs/LICENSES.md` and `docs/licenses/`: source/license inventory and retained evidence.
- `docs/RESEARCH.md`: scope and competitor research.

Maps follow the source atlas’s record dates (with the documented final Gadsden footprint delayed to June 30, 1854), which sometimes use treaty signature rather than transfer or entry into force. Chapters distinguish these dates. Hatching summarizes claims and pending transfers. No map is interpolated; 1776 deliberately has no supplied historical boundary. Indigenous sovereignty and effective control are not comprehensively mapped.

To regenerate geometry, download the archive in DATA-PROVENANCE.json, then use Python `pyshp` and `shapely`:

```sh
python scripts/generate_maps.py /path/to/US_AtlasHCB_StateTerr_Gen01.zip
node scripts/topology.mjs
npm run build
npm test
```

The topology step deterministically quantizes coordinates on a 100,000-step grid, removes collapsed sub-grid rings and preserves winding. It does not invent historical boundaries. Source generalization and encoding precision are documented in the methods page.

## Routes and state

Each event has a crawlable `/events/<slug>/` page with readable text and sources before JavaScript runs. `/story/how-america-took-shape/`, `/sources/` and `/about/` are also static routes. Query parameters preserve date, event, region, map transform, comparison, reference lines and story mode. Browser back/forward restores them.

`SITE_ORIGIN=https://your-approved-host` sets canonical and sitemap origins. Vercel builds use the real deployment hostname from `VERCEL_URL`; local builds use localhost. No unregistered domain is asserted.

## Deployment policy

This repository is private. Product changes belong on a feature branch and in a PR. The independent Vercel project is **america-unfolded**, with automatic Git deployment disabled in `vercel.json`. Preview deployment is pending a reliable environment check through the connected Vercel tool. The installed CLI/API path misclassified non-production requests; those deployments were removed. Do not deploy through that path until the environment behavior is resolved; see docs/DEPLOYMENT.md. No production deployment is retained, and no domain was registered.

The Vercel project's GitHub integration could not see the private repository during setup, so the preview uses the authenticated CLI. No other project, environment variable, database, auth or payment resource is shared.

## License

Original application code and prose: MIT. Newberry data: current reuse statement / Library of Congress CC0 designation. Fonts: SIL OFL 1.1. D3: ISC; TopoJSON: ISC. See the detailed inventory for the older packaged Newberry notice and current evidence. Reference-project GPL code and CHGIS layers are not included.

Gadsden display correction: the atlas’s record starts December 30, 1853, but the final footprint shown here was reduced during ratification. The map withholds that geometry until June 30, 1854, retaining the original START_DATE and adding DISPLAY_START. Source: https://avalon.law.yale.edu/19th_century/mx1853.asp . No earlier proposal polygon is invented.

# America Unfolded

> Explore American history through maps.

A free, static atlas of U.S. territorial formation, 1776–1959. An independently written application with dated Newberry geometry, 15 sourced chapters, a guided story, and no accounts, database or paid map API. Optional, consent-based GA4 is isolated to the production hostname; QA, automation, local and preview traffic never load it.

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
npm run test:transitions
npm run test:analytics
npm run funnels:check
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

`SITE_ORIGIN=https://usa.ybwdaisy.com` sets canonical and sitemap origins. Production uses the approved usa hostname; previews are noindex and do not load GA4. Local builds use localhost unless an origin is explicitly supplied. `GA_MEASUREMENT_ID` is configured only for production.

## Deployment policy

This repository is private. Product changes stay on `feat/historical-atlas` and PR #2 for review; the owner's later explicit instruction authorizes production publication without automatically merging the PR. The independent Vercel project is **america-unfolded**, linked to `ybwdaisy/america-unfolded`; production is published manually from the tested feature commit. Automatic Git deployment remains disabled. The approved production hostname is **usa.ybwdaisy.com**, with one project-specific CNAME at Aliyun. No existing DNS records or other projects are modified.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the earlier preview classification incident and subsequent release record. No domain purchase or paid service is required. Public funnel configuration is maintained only in `analytics/funnels.json` and published byte-for-byte at `/.well-known/site-pulse.json`; the build and CI validate the Site Pulse public v1 contract. See docs/ANALYTICS.md for resource IDs, events, consent and QA isolation.

## License

Original application code and prose: MIT. Newberry data: current reuse statement / Library of Congress CC0 designation. Fonts: SIL OFL 1.1. D3: ISC; TopoJSON: ISC. See the detailed inventory for the older packaged Newberry notice and current evidence. Reference-project GPL code and CHGIS layers are not included.

Gadsden display correction: the atlas’s record starts December 30, 1853, but the final footprint shown here was reduced during ratification. The map withholds that geometry until June 30, 1854, retaining the original START_DATE and adding DISPLAY_START. Source: https://avalon.law.yale.edu/19th_century/mx1853.asp . No earlier proposal polygon is invented.

Timeline rendering retains the visible map while the next dated snapshot loads. Only changed regions use a 160ms opacity transition; boundary vertices are never interpolated. Playback prefetches the next year’s snapshot pair, and an eight-snapshot recent-view cache limits phone memory. The reduced-motion preference skips fades. See docs/TIMELINE-TRANSITIONS.md.

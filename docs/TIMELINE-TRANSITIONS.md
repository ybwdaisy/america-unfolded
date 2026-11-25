# Continuous timeline changes

2026-11-24. Playback and scrubbing no longer cover a loaded map with the initial opaque loading panel on every change.

- The visible snapshot stays in place while the next current/before pair loads. The new map, chapter and source caption commit together after the requested data is ready.
- Unchanged source-region IDs remain fully opaque. Entering, exiting or restyled regions use a short 160ms opacity transition between exact dated SVG paths. No vertices, dates or historical boundaries are interpolated.
- Playback prefetches only the next year’s current/before snapshot pair. Recent snapshot requests use an eight-entry LRU cache; projected paths and labels reuse weak caches. Static geographic context and graticules are not rebuilt per year.
- Scrubbing updates at a bounded interval and commits the latest request. A completed older response cannot overwrite a later selection. The thumb follows the user's requested year during dragging, and the map's pan/zoom transform is preserved. This also fixes an unintended use of the browser's global `focus` function in year changes.
- Initial loading still has a loading state. A failed subsequent request retains the previous valid map, restores its date/description, and presents a compact retry notice. Reduced-motion users receive immediate snapshot swaps without fades. Ghost paths are noninteractive and hidden from assistive technology.

Run `npm run test:transitions`. Eleven checks across Chrome and iPhone-emulated WebKit passed; results are in `evidence/transition-results.json`. They sample actual animation frames to detect blank geometry, a reappearing opaque loader or fading of unchanged Pennsylvania (source record ID 156 across the tested interval). They also cover slow responses, rapid scrubbing, preserved camera position, playback prefetch, retry and reduced motion. The 1848 year selection uses the year-end convention and correctly displays the August 14 snapshot, rather than the earlier July treaty-proclamation snapshot.

The existing 26 interaction checks and seven data/build checks also passed. Historical source data, routes, styling and delivery policy are otherwise unchanged. This is a local-preview and PR update only.

## Annual playback follow-up

Playback now advances in one-year steps, including years without featured chapters. The default interval is 900ms per year, or 1500ms when reduced motion is requested. A pending data load holds the current step rather than skipping years. Selected years use December 31, capped at August 21, 1959. Exact-date event links and previous/next key-event buttons retain their existing behavior. Year selection and playback share the same date rule in src/timeline.mjs.

When the current/before snapshot pair, comparison phase and region styling are unchanged, the SVG is left untouched. Exact-date pending-transfer status can still update when required. An unchanged year updates the date readout and snapshot caption; a featured chapter from an earlier year is labeled “Latest” so it is not presented as a new event. Playback preserves the camera and replaces the current share URL rather than adding a history entry every year. The endpoint pauses automatically; reloading restores the current year without resuming autoplay.

Final validation: build, 9 data/timeline checks, 26 interaction checks and 17 transition/annual-playback checks passed. The annual sequence unit check covers all 184 years from 1776 through 1959. Chrome and iPhone-emulated WebKit browser checks cover consecutive annual steps, quiet-year SVG mutation counts of zero, retained source date, pause/reload restoration and the 1959 endpoint. Updated playback prefetch tests use the 1804 year-end pair rather than jumping to the 1818 chapter. Evidence remains in evidence/transition-results.json; screenshots are evidence/yearly-playback-desktop.png and yearly-playback-mobile.png.

The historical data and licensing records have not changed. Year-end playback can combine several documented changes within one calendar year into the applicable year-end state; it is not a simulation of every day or an invented annual border. Physical iPhone Safari and specialist historical review remain outside this verification.

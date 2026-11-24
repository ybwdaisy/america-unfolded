# Continuous timeline changes

2026-11-24. Playback and scrubbing no longer cover a loaded map with the initial opaque loading panel on every change.

- The visible snapshot stays in place while the next current/before pair loads. The new map, chapter and source caption commit together after the requested data is ready.
- Unchanged source-region IDs remain fully opaque. Entering, exiting or restyled regions use a short 160ms opacity transition between exact dated SVG paths. No vertices, dates or historical boundaries are interpolated.
- Playback prefetches only the next event pair. Recent snapshot requests use an eight-entry LRU cache; projected paths and labels reuse weak caches. Static geographic context and graticules are not rebuilt per year.
- Scrubbing updates at a bounded interval and commits the latest request. A completed older response cannot overwrite a later selection. The thumb follows the user's requested year during dragging, and the map's pan/zoom transform is preserved. This also fixes an unintended use of the browser's global `focus` function in year changes.
- Initial loading still has a loading state. A failed subsequent request retains the previous valid map, restores its date/description, and presents a compact retry notice. Reduced-motion users receive immediate snapshot swaps without fades. Ghost paths are noninteractive and hidden from assistive technology.

Run `npm run test:transitions`. Eleven checks across Chrome and iPhone-emulated WebKit passed; results are in `evidence/transition-results.json`. They sample actual animation frames to detect blank geometry, a reappearing opaque loader or fading of unchanged Pennsylvania (source record ID 156 across the tested interval). They also cover slow responses, rapid scrubbing, preserved camera position, playback prefetch, retry and reduced motion. The 1848 year selection uses the year-end convention and correctly displays the August 14 snapshot, rather than the earlier July treaty-proclamation snapshot.

The existing 26 interaction checks and seven data/build checks also passed. Historical source data, routes, styling and delivery policy are otherwise unchanged. This is a local-preview and PR update only.

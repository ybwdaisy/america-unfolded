# Classical atlas style update

2026-11-24. Scope: requested visual restyle of the existing app, with the layout, historical records, routes and interactions preserved.

The requested palette is encoded in the theme tokens: ivory `#F7F3E9`, ink `#1F1D1A`, navy `#2C3E50`, rust `#8B3A2B`, and brass `#8A6B3E`. Jurisdiction fills use muted tints of that palette; hatching and dashed polity outlines remain distinct.

EB Garamond stays self-hosted under the included SIL Open Font License 1.1, with `Georgia, 'Times New Roman', serif` as the explicit fallback. Public Sans remains the readable control/body face, also self-hosted under OFL. No new font or image download is introduced.

The compass rose, graduated ring, engraved-style double frame, folded-map seal and framed legend swatches are original SVG/CSS work under this repository's MIT license. They reproduce a print style, not a historical government seal. Compass north is computed from the cited mainland reference geometry's geographic centroid and the map projection; it does not introduce an unsourced historical event coordinate. The decorative frame has `pointer-events: none`.

Browser records and before/after captures are in `evidence/style/`. The Hallmark preservation check records 23/23 links, 4/4 fields, 5/5 headings and 4/4 figures kept, with no open floor or reflex findings. All 7 data/build checks and 26 existing browser regression checks passed. They cover touch gestures, map selection, the time ruler, comparisons, sharing and history. The independent fresh-context visual reviewer returned **ship**, with no new readability or phone-control defect. A subsequent spacing adjustment keeps the complete desktop timeline within the existing 900px viewport check.

No historical source file or boundary snapshot was changed. Delivery remains local preview and the existing PR only; no deployment, domain or service configuration is changed by this update.

# Verification record

Date: 2026-11-24. This document distinguishes implementation, browser evidence and historical source review.

## Code and build

- `npm run build`: passed; 19 static, crawlable routes.
- `npm test`: 7 checks passed. Checks cover chapter/source integrity, absence of fabricated 1776 geometry, dated acquisition/statehood records, every snapshot's intervals/citations/projected geometry and winding, the 50-state-plus-DC reference, static readable routes, and non-executable license evidence.
- No runtime account, payment, database, AI service, map API key or analytics dependency.
- Source formatted for review. Build output is generated and ignored by Git.

## Real browser engines

`npm run test:browser`: **26 checks passed**, recorded in `evidence/browser-results.json`.

Installed Google Chrome exercised desktop and emulated phone layouts. Playwright WebKit exercised an iPhone configuration. These are real browser engines. They are **not** physical iPhone tests or a claim of certification in the installed Safari app.

Covered: exact event stepping; latest applicable snapshot for a selected year; click and keyboard region selection; detail close/reopen; map zoom, pan and reset; URL reload/share restoration; browser back/forward; comparison before/after; source records and pending status in the earlier phase; modern-state reference; playback advance/pause; story navigation and mobile story next; expanded detail restoration; 1776 missing geometry; Alaska/Hawaiʻi statehood; missing data and failed network with retry; safe reference-toggle during loading; JavaScript-disabled reading; non-overlapping mobile map/timeline/panel; synthetic touch pan/pinch without page scroll; time ruler without map pan; 320px, 390px and landscape widths; reduced motion; visible keyboard focus.

The touch test waits for the browser's touch-end delivery before asserting the URL. Earlier test runs failed that immediate assertion; the final recorded suite passes. Gesture movement also suppresses an accidental post-drag region click.

## Visual and independent review

Hallmark app-scope rendered sweep: `evidence/hallmark-report.json`. Final recorded result: 0 floor failures, 0 open reflex findings and 0 open warnings. Three source-link wrapping findings are waived to preserve institutional attribution; remaining finish checks are answered in the stylesheet and report.

Independent fresh-context review: `INDEPENDENT-REVIEW.md`. Two comparison defects were fixed and regression tested. The reviewer found no visual/layout blocker in the supplied desktop and mobile screenshots. A marketing hero review is inapplicable to this app screen.

Final screenshots: `evidence/desktop-final.png` and `evidence/mobile-final.png`. Additional narrow, landscape, 1959 and WebKit captures are available in the same directory. Only the final captures are used as acceptance evidence.

Final targeted checks in `evidence/final-checks.json` cover separate-polity styling for Vermont/Texas republics, the Gadsden display-date correction, safe plain-text license evidence, absence of external requests from tested routes, and expanded phone chapter restoration. The final capture recorded 1,067,892 initial resource body bytes from local browser resource timing (uncompressed); they are not a production performance score.

## Historical verification

The 15 key chapter summaries and adopted dates link to institutional sources. Newberry geometry is attributed, checksum recorded, and original record dates/citations retained. Signature, ratification, proclamation, handover, territorial organization and admission are labeled separately.

The map follows the source atlas's dates except the explicitly documented Gadsden final-footprint display date, June 30, 1854. The earlier, larger proposal has no supplied geometry and is not fabricated. These are reconstructed governmental jurisdictions and claims, not actual control or complete historical sovereignty.

**Not independently verified:** every intermediate administrative change, each boundary vertex, source generalization accuracy, all river/coastal/island details, a comprehensive map of Indigenous nations, Confederate or military control, and overseas possessions outside this edition. No specialist historian has signed off this implementation.

## Known limits

1. No historical boundary geometry for 1776; a clearly labeled geographic reference and chapter are provided instead.
2. The dashed reference uses December 31, 2000 source records. It is a broad modern-state reference, not a 2026 legal survey.
3. Source geometry is generalized to 0.01 degree. Topology encoding uses a 100,000-step grid; collapsed tiny rings are omitted and winding preserved. Small features should not be treated as surveyed geometry.
4. Alaska and Hawaiʻi are relocated insets. Alaska is scaled down to 0.35 of the mainland projection scale.
5. Before/after compares adjacent record snapshots. Red means newly present records, including administrative replacements, not exclusively newly acquired land.
6. Full hardware testing in iPhone Safari remains outstanding. Desktop Chrome/WebKit emulation cannot establish every device/OS gesture behavior.
7. No production publication or custom domain is included. Automatic Git deployment is disabled. Preview access may require the owner's Vercel session.
8. Vercel's GitHub installation could not see the private repository during setup; explicit CLI preview deployment is used. This does not alter other projects.

## Deployment and review

The intended repository is private `ybwdaisy/america-unfolded`. Product work is on `feat/historical-atlas`; main remains the initial scaffold. The independent Vercel project is `america-unfolded`. Final PR and preview URLs are supplied in the handoff. No production deployment, auto-merge, domain purchase or paid subscription is authorized or performed.

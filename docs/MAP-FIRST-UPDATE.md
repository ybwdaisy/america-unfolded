# Map-first workspace refinement

Date: 2026-11-24. Delivery remains local preview and existing PR only.

The desktop workspace now gives the historical map more space. The masthead is compact; the existing story link sits in the map toolbar. The original title and introduction remain visible in the chapter index below the atlas. At 1440 × 900, the map stage starts at y=149 instead of y=273 and is 534px high instead of 423px. The time controls fit within the first viewport.

At 390 × 844, the map begins at y=174 instead of y=314. The timeline follows the map and its dedicated inset-caption row, ahead of the legend and coverage note. Details remain inline below these controls. Tablets and landscape phones through 1000px use a single map column with details below. Short landscape screens scroll naturally rather than squeezing the map. The wide-screen Go to year field remains available at 1500px and above.

## Preserved functions and content

| Area | Preservation check |
| --- | --- |
| History and licenses | No event, source, geometry or license data changed; no AGY code or assets copied |
| Routes and controls | Template comparison found no removed IDs or link destinations; all 19 static routes build |
| Map and details | Chrome/WebKit regression checks cover region selection, close/reopen, zoom/pan/reset and reference boundaries |
| Time and comparison | Previous/next, playback/pause, before/after, reduced motion and rapid scrubbing remain covered |
| Sharing and story | URL/reload/back/forward, clipboard sharing and guided story checks pass |
| Mobile | Map and timeline precede details; synthetic pan/pinch and slider isolation pass |
| JavaScript disabled | Chapters, source links and explanation remain readable |

## Verification

- Build and 7 data/build checks passed.
- All 26 existing browser checks passed on installed Chrome and iPhone-emulated WebKit.
- All 11 transition checks passed, including delayed responses, retained map frames, latest-request selection, playback prefetch, reduced motion and retry.
- Layout measured at 320, 390, 768, 844, 1280, 1440 and 1920px widths without horizontal overflow. See evidence/map-first-layout.json.
- Hallmark rendered app sweep: 0 FAIL, 0 WARN, 3 existing source-wrap waivers and 3 answered finish observations.
- Independent finish review: restored the existing wide-screen year-entry field; two final visual findings resolved in recaptures. The inset note now has a dedicated row, keeping Alaska labels clear. The chapter-only recapture confirms unobscured text.

## Evidence and limits

Before: evidence/map-first-before-desktop.png and map-first-before-mobile.png.
After: evidence/map-first-desktop.png and map-first-mobile.png.
Full pages: evidence/map-first-full-1440.png, map-first-full-375.png, map-first-full-1920.png and map-first-full-768.png.

This is browser-engine/emulation verification, not a physical iPhone Safari acceptance test. Historical and licensing material was retained, not newly certified or reviewed by a specialist in this layout update. The existing coverage and approximation limits still apply. No deployment, merge, domain purchase or paid service was performed.

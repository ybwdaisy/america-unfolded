# Research and scope decision

Reviewed 2026-11-24 before product implementation.

## Reference and competitors

- **Jiangshan Map** — https://github.com/DeanChensj/jiangshan-map . Inspected README, data-source table and license. The useful pattern is map + date + local narrative. Code and project data are GPL-3.0; CHGIS-derived prefectures have separate restrictive terms. No implementation, text or geometry copied. This project uses independently written vanilla JS and Newberry U.S. geometry.
- **History USA** — https://history-usa.com/ . Real Chrome capture in `evidence/research/history-usa.png`. Observed a broad history timeline, presidents, political parties, map and bibliography. America Unfolded narrows the question to territorial formation and makes exact source dates and comparison part of the main workspace.
- **American Panorama** — https://dsl.richmond.edu/panorama/ . Real Chrome capture in `evidence/research/panorama.png`. Observed a scholarly atlas organized into topical projects: migration, slavery, elections, dispossession, transportation and others. Its strengths support topic specificity and transparent scholarship. America Unfolded is one introductory storyline rather than a directory of research atlases. No visual or dataset copying.
- **Running Reality** — https://www.runningreality.org/ . Real Chrome capture in `evidence/research/running-reality.png`. Observed a global map with day/month/year controls, nearby/guide actions and a very broad historical time ruler. America Unfolded avoids implying that every day has equally precise boundary knowledge and presents a small editorial route.

Competitor captures are research evidence, not shipped web assets. No claims about competitor traffic, accuracy, adoption or performance were inferred.

## Deliverable scope

15 key chapters: independence; Treaty of Paris; Louisiana Purchase; Convention of 1818; Adams–Onís Treaty; Florida statehood; Texas annexation/statehood; Oregon Treaty; Mexican Cession; California statehood; Gadsden Purchase; Alaska purchase; Hawaiʻi annexation; Alaska statehood; Hawaiʻi statehood.

125 lazy-loaded map snapshots are extracted from 220 source records through August 21, 1959, including a small number of source-backed status-display milestones. This is not 125 independently researched geopolitical events. The intermediate chronology is inherited from the atlas and tested for record/date consistency, not independently verified against every primary law.

The timeline uses the latest record state at or before the requested date; choosing a year means the year’s end, capped at August 21 for 1959. A key chapter uses its exact adopted map date. Internal administrative changes may appear between editorial chapters. The key-event buttons step chapters; the year slider selects the applicable dated record, without morphing.

## Data choice and license

Newberry current download page explicitly permits lawful commercial/noncommercial reuse without licensing fees and identifies older packaged notices as obsolete. The LOC catalog labels the material CC0. Both links are recorded; the original packaged restrictive notice is preserved. We did not assume that “free website” creates a license exception. No CHGIS, Natural Earth derivative acquisition outline, uncertain ArcGIS upload or unlicensed raster map is bundled.

Source: https://publications.newberry.org/ahcb/downloads/gis/US_AtlasHCB_StateTerr_Gen01.zip . Attribution and SHA-256 are in DATA-PROVENANCE.json. Original metadata and current download pages are in `licenses/`.

## Important historical conventions

- 1776 has narrative and modern geographic context only. No pre-1783 geometry was fabricated.
- Treaty signature, ratification, proclamation, transfer, organization and statehood are separate labels. The selected map date follows the source dataset. Physical control is not inferred from a polygon.
- Oregon Country and Vermont Republic remain distinct from uncontested U.S. states. Early Texas uses its historical claimed extent, with hatching across the whole claim rather than a fabricated precise disputed-zone polygon.
- The Mexican Cession is introduced July 4, 1848 because that is the atlas’s proclamation-based date. May 30 ratification exchange is explicitly shown and must not be rewritten as July 4.
- U.S. “unorganized territory” is a governmental category, not an assertion of empty or ungoverned land.
- Hawaiʻi annexation includes opposition and the distinction between the U.S. resolution and formal transfer. Statehood in 1959 is separate.
- Maps exclude a comprehensive depiction of Indigenous sovereignty, military control, the Confederacy and other overseas possessions. These are explicit limitations, not implied absence.

## Source review boundary

Institutional sources support the key chapter dates and summaries. All 125 snapshots are programmatically checked against original record intervals, citations and projected geometry. This does not constitute an independent historical audit of each coordinate or every legal transition. A historian’s review and physical-device testing remain useful follow-up work before a broad public release.

Gadsden display correction: the atlas’s record starts December 30, 1853, but the final footprint shown here was reduced during ratification. The map withholds that geometry until June 30, 1854, retaining the original START_DATE and adding DISPLAY_START. Source: https://avalon.law.yale.edu/19th_century/mx1853.asp . No earlier proposal polygon is invented.

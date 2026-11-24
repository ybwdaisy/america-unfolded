# America Unfolded

> **Explore American history through maps.**

An interactive, free, open-access historical cartography application illustrating how the territorial perimeter of the United States formed between 1776 and 1959.

---

## 🏛️ Project Overview & Educational Mission

**America Unfolded** provides students, educators, and history enthusiasts with an intuitive spatial-temporal journey through the diplomatic treaties, purchases, congressional resolutions, and admission acts that shaped the borders of the United States.

Unlike continuous animation maps that invent fictional intermediate borders through arbitrary interpolation, **America Unfolded strictly switches across 13 verified statutory and treaty nodes**. When a selected year experienced no boundary change, the map displays the nearest preceding legal baseline and clearly displays the exact historical date of enactment.

---

## ✨ Core Capabilities

1. **Interactive Cartographic Canvas**:
   - High-fidelity vector SVG engine with smooth mouse/touch pan, wheel zoom (0.75x to 3.0x), and one-click view reset.
   - Distinctive period color palette differentiating territorial acquisitions across eras.
2. **Discrete Chronological Timeline Player**:
   - 13 discrete historical milestone ticks spanning 1776 to 1959.
   - Stepper (`◀ Step` / `Step ▶`), Play / Pause (`▶ Play` / `⏸ Pause`), and draggable range slider.
   - Keyboard accessible: Arrow Left/Right to step, Space to toggle playback, Escape to close details.
3. **Historical Detail Drawer & Panel**:
   - Latin plate inscriptions (e.g., `TABULA IV · ANNO MDCCCIII`).
   - Legal instrument badges (`Declaration`, `Treaty`, `Purchase`, `Annexation`, `Admission Act`).
   - Comprehensive historical narratives and geopolitical context.
   - **Indigenous Sovereignty Context**: Acknowledging ancestral homelands and clarifying that European/Mexican cessions transferred colonial preemption rights rather than unencumbered land.
   - **Boundary Precision Disclaimer**: Noting historical approximation resulting from 18th-century compass surveys.
   - Primary archival citations from NARA, Library of Congress, and Avalon Project.
4. **Contrast View ("Before vs. After" Comparison)**:
   - One-click toggle muting earlier territory into antique paper stone while highlighting newly added lands in vibrant terracotta and engraved hatching.
5. **Modern 50-State Boundary Overlay**:
   - Translucent dashed overlay showing modern state perimeters and two-letter abbreviations (e.g. seeing the 15 modern states overlapping the Louisiana Purchase).
6. **Cartographic Insets for Alaska & Hawaii**:
   - Clearly defined inset frames in the lower-left corner with explicit scale and projection disclaimers to prevent geographic misconception.
7. **Guided Narrative Tour**:
   - Automated walkthrough focusing the camera smoothly on each geographic region in sequence.
8. **URL State Synchronization & Deep Linking**:
   - State is bidirectional with URL search params (`?node=1803-louisiana-purchase&compare=1&states=1`), supporting browser Back/Forward navigation and one-click link sharing.
9. **Full SEO & Semantic Fallback**:
   - 13 pre-rendered static HTML event pages under `/events/`.
   - Comprehensive `<noscript>` fallback ensuring the entire educational content is readable even if JavaScript is disabled.
   - Validated `sitemap.xml` and `robots.txt`.

---

## 🎨 Visual Identity: Classical American Atlas

Designed under the **Hallmark (App Scope)** design guidelines:
- **Palette**: Warm ivory laid paper (`#F7F3E9`), deep printer's ink charcoal (`#1F1C18`), heritage navy (`#26384C`), antique brass (`#6E5326`), and terracotta brick red (`#8B3829`).
- **Typography**: Classic serif headings (`Playfair Display`, `Cormorant Garamond`, `Georgia`) paired with clean system sans-serif body type for maximum legibility.
- **Craftsmanship**: Double engraved neatlines, graticule grid lines, untracked sentence-case labels, and minimum 44px touch targets.
- **Zero Heavy Dependencies**: Pure standard web technologies (HTML5, CSS3, ES2022 SVG), zero third-party tracking, zero analytics cookies.

---

## 📜 Historical Milestones (1776–1959)

| Year | Milestone Event | Legal Mechanism | Area / Impact | Modern States Formed |
| :--- | :--- | :--- | :--- | :--- |
| **1776** | Declaration of Independence | Unanimous Declaration | Thirteen Atlantic colonies | NH, MA, RI, CT, NY, NJ, PA, DE, MD, VA, NC, SC, GA, ME, VT, WV |
| **1783** | Treaty of Paris | International Peace Treaty | ~890,000 sq mi (to Mississippi River) | ME through GA, plus OH, IN, IL, MI, WI, KY, TN, AL, MS |
| **1787** | Northwest Ordinance | Congressional Ordinance | Territorial governance structure | OH, IN, IL, MI, WI, MN |
| **1803** | Louisiana Purchase | International Purchase Treaty | ~828,000 sq mi ($15M from France) | AR, MO, IA, MN, ND, SD, NE, KS, OK, TX, NM, CO, WY, MT, LA |
| **1818** | Convention of 1818 | Anglo-American Convention | 49th parallel to Rockies & Red River | MN, ND, SD |
| **1819** | Adams-Onís Treaty | Transcontinental Treaty | East & West Florida ($5M claims) | FL, AL, MS, LA |
| **1845** | Annexation of Texas | Congressional Joint Resolution | 28th State (~389,000 sq mi) | TX, NM, CO, OK, KS, WY |
| **1846** | The Oregon Treaty | International Boundary Treaty | 49th parallel to Pacific Ocean | OR, WA, ID, MT, WY |
| **1848** | Treaty of Guadalupe Hidalgo | Mexican Cession Peace Treaty | ~525,000 sq mi ($15M to Mexico) | CA, NV, UT, AZ, NM, CO, WY |
| **1853** | The Gadsden Purchase | Purchase Treaty (Venta de La Mesilla) | 29,670 sq mi ($10M to Mexico) | AZ, NM |
| **1867** | The Alaska Purchase | Cession of Russian America | ~586,412 sq mi ($7.2M from Russia) | AK |
| **1898** | Annexation of Hawaii | Newlands Joint Resolution | Hawaiian Archipelago (~6,423 sq mi) | HI |
| **1959** | Alaska & Hawaii Statehood | Alaska & Hawaii Admission Acts | 49th & 50th States admitted | AK, HI (Modern 50-State Union finalized) |

---

## ⚖️ Data Sources & Licensing Audit

1. **U.S. Territorial Acquisitions GIS Data**:
   - **Authority**: U.S. Geological Survey (USGS) & NationalAtlas.gov (*Territorial Acquisitions of the United States*).
   - **Legal Status**: **U.S. Public Domain** (17 U.S.C. § 105).
2. **Modern State Boundaries & Coastlines**:
   - **Authority**: Natural Earth Vector & U.S. Census Bureau (TIGER/Line).
   - **Legal Status**: **Public Domain / CC0 Equivalent**.
3. **Primary Historical & Legal Texts**:
   - **Authorities**: U.S. National Archives and Records Administration (Record Group 11), Library of Congress, and The Avalon Project at Yale Law School.
4. **Third-Party Restriction Compliance**:
   - Newberry Library Historical County Boundaries data was strictly consulted for historical reference only and is **not** embedded in this codebase.
   - CHGIS data is completely excluded.
   - Codebase is 100% original, clean-room implementation under the **MIT License**.

---

## 🛠️ Local Development & Preview

Run a static HTTP server from the project root:

```bash
# Start local server
python3 -m http.server 3456

# Or using Node
npx serve .
```

Open `http://localhost:3456/` in your browser.

### Rebuilding Map Data & Static Pages

```bash
# 1. Process GIS data into projected SVG paths
python3 scripts/build_data.py

# 2. Build timeline metadata nodes
python3 scripts/build_timeline.py

# 3. Bundle data for zero-fetch offline loading
python3 scripts/bundle_data_js.py

# 4. Generate index.html, static event pages, sitemap, and robots
python3 scripts/build_site_html.py

# 5. Run automated Chrome browser tests & screenshot verification
node scripts/verify_browser.mjs
```

---

## 📱 Browser & Responsive Testing Summary

Automated testing conducted using Chrome / Puppeteer:
- **Desktop (1280 × 800 & 1440 × 900)**: Pass. Layout fits viewport with zero vertical clipping or unwanted page scrolling.
- **Mobile (iPhone 14, 390 × 844)**: Pass. Touch buttons $\ge 44\text{px}$, responsive slide-up drawer with close button and backdrop, smooth pan/zoom touch gestures.
- **URL Synchronization**: Pass. Correctly restores event node, contrast mode, and modern state overlay from query parameters.
- **Linter & Standards**: `sloplint` verified: **0 FAIL, 0 REFLEX, 0 WARN**.

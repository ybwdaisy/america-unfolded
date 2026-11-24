#!/usr/bin/env python3
"""
Generate complete semantic HTML pages, event pages, sitemap, and robots.txt
for America Unfolded.
"""
import json
import os

base_dir = '/Users/ybwdaisy/.gemini/antigravity/scratch/america-unfolded'
proc_dir = os.path.join(base_dir, 'data/processed')

with open(os.path.join(proc_dir, 'timeline_nodes.json')) as f:
    nodes = json.load(f)

# Common Navigation Bar
def get_header(active_nav='map'):
    map_active = 'btn-primary' if active_nav == 'map' else ''
    about_active = 'btn-primary' if active_nav == 'about' else ''
    sources_active = 'btn-primary' if active_nav == 'sources' else ''

    return f"""
  <header class="masthead">
    <div class="brand-block">
      <a href="/" class="brand-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
          <line x1="9" y1="3" x2="9" y2="18"></line>
          <line x1="15" y1="6" x2="15" y2="21"></line>
        </svg>
        <span>America Unfolded</span>
      </a>
      <span class="brand-subtitle">Explore American history through maps.</span>
    </div>

    <nav class="masthead-actions" aria-label="Site Navigation">
      <a href="/" class="btn {map_active}">Interactive Map</a>
      <a href="/about.html" class="btn {about_active}">About Project</a>
      <a href="/sources.html" class="btn {sources_active}">Sources &amp; License</a>
    </nav>
  </header>
"""

# Common Head Elements
def get_head(title, description, canonical_url):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} · America Unfolded</title>
  <meta name="description" content="{description}">
  <link rel="canonical" href="{canonical_url}">
  
  <!-- Open Graph / Meta -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="{title} · America Unfolded">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{canonical_url}">
  <meta name="theme-color" content="#F7F3E9">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">

  <!-- Classic Serif Fonts & Hallmark CSS Tokens -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,450;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/src/style.css">
</head>
<body>
"""

def generate_index_html():
    head = get_head(
        "Interactive Historical Map of U.S. Territorial Expansion (1776–1959)",
        "Explore how the United States acquired its territory from 1776 to 1959 through interactive historical cartography, discrete treaty nodes, and sovereign Indigenous context.",
        "https://america-unfolded.org/"
    )

    header = f"""
  <header class="masthead">
    <div class="brand-block">
      <a href="/" class="brand-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
          <line x1="9" y1="3" x2="9" y2="18"></line>
          <line x1="15" y1="6" x2="15" y2="21"></line>
        </svg>
        <span>America Unfolded</span>
      </a>
      <span class="brand-subtitle">Explore American history through maps.</span>
    </div>

    <div class="masthead-actions">
      <button id="tour-btn" class="btn btn-accent" type="button" title="Start Guided Tour of U.S. Territorial Growth">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
        Guided Tour
      </button>

      <button id="toggle-modern-states" class="btn btn-toggle" type="button" aria-pressed="false" title="Overlay modern 50 state borders">
        Modern States
      </button>

      <button id="toggle-compare-mode" class="btn btn-toggle" type="button" aria-pressed="false" title="Highlight newly acquired territory">
        Contrast View
      </button>

      <button id="share-btn" class="btn btn-icon-only" type="button" title="Copy link to current map view" aria-label="Share current view">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
      </button>

      <a href="/about.html" class="btn" title="About the project">About</a>
      <a href="/sources.html" class="btn" title="Historical sources and public domain data">Sources</a>
    </div>
  </header>
"""

    content = f"""
<div class="app-container">
  {header}

  <main class="main-workspace" id="main-content">
    <!-- Interactive Map Viewport -->
    <div class="map-canvas-container" id="map-canvas-container" role="region" aria-label="Interactive Historical Map of the United States">
      
      <!-- Floating Navigation Controls -->
      <div class="map-floating-controls" aria-label="Map Zoom and Reset Controls">
        <button id="zoom-in-btn" class="btn btn-icon-only" type="button" aria-label="Zoom In" title="Zoom In">+</button>
        <button id="zoom-out-btn" class="btn btn-icon-only" type="button" aria-label="Zoom Out" title="Zoom Out">−</button>
        <button id="zoom-reset-btn" class="btn btn-icon-only" type="button" aria-label="Reset View" title="Reset Map View">⟲</button>
      </div>

      <!-- Mobile Details Trigger Pill -->
      <button id="mobile-detail-btn" class="btn btn-primary mobile-detail-pill" type="button" aria-label="Open historical details">
        Details 📜
      </button>

      <!-- Map Legend -->
      <div class="map-legend-overlay" aria-label="Map Legend">
        <div class="legend-title">Cartographic Guide</div>
        <div class="legend-item">
          <div class="legend-swatch" style="background: #2D445C;"></div>
          <span>1783 Original U.S.</span>
        </div>
        <div class="legend-item">
          <div class="legend-swatch" style="background: #8E6D38;"></div>
          <span>Louisiana Purchase</span>
        </div>
        <div class="legend-item">
          <div class="legend-swatch" style="background: #8E3E30;"></div>
          <span>Spanish / Fla. Cession</span>
        </div>
        <div class="legend-item">
          <div class="legend-swatch" style="background: #B87A2B;"></div>
          <span>Texas Annexation</span>
        </div>
        <div class="legend-item">
          <div class="legend-swatch" style="background: #2E5A44;"></div>
          <span>Oregon Treaty</span>
        </div>
        <div class="legend-item">
          <div class="legend-swatch" style="background: #9C4837;"></div>
          <span>Mexican Cession</span>
        </div>
        <div class="legend-item">
          <div class="legend-swatch" style="background: #354E66;"></div>
          <span>Alaska &amp; Hawaii</span>
        </div>
      </div>

      <!-- Vector SVG Map -->
      <svg id="map-svg" class="map-svg" viewBox="0 0 960 600" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="stripes-new" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#F1ECE0" stroke-width="2" />
          </pattern>
        </defs>

        <!-- Viewport Group for Pan and Zoom -->
        <g id="map-viewport-group">
          <!-- Graticules & Inset Frames -->
          <g id="decorations-layer"></g>

          <!-- Historical Territory Layer -->
          <g id="territory-layer"></g>

          <!-- Modern States Reference Layer -->
          <g id="state-layer" style="display: none;"></g>
        </g>
      </svg>
    </div>

    <!-- Mobile Drawer Backdrop -->
    <div id="drawer-backdrop" class="drawer-backdrop" aria-hidden="true"></div>

    <!-- Detail Panel / Side Drawer -->
    <aside id="detail-panel" class="detail-panel is-open" aria-label="Historical Event Details">
      <div class="panel-header">
        <div>
          <div id="panel-plate-tag" class="panel-plate-tag">TABULA I · ANNO MDCCLXXVI</div>
          <h1 id="panel-title" class="panel-title">Declaration of Independence</h1>
          <div class="panel-meta-row">
            <span id="panel-date-badge" class="badge">July 4, 1776</span>
            <span id="panel-type-badge" class="badge badge-treaty">Independence</span>
          </div>
        </div>
        <button id="close-panel-btn" class="btn btn-icon-only" type="button" aria-label="Close historical details">✕</button>
      </div>

      <div class="panel-body">
        <div>
          <div class="section-label">Overview</div>
          <p id="panel-summary" class="narrative-text"></p>
        </div>

        <div>
          <div class="section-label">Historical Narrative &amp; Legal Basis</div>
          <p id="panel-narrative" class="narrative-text"></p>
        </div>

        <div class="notice-indigenous">
          <div class="notice-title">Indigenous Sovereignty Context</div>
          <p id="panel-indigenous" class="notice-text"></p>
        </div>

        <div class="notice-disclaimer">
          <div class="section-label">Boundary Precision &amp; Approximation</div>
          <p id="panel-boundaries"></p>
        </div>

        <div>
          <div class="section-label">Modern States Formed</div>
          <div id="panel-states-list" style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;"></div>
        </div>

        <div>
          <div class="section-label">Primary Citations &amp; Records</div>
          <ul id="panel-citations" class="citation-list"></ul>
        </div>
      </div>
    </aside>
  </main>

  <!-- Bottom Timeline Player Bar -->
  <footer class="timeline-bar" role="toolbar" aria-label="Historical Timeline Player">
    <div class="timeline-playback-controls">
      <button id="prev-btn" class="btn" type="button" aria-label="Previous historical node">◀ Step</button>
      <button id="play-btn" class="btn btn-primary" type="button" aria-label="Play timeline playback">▶ Play</button>
      <button id="next-btn" class="btn" type="button" aria-label="Next historical node">Step ▶</button>
    </div>

    <div class="timeline-slider-wrapper">
      <div class="timeline-label-row">
        <span>1776</span>
        <span id="current-event-title" class="timeline-current-title">1776 · Declaration of Independence</span>
        <span>1959</span>
      </div>
      <input type="range" id="timeline-slider" class="timeline-slider" min="0" max="{len(nodes) - 1}" step="1" value="0" aria-label="Historical timeline slider" />
    </div>

    <div style="font-family: var(--font-serif); font-size: 1.15rem; font-weight: 700; color: var(--color-ink-primary); min-width: 50px; text-align: right;" id="current-year-display">
      1776
    </div>
  </footer>

  <!-- Toast Notice -->
  <div id="toast-notice" class="toast-notice" role="status" aria-live="polite"></div>

  <!-- Semantic Fallback for No-JS and Search Indexing -->
  <noscript>
    <div class="static-seo-container">
      <h2>Complete Historical Chronology of U.S. Territorial Expansion</h2>
      <p>JavaScript is currently disabled in your browser. Below is the complete authoritative text of all 13 territorial acquisition milestones:</p>
      {"".join([f'''
      <article style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #D8CFBE;">
        <h3>{n['year']} · {n['title']}</h3>
        <p><strong>Date:</strong> {n['exactDate']} | <strong>Legal Instrument:</strong> {n['legalType']}</p>
        <p>{n['shortSummary']}</p>
        <p>{n['historicalNarrative']}</p>
        <p><strong>Indigenous Homelands Context:</strong> {n['indigenousContext']}</p>
        <p><strong>Boundary Definition &amp; Precision:</strong> {n['boundariesAndPrecision']}</p>
        <p><strong>Modern States Included:</strong> {", ".join(n['modernStatesCovered'])}</p>
      </article>
      ''' for n in nodes])}
    </div>
  </noscript>
</div>

<script src="/src/data.js"></script>
<script src="/src/app.js"></script>
</body>
</html>
"""
    with open(os.path.join(base_dir, 'index.html'), 'w') as f:
        f.write(head + content)
    print("Generated index.html")

def generate_about_html():
    head = get_head(
        "About the Project · America Unfolded",
        "America Unfolded is a free, non-commercial public history educational resource examining how the territorial borders of the United States evolved.",
        "https://america-unfolded.org/about.html"
    )
    header = get_header(active_nav='about')
    content = f"""
<div class="app-container">
  {header}

  <main class="static-seo-container" id="main-content">
    <h1>About America Unfolded</h1>
    <p class="brand-subtitle" style="margin-bottom: 24px;">Explore American history through maps.</p>

    <h2>1. Educational Mission &amp; Purpose</h2>
    <p>
      <strong>America Unfolded</strong> is an open-access, non-commercial historical education initiative. Its primary objective is to allow students, educators, historians, and the curious public to intuitively visualize how the territorial perimeter of the United States formed between 1776 and 1959.
    </p>
    <p>
      Rather than treating geographic borders as static or pre-ordained lines, this project illuminates the specific diplomatic treaties, congressional acts, military conflicts, and financial transactions through which each parcel of land was incorporated into the federal union.
    </p>

    <h2>2. Cartographic Philosophy: Discrete Nodes vs. Interpolation</h2>
    <p>
      Many digital history projects suffer from <em>over-interpolation</em>—inventing fictional intermediate boundaries or using continuous animations that give a misleading impression of precision.
    </p>
    <p>
      <strong>America Unfolded deliberately rejects arbitrary year-by-year boundary interpolation.</strong> Boundaries in our application update exclusively at verified statutory and treaty nodes. When a selected year experienced no boundary change, the map faithfully reflects the nearest preceding legal baseline and clearly displays the exact historical date of enactment.
    </p>

    <h2>3. Acknowledgment of Indigenous Sovereignty</h2>
    <p>
      A foundational principle of America Unfolded is that European and American territorial acquisitions were not transfers of "empty wilderness." Long before European arrival, the North American continent was populated, cultivated, and governed by sovereign Indigenous nations with sophisticated legal traditions and territorial boundaries.
    </p>
    <p>
      Whenever European powers (Great Britain, France, Spain, Russia) or Mexico ceded or sold claims to the United States, they were transferring imperial preemption rights under Western legal doctrine—not unencumbered physical title. Every node in this project explicitly contextualizes the Native nations whose ancestral homelands were affected.
    </p>

    <h2>4. Visual Design: American Classical Historical Atlas</h2>
    <p>
      The visual language draws inspiration from 18th- and 19th-century American copperplate engravings, atlas publishing, and early broadsheets. We use warm ivory laid paper, deep printer's ink, antique brass, and heritage indigo accents, eschewing modern technology gradients and commercial dashboard tropes.
    </p>

    <h2>5. Privacy &amp; Independence</h2>
    <p>
      America Unfolded is completely free. We do not use user authentication, third-party tracking scripts, advertising networks, or analytics cookies.
    </p>

    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--color-paper-border);">
      <a href="/" class="btn btn-primary">Return to Interactive Map</a>
    </div>
  </main>
</div>
</body>
</html>
"""
    with open(os.path.join(base_dir, 'about.html'), 'w') as f:
        f.write(head + content)
    print("Generated about.html")

def generate_sources_html():
    head = get_head(
        "Historical Sources, Data & Legal Licensing · America Unfolded",
        "Authoritative documentation of geospatial datasets, primary treaty texts, and public domain licenses used in America Unfolded.",
        "https://america-unfolded.org/sources.html"
    )
    header = get_header(active_nav='sources')
    content = f"""
<div class="app-container">
  {header}

  <main class="static-seo-container" id="main-content">
    <h1>Historical Sources, Citations &amp; Legal Licensing</h1>
    <p class="brand-subtitle" style="margin-bottom: 24px;">Exhaustive inventory of historical records, geospatial data, and intellectual property terms.</p>

    <h2>1. Geospatial &amp; Boundary Data Sources</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 0.9rem;">
      <thead>
        <tr style="border-bottom: 2px solid var(--color-paper-border-dark); text-align: left;">
          <th style="padding: 8px;">Dataset</th>
          <th style="padding: 8px;">Originating Authority</th>
          <th style="padding: 8px;">License &amp; Legal Status</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid var(--color-paper-border);">
          <td style="padding: 8px;"><strong>Territorial Acquisitions of the United States</strong></td>
          <td style="padding: 8px;">U.S. Geological Survey (USGS) &amp; NationalAtlas.gov</td>
          <td style="padding: 8px;"><strong>U.S. Public Domain</strong> (17 U.S.C. § 105: Work of the United States Government). Free for any purpose without restriction.</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--color-paper-border);">
          <td style="padding: 8px;"><strong>Modern State Boundaries &amp; Cartographic Framework</strong></td>
          <td style="padding: 8px;">Natural Earth Vector &amp; U.S. Census Bureau (TIGER/Line)</td>
          <td style="padding: 8px;"><strong>Public Domain / CC0 Equivalent</strong>. Unrestricted worldwide public access.</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--color-paper-border);">
          <td style="padding: 8px;"><strong>Historic County &amp; Territorial Lineage (Reference Consultation Only)</strong></td>
          <td style="padding: 8px;">Newberry Library Atlas of Historical County Boundaries</td>
          <td style="padding: 8px;"><em>Non-Commercial Layer Restricted</em>. Explicitly not imported or distributed in this codebase to guarantee clean open-source compliance.</td>
        </tr>
      </tbody>
    </table>

    <h2>2. Primary Treaty Texts &amp; Archival Repositories</h2>
    <ul class="citation-list" style="margin-top: 12px;">
      <li><strong>National Archives and Records Administration (NARA):</strong> General Records of the United States Government (Record Group 11), Treaties with Great Britain, France, Spain, Mexico, and Russia.</li>
      <li><strong>The Avalon Project (Yale Law School):</strong> Lillian Goldman Law Library, Documents in Law, History and Diplomacy (Treaty of Paris 1783, Louisiana Purchase 1803, Adams-Onís Treaty 1819, Treaty of Guadalupe Hidalgo 1848).</li>
      <li><strong>Library of Congress:</strong> A Century of Lawmaking for a New Nation: U.S. Congressional Documents and Debates (1774–1875), Statutes at Large, Journals of the Continental Congress.</li>
      <li><strong>Charles O. Paullin:</strong> <em>Atlas of the Historical Geography of the United States</em> (Carnegie Institution of Washington, 1932; edited by John K. Wright).</li>
    </ul>

    <h2>3. Cartographic Approximation &amp; Precision Disclaimer</h2>
    <div class="notice-disclaimer" style="margin-top: 12px;">
      <p>
        <strong>Note on Historic Accuracy:</strong> While modern GIS coordinate systems utilize the WGS84 datum and precise geodetic calculations, historical treaties from the 18th and 19th centuries defined boundaries using astronomical observations, magnetic compass bearings, watershed divides, and outdated maps (such as John Mitchell's 1755 map or John Melish's 1816 map). Consequently, all historical boundary polygons presented on this platform represent <strong>scholarly reconstructions</strong> and do not purport to convey contemporary engineering or legal survey precision.
      </p>
    </div>

    <h2>4. Codebase &amp; Typography Licensing</h2>
    <p>
      The custom software, map projections, and user interface developed for America Unfolded are released under the <strong>MIT License</strong>. Fonts utilized are licensed under the <strong>SIL Open Font License (OFL)</strong> with native serif system fallbacks.
    </p>

    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--color-paper-border);">
      <a href="/" class="btn btn-primary">Return to Interactive Map</a>
    </div>
  </main>
</div>
</body>
</html>
"""
    with open(os.path.join(base_dir, 'sources.html'), 'w') as f:
        f.write(head + content)
    print("Generated sources.html")

def generate_event_pages():
    os.makedirs(os.path.join(base_dir, 'events'), exist_ok=True)
    for n in nodes:
        slug = n['slug']
        filename = f"{slug}.html"
        title = f"{n['year']} {n['title']} · Historical Map"
        desc = f"Interactive map and historical documentation of the {n['title']} ({n['year']}), legal mechanisms, and Indigenous homelands context."
        url = f"https://america-unfolded.org/events/{filename}"

        head = get_head(title, desc, url)
        header = get_header(active_nav='map')

        content = f"""
<div class="app-container">
  {header}

  <main class="static-seo-container" id="main-content">
    <div style="margin-bottom: 12px;">
      <a href="/?node={slug}" class="btn btn-primary" style="margin-bottom: 16px;">
        ← Open in Interactive Map View
      </a>
    </div>

    <div class="panel-plate-tag">{n['latinPlate']}</div>
    <h1>{n['title']}</h1>
    <div class="panel-meta-row" style="margin-bottom: 16px;">
      <span class="badge">{n['exactDate']}</span>
      <span class="badge badge-treaty">{n['category']}</span>
      <span class="badge">{n['legalType']}</span>
    </div>

    <h2>Executive Summary</h2>
    <p class="narrative-text" style="font-size: 1.05rem;">{n['shortSummary']}</p>

    <h2>Historical Narrative &amp; Geopolitical Significance</h2>
    <p class="narrative-text">{n['historicalNarrative']}</p>

    <div class="notice-indigenous" style="margin: 20px 0;">
      <div class="notice-title">Indigenous Sovereignty &amp; Homelands Context</div>
      <p class="notice-text">{n['indigenousContext']}</p>
    </div>

    <h2>Boundary Definition &amp; Cartographic Precision</h2>
    <div class="notice-disclaimer">
      <p>{n['boundariesAndPrecision']}</p>
    </div>

    <h2>Modern States Formed or Overlapping</h2>
    <p>This territorial acquisition includes all or parts of the following modern U.S. states: <strong>{", ".join(n['modernStatesCovered'])}</strong>.</p>

    <h2>Primary Citations &amp; Legal Documentation</h2>
    <ul class="citation-list">
      {"".join([f"<li>{cit}</li>" for cit in n['citations']])}
    </ul>

    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--color-paper-border); display: flex; gap: 12px;">
      <a href="/?node={slug}" class="btn btn-primary">Explore on Map</a>
      <a href="/" class="btn">View All Eras</a>
    </div>
  </main>
</div>
</body>
</html>
"""
        with open(os.path.join(base_dir, 'events', filename), 'w') as f:
            f.write(head + content)

    print(f"Generated {len(nodes)} static event pages in events/")

def generate_sitemap_and_robots():
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Root pages
    urls = [
        ('https://america-unfolded.org/', '1.0', 'weekly'),
        ('https://america-unfolded.org/about.html', '0.8', 'monthly'),
        ('https://america-unfolded.org/sources.html', '0.8', 'monthly')
    ]
    for url, prio, freq in urls:
        sitemap.append(f'  <url><loc>{url}</loc><priority>{prio}</priority><changefreq>{freq}</changefreq></url>')

    # Event pages
    for n in nodes:
        url = f"https://america-unfolded.org/events/{n['slug']}.html"
        sitemap.append(f'  <url><loc>{url}</loc><priority>0.9</priority><changefreq>monthly</changefreq></url>')

    sitemap.append('</urlset>')

    with open(os.path.join(base_dir, 'sitemap.xml'), 'w') as f:
        f.write("\n".join(sitemap) + "\n")
    print("Generated sitemap.xml")

    robots = """User-agent: *
Allow: /

Sitemap: https://america-unfolded.org/sitemap.xml
"""
    with open(os.path.join(base_dir, 'robots.txt'), 'w') as f:
        f.write(robots)
    print("Generated robots.txt")

def main():
    generate_index_html()
    generate_about_html()
    generate_sources_html()
    generate_event_pages()
    generate_sitemap_and_robots()
    print("Site HTML generation complete!")

if __name__ == '__main__':
    main()

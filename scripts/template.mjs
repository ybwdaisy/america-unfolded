import { events, sources, scopeNote } from '../src/data/events.mjs';
export const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export const icon = (name) => {
  const p = {
    map: 'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2z M9 3v16 M15 5v16',
    play: 'M8 4l12 8-12 8z',
    prev: 'M15 5l-7 7 7 7',
    next: 'M9 5l7 7-7 7',
    close: 'M6 6l12 12 M18 6L6 18',
    reset: 'M4 10a8 8 0 1 1 2 8 M4 4v6h6',
    share: 'M12 16V3 M7 8l5-5 5 5 M4 13v7h16v-7',
    plus: 'M5 12h14 M12 5v14',
    minus: 'M5 12h14',
    book: 'M3 4h6a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3z M21 4h-6a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h6z',
  };
  return `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${p[name]}"/></svg>`;
};
export function eventArticle(e, compact = false) {
  const context = `<p>${esc(e.explanation)}</p><h3>Read the sources</h3><ul>${[
    ...e.sourceIds,
    'atlas',
  ]
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((k) => `<li><a href="${sources[k].url}">${esc(sources[k].title)}</a></li>`)
    .join('')}</ul>`;
  return `<h2>${esc(e.title)}</h2><p class="article-lead">${esc(e.summary)}</p><dl>${e.dates.map(([l, d]) => `<div><dt>${esc(l)}</dt><dd><time datetime="${d}">${d}</time></dd></div>`).join('')}</dl>${compact ? `<details class="context-disclosure"><summary>Context &amp; sources</summary>${context}</details>` : context}`;
}
export function page({
  e = events[2],
  path = '/',
  article = '',
  title,
  description,
  story = false,
  atlas = true,
  origin,
}) {
  const metaTitle = title || `${e.title} | America Unfolded`;
  const url = origin ? new URL(path, origin).href : null;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(metaTitle)}</title><meta name="description" content="${esc(description || e.summary)}"><meta name="theme-color" content="#f5f0e5"><meta property="og:title" content="${esc(metaTitle)}"><meta property="og:description" content="${esc(description || e.summary)}"><meta property="og:type" content="website">${url ? `<link rel="canonical" href="${url}"><meta property="og:url" content="${url}">` : ''}<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preload" href="/fonts/eb-garamond.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/app.css"></head><body>
<a class="skip" href="#main">Skip to content</a>
<header class="masthead"><a class="brand" href="/" aria-label="America Unfolded home">${icon('map')}<span>America Unfolded</span></a><p class="tagline">Explore American history through maps.</p><nav aria-label="Main"><a href="/sources/">Sources &amp; methods</a><a href="/about/">About</a></nav></header>
<main id="main" ${atlas ? `data-atlas data-default-event="${e.id}" data-story="${story}"` : ''}>
${
  atlas
    ? `<div class="atlas-heading"><div><h1>A nation, unfolded.</h1><p>Follow the making of the United States, 1776–1959.</p></div><a class="button primary" href="/story/how-america-took-shape/" id="start-story">${icon('book')} Follow the story</a></div>
<section class="atlas" aria-label="Interactive historical atlas">
<div class="map-toolbar"><div class="map-mode"><span class="plate-icon" aria-hidden="true">▱</span> Historical atlas <span id="mode-date"></span></div><div class="map-options"><label><input type="checkbox" id="modern">Modern state lines</label><label><input type="checkbox" id="compare">Before &amp; after</label><button type="button" id="share" class="text-button">${icon('share')}<span>Share view</span></button></div></div>
<div class="map-layout">
<div class="map-column"><div class="comparison-caption" id="comparison-caption" hidden></div><div class="map-stage" id="map-stage" aria-busy="true">
<div id="map-status" role="status" class="map-status"><h2>Unfolding the map…</h2><p>Loading the dated boundary snapshot.</p></div>
<svg id="history-map" viewBox="0 0 1000 650" aria-label="Historical map. Drag to pan, pinch to zoom. Focus the map and use arrow keys, plus, minus, or Home." tabindex="0" role="group"><title>U.S. historical jurisdictions and claims</title></svg>
<div class="map-controls" aria-label="Map navigation"><button type="button" id="zoom-in" aria-label="Zoom in">${icon('plus')}</button><button type="button" id="zoom-out" aria-label="Zoom out">${icon('minus')}</button><button type="button" id="reset-view" aria-label="Reset map view">${icon('reset')}</button></div>
<div class="map-print-label" aria-hidden="true">North America</div>
<p class="inset-note">Alaska &amp; Hawaiʻi: relocated insets.<br>Alaska reduced in scale. Positions are not relative.</p>
</div><div class="map-legend" aria-label="Map legend"><span><i class="swatch state"></i>State / federal district</span><span><i class="swatch territory"></i>Territory</span><span><i class="swatch claim"></i>Claim / pending transfer</span><span><i class="swatch polity"></i>Other polity</span><span id="modern-key" hidden><i class="line-swatch"></i>State lines (2000 reference)</span><span id="comparison-key" hidden><i class="swatch change"></i>Added in next snapshot</span></div><p class="scope-note">${esc(scopeNote)} <a href="/sources/">Map conventions</a></p></div>
<aside class="chapter" id="chapter" aria-label="Historical details"><div class="chapter-top"><span id="chapter-position">Chapter 3 of ${events.length}</span><button type="button" id="close-details" aria-label="Close historical details">${icon('close')}</button></div><div id="chapter-content">${eventArticle(e, true)}</div><button type="button" id="read-chapter" class="text-button">Read chapter ${icon('next')}</button><div class="chapter-bottom"><a id="chapter-link" href="/events/${e.id}/">Open chapter page</a><button type="button" id="story-next" class="text-button" hidden>Continue ${icon('next')}</button></div></aside>
<button type="button" id="open-details" class="reopen button" hidden>Open historical details</button>
</div>
<div class="timeline" aria-label="Historical timeline"><div class="time-controls"><button type="button" id="previous" aria-label="Previous key event">${icon('prev')}</button><button type="button" id="play" class="play-button" aria-label="Play timeline">${icon('play')}</button><button type="button" id="next" aria-label="Next key event">${icon('next')}</button><div class="year-readout"><output id="current-year">${e.date.slice(0, 4)}</output><span id="current-event">${esc(e.short)}</span></div><label class="year-entry">Go to year<input id="year-input" type="number" name="year" min="1776" max="1959" value="${e.date.slice(0, 4)}" inputmode="numeric"></label></div><div class="time-track"><label for="year-range" class="visually-hidden">Choose a year, from 1776 to 1959</label><input id="year-range" name="timeline-year" type="range" min="1776" max="1959" value="${e.date.slice(0, 4)}"><div class="year-ticks" aria-hidden="true"><span>1776</span><span>1800</span><span>1850</span><span>1900</span><span>1959</span></div><p id="snapshot-label" role="status" aria-live="polite">Map snapshot: ${e.date}. No interpolation between dated records.</p></div></div>
<div class="story-bar" id="story-bar" hidden><span id="story-progress"></span><button type="button" class="text-button" id="story-next-compact">Next chapter</button><button type="button" class="text-button" id="end-story">Leave story</button></div>
</section>
<section class="event-index" aria-labelledby="index-title"><div class="index-intro"><h2 id="index-title">Turn to a moment in history.</h2><p>A treaty, a transfer, a state.<br>Each is a different kind of change.</p><a href="/sources/">How to read this atlas</a></div><ol>${events.map((a, i) => `<li><a href="/events/${a.id}/" data-event="${a.id}"><time datetime="${a.date}">${a.date.slice(0, 4)}</time><span>${esc(a.short)}</span><span class="event-kind">${esc(a.kind)}</span>${icon('next')}</a></li>`).join('')}</ol></section>
<noscript><section class="reading-page"><h2>The atlas without JavaScript</h2><p>The interactive map requires JavaScript. The chapters, dates, source links and methods below remain readable.</p>${eventArticle(e)}</section></noscript>`
    : `<article class="reading-page">${article}</article>`
}
</main><footer class="footer"><span>America Unfolded</span><p>A free atlas for curious minds.</p><nav aria-label="Footer"><a href="/sources/">Data &amp; licenses</a><a href="/about/">Project notes</a><a href="/story/how-america-took-shape/">The story</a></nav></footer><p id="announcement" class="visually-hidden" role="status" aria-live="polite"></p>${atlas ? '<script type="module" src="/assets/app.js"></script>' : ''}</body></html>`;
}

import { geoAlbersUsa, geoPath, geoGraticule10, geoCentroid } from 'd3-geo';
import { select } from 'd3-selection';
import { feature as topoFeature } from 'topojson-client';
import { zoom, zoomIdentity } from 'd3-zoom';
import { events, eventById, eventAt, scopeNote } from './data/events.mjs';
import { eventArticle, esc, icon } from '../scripts/template.mjs';
const $ = (s) => document.querySelector(s),
  root = $('[data-atlas]');
const storyEvents = events.filter((e) => e.story);
const initial = eventById(root.dataset.defaultEvent) || events[2];
let state = {
  date: initial.date,
  event: initial.id,
  modern: false,
  compare: false,
  phase: 'after',
  region: null,
  details: true,
  expanded: false,
  story: root.dataset.story === 'true',
  k: 1,
  x: 0,
  y: 0,
};
let manifest,
  modernData,
  currentData,
  previousData,
  currentSnapshot,
  sequence = 0,
  playing = null,
  regionReturn = null,
  loading = false,
  gestureMoved = false,
  suppressMapClickUntil = 0,
  viewRevision = 0,
  hasPresentedMap = false,
  presentedSelection = null,
  presentedDate = null,
  presentedPhase = 'after',
  loadingNoticeTimer,
  isScrubbing = false,
  snapshotAnimations = [],
  previousFrame = null;
const cache = new Map(),
  svg = select('#history-map');
const projection = geoAlbersUsa().scale(1170).translate([500, 305]);
const path = geoPath(projection);
const pathCache = new WeakMap();
const labelCache = new WeakMap();
function regionPath(feature) {
  if (!pathCache.has(feature)) pathCache.set(feature, path(feature));
  return pathCache.get(feature);
}
function labelPoint(feature) {
  if (!labelCache.has(feature)) labelCache.set(feature, projection(geoCentroid(feature)));
  return labelCache.get(feature);
}
svg.html(
  '<defs><pattern id="claim-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="7" height="7" class="claim-base"/><path d="M0 0V7" class="hatch-line"/></pattern></defs><g class="map-content"><g class="reference-land"></g><g class="inset-guides" aria-hidden="true"><rect x="4" y="445" width="244" height="150"/><rect x="250" y="499" width="116" height="96"/><text x="126" y="615">Alaska (inset)</text><text x="308" y="615">Hawaiʻi (inset)</text></g><g class="graticules"></g><g class="historic-regions"></g><g class="modern-lines"></g><g class="region-labels" aria-hidden="true"></g></g>',
);
const content = svg.select('.map-content');
const zoomBehavior = zoom()
  .filter((e) => (e.type === 'wheel' ? e.ctrlKey : !e.button))
  .scaleExtent([0.8, 5])
  .extent([
    [0, 0],
    [1000, 650],
  ])
  .translateExtent([
    [-650, -450],
    [1650, 1100],
  ])
  .on('start', (e) => {
    if (e.sourceEvent) {
      pause();
      gestureMoved = false;
      viewRevision++;
    }
  })
  .on('zoom', (e) => {
    if (e.sourceEvent) gestureMoved = true;
    content.attr('transform', e.transform);
    state.k = e.transform.k;
    state.x = e.transform.x;
    state.y = e.transform.y;
  })
  .on('end', (e) => {
    if (e.sourceEvent) {
      if (gestureMoved) suppressMapClickUntil = performance.now() + 500;
      save('push');
    }
  });
svg.call(zoomBehavior).on('dblclick.zoom', null);
const fmt = (d) =>
  new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
function orientCompass() {
  const mainland = modernData.features.filter(
    (f) => !['Alaska', 'Hawaii'].includes(f.properties.NAME),
  );
  const centre = geoCentroid({ type: 'FeatureCollection', features: mainland });
  const origin = projection(centre);
  const north = projection([centre[0], centre[1] + 0.25]);
  if (!origin || !north) return;
  const angle = (Math.atan2(north[1] - origin[1], north[0] - origin[0]) * 180) / Math.PI + 90;
  $('#compass-needle').setAttribute('transform', `rotate(${angle} 40 40)`);
}
function announce(s) {
  $('#announcement').textContent = s;
}
function readURL() {
  const u = new URL(location.href),
    p = u.searchParams;
  const e = eventById(p.get('event')) || initial;
  const raw = p.get('date');
  state.date =
    /^\d{4}-\d{2}-\d{2}$/.test(raw || '') &&
    !Number.isNaN(Date.parse(raw)) &&
    raw >= '1776-07-04' &&
    raw <= '1959-08-21'
      ? raw
      : e.date;
  state.event = e.id;
  state.modern = p.get('modern') === '1';
  state.compare = p.get('compare') === '1';
  state.phase = p.get('phase') === 'before' ? 'before' : 'after';
  state.region = p.get('region') || null;
  state.story = p.has('story') ? p.get('story') === '1' : root.dataset.story === 'true';
  state.details = p.get('details') !== '0';
  state.expanded = p.get('expanded') === '1' || !!state.region;
  for (const [key, min, max] of [
    ['k', 0.8, 5],
    ['x', -5000, 5000],
    ['y', -5000, 5000],
  ]) {
    const n = Number(p.get(key));
    state[key] =
      p.has(key) && Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : key === 'k' ? 1 : 0;
  }
  svg.call(zoomBehavior.transform, zoomIdentity.translate(state.x, state.y).scale(state.k));
}
function save(mode = 'push') {
  const u = new URL(location.href);
  u.search = '';
  const p = u.searchParams;
  p.set('date', state.date);
  p.set('event', state.event);
  if (state.modern) p.set('modern', '1');
  if (state.compare) {
    p.set('compare', '1');
    if (state.phase === 'before') p.set('phase', 'before');
  }
  if (state.region) p.set('region', state.region);
  if (state.story) p.set('story', '1');
  else if (root.dataset.story === 'true') p.set('story', '0');
  if (!state.details) p.set('details', '0');
  if (state.details && state.expanded) p.set('expanded', '1');
  if (state.k !== 1 || state.x !== 0 || state.y !== 0)
    for (const key of ['k', 'x', 'y']) p.set(key, String(Math.round(state[key] * 100) / 100));
  if (u.href !== location.href)
    history[mode === 'replace' ? 'replaceState' : 'pushState'](null, '', u);
}
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw Error(`${response.status}`);
  let data = await response.json();
  if (data.type === 'Topology') {
    const converted = topoFeature(data, data.objects.regions);
    converted.date = data.date;
    data = converted;
  }
  if (data.type !== 'FeatureCollection' || !Array.isArray(data.features) || !data.features.length)
    throw Error('missing-data');
  return data;
}
async function snapshot(s) {
  if (!s) return null;
  if (cache.has(s.file)) {
    const request = cache.get(s.file);
    cache.delete(s.file);
    cache.set(s.file, request);
    return request;
  }
  const request = fetchJSON('/data/' + s.file).catch((error) => {
    if (cache.get(s.file) === request) cache.delete(s.file);
    throw error;
  });
  cache.set(s.file, request);
  // Keep recent views and upcoming playback frames without retaining the entire atlas on a phone.
  while (cache.size > 8) cache.delete(cache.keys().next().value);
  return request;
}
function showStatus(title, message, retry = false, retryAction = null) {
  const el = $('#map-status');
  el.hidden = false;
  el.classList.toggle('is-map-notice', hasPresentedMap);
  el.innerHTML = `<h2>${title}</h2><p>${message}</p>${retry ? '<button type="button" id="retry-map" class="button">Retry loading</button>' : ''}`;
  if (retry) $('#retry-map').onclick = retryAction || (() => load());
}
function statusClass(f) {
  const p = f.properties,
    d =
      state.compare && state.phase === 'before'
        ? previousData?.date || state.date
        : presentedDate || state.date;
  const pending =
    (p.NAME === 'Louisiana Purchase' && d < '1803-12-20') ||
    (p.NAME === 'Florida Unorg. FT' && d < '1821-02-22') ||
    (p.NAME === 'Oregon Unorg. FT' && d < '1846-07-17') ||
    (p.NAME === 'Alaska Department' && d < '1867-10-18') ||
    (p.NAME === 'Hawaii Annexation' && d < '1898-08-12');
  if (p.TERR_TYPE === 'Other' && p.NAME !== 'Oregon Country') return 'polity';
  if (p.NAME === 'Oregon Country' || pending || (p.NAME === 'Texas' && d < '1850-12-13'))
    return 'claim';
  return p.TERR_TYPE === 'State' || p.TERR_TYPE === 'District of Columbia' ? 'state' : 'territory';
}
function finishSnapshotTransition() {
  for (const animation of snapshotAnimations) animation.cancel();
  snapshotAnimations = [];
  previousFrame?.remove();
  previousFrame = null;
}
function prepareSnapshotTransition(data, enabled) {
  finishSnapshotTransition();
  if (!enabled || matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const old = new Map(
    [...svg.select('.historic-regions').node().children].map((node) => [
      node.__data__.properties.ID_NUM,
      node,
    ]),
  );
  if (![...old.values()].every((node) => typeof node.animate === 'function')) return null;
  const nextIds = new Set((data?.features || []).map((f) => f.properties.ID_NUM));
  const changing = new Set(
    (data?.features || [])
      .filter((f) => {
        const node = old.get(f.properties.ID_NUM);
        return (
          !node ||
          node.getAttribute('class').replace(' selected', '') !==
            regionClass(f).replace(' selected', '')
        );
      })
      .map((f) => f.properties.ID_NUM),
  );
  const exiting = new Set([...old.keys()].filter((id) => !nextIds.has(id)));
  if (!changing.size && !exiting.size) return null;
  const createGroup = (className) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    node.setAttribute('class', className);
    return node;
  };
  const frame = createGroup('map-previous');
  frame.setAttribute('aria-hidden', 'true');
  const oldRegions = createGroup('previous-regions'),
    oldLabels = createGroup('previous-labels');
  frame.append(oldRegions, oldLabels);
  const fadeOut = [];
  const copy = (node, parent, fade) => {
    const clone = node.cloneNode(true);
    for (const element of [clone, ...clone.querySelectorAll('*')]) {
      element.removeAttribute('tabindex');
      element.removeAttribute('role');
      element.removeAttribute('aria-label');
      if (element.tagName.toLowerCase() === 'title') element.remove();
    }
    parent.append(clone);
    if (fade) fadeOut.push(clone);
  };
  for (const [id, node] of old)
    if (exiting.has(id) || changing.has(id)) copy(node, oldRegions, exiting.has(id));
  for (const node of svg.select('.region-labels').node().children) {
    if (exiting.has(node.__data__.properties.ID_NUM)) copy(node, oldLabels, true);
  }
  content.node().insertBefore(frame, svg.select('.historic-regions').node());
  previousFrame = frame;
  return () => {
    // Unchanged regions stay opaque. Exact dated paths change only in opacity, never in vertices.
    const timing = { duration: 160, easing: 'ease-out' };
    const start = (node, from, to) => {
      const animation = node.animate([{ opacity: from }, { opacity: to }], timing);
      snapshotAnimations.push(animation);
      return animation.finished.catch(() => {});
    };
    const finished = fadeOut.map((node) => start(node, 1, 0));
    for (const node of svg.select('.historic-regions').node().children) {
      if (changing.has(node.__data__.properties.ID_NUM)) finished.push(start(node, 0, 1));
    }
    for (const node of svg.select('.region-labels').node().children) {
      if (!old.has(node.__data__.properties.ID_NUM)) finished.push(start(node, 0, 1));
    }
    Promise.all(finished).then(() => {
      frame.remove();
      if (previousFrame === frame) {
        previousFrame = null;
        snapshotAnimations = [];
      }
    });
  };
}
function regionClass(f) {
  const previousIds = new Set((previousData?.features || []).map((item) => item.properties.ID_NUM));
  return `region ${statusClass(f)}${state.compare && state.phase === 'after' && !previousIds.has(f.properties.ID_NUM) ? ' changed' : ''}${state.region === String(f.properties.ID_NUM) ? ' selected' : ''}`;
}
function prefetchNextEvent() {
  if (!playing || !manifest) return;
  const next = events.find((e) => e.date > state.date);
  if (!next) return;
  const i = manifest.snapshots.findLastIndex((s) => s.date <= next.date);
  void Promise.allSettled([snapshot(manifest.snapshots[i]), snapshot(manifest.snapshots[i - 1])]);
}
function renderMap({ animate = false } = {}) {
  const data = state.compare && state.phase === 'before' ? previousData : currentData;
  const reveal = prepareSnapshotTransition(data, animate);
  svg
    .select('.historic-regions')
    .selectAll('path')
    .data(data?.features || [], (f) => f.properties.ID_NUM)
    .join('path')
    .attr('d', regionPath)
    .attr('class', regionClass)
    .attr('role', 'button')
    .attr('tabindex', 0)
    .attr(
      'aria-label',
      (f) =>
        `${f.properties.NAME}, ${statusClass(f) === 'claim' ? 'claim or pending agreement' : statusClass(f) === 'polity' ? 'separate historic polity' : f.properties.TERR_TYPE}. Open source record.`,
    )
    .on('click', (e, f) => {
      e.stopPropagation();
      if (performance.now() < suppressMapClickUntil) return;
      openRegion(f, e.currentTarget);
    })
    .on('keydown', (e, f) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openRegion(f, e.currentTarget);
      }
    })
    .selectAll('title')
    .data((f) => [f])
    .join('title')
    .text((f) => `${f.properties.NAME} (${f.properties.TERR_TYPE})`);
  svg
    .select('.modern-lines')
    .selectAll('path')
    .data(state.modern ? modernData?.features || [] : [])
    .join('path')
    .attr('d', regionPath);
  const labels = (data?.features || []).filter(
    (f) => f.properties.AREA_SQMI > 20000 && labelPoint(f),
  );
  svg
    .select('.region-labels')
    .selectAll('text')
    .data(labels, (f) => f.properties.ID_NUM)
    .join('text')
    .attr('x', (f) => labelPoint(f)[0])
    .attr('y', (f) => labelPoint(f)[1])
    .text((f) =>
      f.properties.TERR_TYPE === 'State'
        ? f.properties.ABBR_NAME
        : {
            'Unorg. Fed. Terr.': 'Federal territory',
            'Alaska Department': 'Alaska',
            'Alaska District': 'Alaska',
          }[f.properties.NAME] || f.properties.NAME,
    );
  $('#map-stage').classList.toggle('no-history', !data);
  $('#comparison-key').hidden = !state.compare;
  $('#modern-key').hidden = !state.modern;
  const cap = $('#comparison-caption');
  cap.hidden = !state.compare;
  cap.innerHTML = state.compare
    ? `<span>Compare dated records</span><div class="comparison-switch"><button type="button" data-phase="before" aria-pressed="${state.phase === 'before'}">Before${previousData ? ' / ' + fmt(previousData.date) : ' / no snapshot'}</button><button type="button" data-phase="after" aria-pressed="${state.phase === 'after'}">After / ${currentSnapshot ? fmt(currentSnapshot.date) : 'no snapshot'}</button></div>`
    : '';
  cap.querySelectorAll('button').forEach(
    (b) =>
      (b.onclick = () => {
        pause();
        state.phase = b.dataset.phase;
        state.region = null;
        renderMap();
        renderCaption();
        renderDetails();
        save();
      }),
  );
  presentedPhase = state.phase;
  reveal?.();
}
function renderCaption() {
  const year = state.date.slice(0, 4),
    e = eventById(state.event) || eventAt(state.date);
  const controlYear = isScrubbing && pendingYear ? pendingYear : year;
  $('#current-year').textContent = controlYear;
  $('#current-event').textContent = e.short;
  $('#year-range').value = controlYear;
  $('#year-input').value = year;
  $('#mode-date').textContent = fmt(state.date);
  $('#modern').checked = state.modern;
  $('#compare').checked = state.compare;
  const data = state.compare && state.phase === 'before' ? previousData : currentData;
  $('#snapshot-label').textContent = data
    ? `Selected ${fmt(state.date)}. ${state.compare && state.phase === 'before' ? 'Before map' : 'Snapshot'}: ${fmt(data.date)}. Source record dates; no interpolation.`
    : 'No historical boundary snapshot is available before Sep 3, 1783. Showing modern geographic context only.';
  $('#previous').disabled = state.date <= events[0].date;
  $('#next').disabled = state.date >= events.at(-1).date;
  $('#compare').disabled = !currentSnapshot;
  $('#story-bar').hidden = !state.story;
  $('#story-next').hidden = !state.story;
  $('#story-progress').textContent = `How America took shape / ${
    Math.max(
      0,
      storyEvents.findIndex((x) => x.id === state.event),
    ) + 1
  } of ${storyEvents.length}`;
  $('#story-next-compact').textContent =
    state.event === storyEvents.at(-1).id ? 'Finish story' : 'Next chapter';
  $('#start-story').textContent = state.story ? 'Restart story' : 'Follow the story';
}
function renderDetails() {
  let e = eventById(state.event) || eventAt(state.date),
    f = (state.compare && state.phase === 'before' ? previousData : currentData)?.features.find(
      (x) => String(x.properties.ID_NUM) === state.region,
    );
  if (state.region && !f) state.region = null;
  $('#chapter-position').textContent = f
    ? 'Source atlas record'
    : `Chapter ${events.indexOf(e) + 1} of ${events.length}`;
  $('#chapter-content').innerHTML = f
    ? `<h2>${esc(f.properties.FULL_NAME)}</h2><p class="article-lead">${esc(f.properties.TERR_TYPE)}${statusClass(f) === 'claim' ? '. Displayed as a claim or pending agreement.' : '.'}</p><p>${esc(f.properties.CHANGE)}</p><dl><div><dt>Source record begins</dt><dd>${fmt(f.properties.START_DATE)}</dd></div><div><dt>Source record ends</dt><dd>${fmt(f.properties.END_DATE)}</dd></div>${f.properties.DISPLAY_START ? `<div><dt>Map display begins</dt><dd>${fmt(f.properties.DISPLAY_START)}</dd></div>` : ''}</dl><h3>Source citation</h3><p>${esc(f.properties.CITATION)}</p><p class="record-caveat">Original atlas wording. “Unorganized” is a U.S. administrative label; it does not mean uninhabited or without Indigenous government. A record’s start may be a signature date rather than transfer or effective control.</p><a href="https://publications.newberry.org/ahcb/downloads/united_states.html">Newberry Library source dataset</a>`
    : eventArticle(e, true);
  $('#chapter-link').href = `/events/${e.id}/`;
  $('#chapter-link').textContent = 'Open chapter page';
  document.querySelectorAll('[data-event]').forEach((a) => {
    if (a.dataset.event === e.id) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
  $('#chapter').classList.toggle('expanded', state.expanded);
  $('#chapter').classList.toggle('details-closed', !state.details);
  $('#open-details').hidden = state.details;
  $('#chapter').hidden = !state.details;
  $('#read-chapter').hidden = !state.details;
}
async function load({ focus = false } = {}) {
  const focusRevision = viewRevision;
  const token = ++sequence;
  const requested = { date: state.date, event: state.event, phase: state.phase };
  clearTimeout(loadingNoticeTimer);
  loading = true;
  $('#map-stage').setAttribute('aria-busy', 'true');
  if (!hasPresentedMap) showStatus('Unfolding the map…', 'Loading the dated boundary snapshot.');
  else {
    $('#map-status').hidden = true;
    loadingNoticeTimer = setTimeout(() => {
      if (token === sequence)
        $('#snapshot-label').textContent =
          `Loading ${fmt(requested.date)}… Showing ${fmt(presentedDate)} until ready.`;
    }, 200);
  }
  try {
    if (!manifest) {
      const res = await fetch('/data/manifest.json');
      if (!res.ok) throw Error('manifest');
      manifest = await res.json();
      if (!Array.isArray(manifest.snapshots) || !manifest.snapshots.length)
        throw Error('missing-data');
    }
    if (!modernData) {
      modernData = await fetchJSON('/data/modern.json');
      orientCompass();
    }
    const index = manifest.snapshots.findLastIndex((s) => s.date <= requested.date);
    const s = manifest.snapshots[index];
    const [current, prev] = await Promise.all([
      snapshot(s),
      snapshot(manifest.snapshots[index - 1]),
    ]);
    if (token !== sequence) return;
    clearTimeout(loadingNoticeTimer);
    const changedSnapshot = currentData?.date !== current?.date;
    currentSnapshot = s;
    presentedDate = requested.date;
    currentData = current;
    previousData = prev;
    if (!hasPresentedMap) {
      svg
        .select('.reference-land')
        .selectAll('path')
        .data(modernData.features)
        .join('path')
        .attr('d', path);
      svg
        .select('.graticules')
        .selectAll('path')
        .data([geoGraticule10()])
        .join('path')
        .attr('d', path);
    }
    renderMap({ animate: hasPresentedMap && changedSnapshot });
    renderCaption();
    renderDetails();
    if (focus && focusRevision === viewRevision) {
      const e = eventById(state.event);
      const regions =
        currentData?.features.filter((f) => e.match.includes(f.properties.NAME)) || [];
      if (regions.length) {
        const bounds = path.bounds({ type: 'FeatureCollection', features: regions });
        const center = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
        if (center.every(Number.isFinite)) {
          const k = e.scale;
          svg.call(
            zoomBehavior.transform,
            zoomIdentity.translate(500 - k * center[0], 325 - k * center[1]).scale(k),
          );
          save('replace');
        }
      }
    }
    $('#map-status').hidden = true;
    $('#map-stage').setAttribute('aria-busy', 'false');
    loading = false;
    hasPresentedMap = true;
    presentedSelection = { date: state.date, event: state.event };
    prefetchNextEvent();
  } catch (error) {
    if (token !== sequence) return;
    clearTimeout(loadingNoticeTimer);
    loading = false;
    pause();
    if (hasPresentedMap) {
      state.date = presentedSelection.date;
      state.event = presentedSelection.event;
      state.phase = presentedPhase;
      state.region = null;
      renderMap();
      renderCaption();
      renderDetails();
      save('replace');
    }
    showStatus(
      error.message === 'missing-data' ? 'Boundary data is missing' : 'The map could not be loaded',
      hasPresentedMap
        ? `Could not load ${fmt(requested.date)}. Keeping the map for ${fmt(presentedDate)}.`
        : 'The dated map file is unavailable. Retry, or use the readable chapters below.',
      true,
      () => {
        Object.assign(state, requested);
        save('replace');
        load({ focus });
      },
    );
    $('#map-stage').setAttribute('aria-busy', 'false');
    announce(
      'Map loading failed. The previous map is retained when available. Retry loading is available.',
    );
  }
}

function openRegion(f, target) {
  pause();
  if (loading && hasPresentedMap) {
    ++sequence;
    clearTimeout(loadingNoticeTimer);
    state.date = presentedSelection.date;
    state.event = presentedSelection.event;
    loading = false;
    $('#map-stage').setAttribute('aria-busy', 'false');
    $('#map-status').hidden = true;
    renderCaption();
  }
  regionReturn = target;
  state.region = String(f.properties.ID_NUM);
  state.details = true;
  state.expanded = true;
  $('#chapter').classList.add('expanded');
  renderMap();
  renderDetails();
  save();
  $('#close-details').focus({ preventScroll: true });
  if (matchMedia('(max-width: 760px)').matches)
    $('#chapter').scrollIntoView({ block: 'start', behavior: 'instant' });
}
function setEvent(e, { push = true, focus = false } = {}) {
  clearTimeout(yearTimer);
  yearTimer = null;
  isScrubbing = false;
  pause();
  state.date = e.date;
  state.event = e.id;
  state.region = null;
  state.details = true;
  state.expanded = false;
  state.phase = 'after';
  if (push) save();
  load({ focus });
}
function chooseYear(value, push = true) {
  state.story = false;
  const n = Math.max(1776, Math.min(1959, Math.round(Number(value))));
  if (!Number.isFinite(n)) return;
  pause();
  state.date = n === 1959 ? '1959-08-21' : `${n}-12-31`;
  state.event = eventAt(state.date).id;
  state.region = null;
  state.phase = 'after';
  if (push) save();
  load();
}
function pause() {
  if (playing) {
    clearInterval(playing);
    playing = null;
    $('#play').innerHTML = icon('play');
    $('#play').setAttribute('aria-label', 'Play timeline');
  }
}
function adjacent(direction) {
  return direction > 0
    ? events.find((e) => e.date > state.date)
    : events.filter((e) => e.date < state.date).at(-1);
}
$('#previous').onclick = () => {
  state.story = false;
  const e = adjacent(-1);
  if (e) setEvent(e);
};
$('#next').onclick = () => {
  state.story = false;
  const e = adjacent(1);
  if (e) setEvent(e);
};
$('#play').onclick = () => {
  if (playing) {
    pause();
    return;
  }
  if (state.date >= events.at(-1).date) setEvent(events[0]);
  const tick = () => {
    if (loading) return;
    const next = adjacent(1);
    if (!next) {
      pause();
      return;
    }
    state.date = next.date;
    state.event = next.id;
    state.region = null;
    state.phase = 'after';
    save('replace');
    load();
    if (next === events.at(-1)) pause();
  };
  $('#play').innerHTML = '<span aria-hidden="true">Ⅱ</span>';
  $('#play').setAttribute('aria-label', 'Pause timeline');
  playing = setInterval(tick, matchMedia('(prefers-reduced-motion: reduce)').matches ? 6500 : 4500);
  prefetchNextEvent();
  announce('Timeline playing. Use Pause to stop.');
};
let yearTimer, pendingYear;
$('#year-range').oninput = (e) => {
  pause();
  isScrubbing = true;
  pendingYear = e.target.value;
  $('#current-year').textContent = pendingYear;
  if (!yearTimer)
    yearTimer = setTimeout(() => {
      yearTimer = null;
      chooseYear(pendingYear, false);
    }, 80);
};
$('#year-range').onchange = (e) => {
  isScrubbing = false;
  clearTimeout(yearTimer);
  yearTimer = null;
  chooseYear(e.target.value);
};
$('#year-range').addEventListener('pointerdown', () => pause());
$('#year-input').onchange = (e) => chooseYear(e.target.value);
$('#modern').onchange = (e) => {
  pause();
  state.modern = e.target.checked;
  renderMap();
  save();
};
$('#compare').onchange = (e) => {
  pause();
  state.compare = e.target.checked;
  state.phase = 'after';
  state.region = null;
  renderMap();
  renderCaption();
  renderDetails();
  save();
};
$('#zoom-in').onclick = () => {
  pause();
  viewRevision++;
  svg.call(zoomBehavior.scaleBy, 1.3);
  save();
};
$('#zoom-out').onclick = () => {
  pause();
  viewRevision++;
  svg.call(zoomBehavior.scaleBy, 1 / 1.3);
  save();
};
$('#reset-view').onclick = () => {
  pause();
  viewRevision++;
  svg.call(zoomBehavior.transform, zoomIdentity);
  save();
};
$('#history-map').addEventListener('keydown', (e) => {
  if (e.target !== $('#history-map')) return;
  const delta = { ArrowLeft: [50, 0], ArrowRight: [-50, 0], ArrowUp: [0, 50], ArrowDown: [0, -50] }[
    e.key
  ];
  if (delta) {
    e.preventDefault();
    pause();
    viewRevision++;
    svg.call(zoomBehavior.translateBy, delta[0] / state.k, delta[1] / state.k);
    save();
  } else if (['+', '=', '-', 'Home'].includes(e.key)) {
    e.preventDefault();
    $('#' + (e.key === 'Home' ? 'reset-view' : e.key === '-' ? 'zoom-out' : 'zoom-in')).click();
  }
});
function closeDetails() {
  pause();
  state.details = false;
  state.expanded = false;
  state.region = null;
  $('#chapter').classList.remove('expanded');
  renderDetails();
  renderMap();
  save();
  $('#open-details').focus({ preventScroll: true });
}
$('#close-details').onclick = closeDetails;
$('#open-details').onclick = () => {
  state.details = true;
  renderDetails();
  save();
  $('#close-details').focus({ preventScroll: true });
};
$('#read-chapter').onclick = () => {
  state.expanded = true;
  save();
  $('#chapter').classList.add('expanded');
  $('#close-details').focus({ preventScroll: true });
};
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.details) closeDetails();
});
$('#share').onclick = async () => {
  pause();
  save('replace');
  const button = $('#share span');
  try {
    await navigator.clipboard.writeText(location.href);
    button.textContent = 'Link copied';
    announce('View link copied to clipboard.');
    setTimeout(() => (button.textContent = 'Share view'), 2500);
  } catch {
    const existing = $('#share-fallback');
    if (existing) existing.remove();
    const box = document.createElement('div');
    box.className = 'share-fallback';
    box.id = 'share-fallback';
    box.innerHTML =
      '<label for="share-url">Copy this view URL</label><input id="share-url" readonly><button type="button">Close</button>';
    $('.map-toolbar').after(box);
    box.querySelector('input').value = location.href;
    box.querySelector('input').select();
    box.querySelector('button').onclick = () => {
      box.remove();
      $('#share').focus();
    };
  }
};
document.querySelectorAll('[data-event]').forEach(
  (a) =>
    (a.onclick = (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      state.story = false;
      setEvent(eventById(a.dataset.event));
      if (matchMedia('(max-width:760px)').matches)
        $('#map-stage').scrollIntoView({ block: 'start', behavior: 'instant' });
    }),
);
$('#start-story').onclick = (e) => {
  e.preventDefault();
  state.story = true;
  setEvent(storyEvents[0], { focus: true });
};
$('#story-next').onclick = () => {
  const i = storyEvents.findIndex((e) => e.id === state.event);
  if (i >= storyEvents.length - 1) {
    state.story = false;
    renderCaption();
    save();
    announce('You have reached the end of the story.');
  } else setEvent(storyEvents[i + 1], { focus: true });
};
$('#story-next-compact').onclick = () => $('#story-next').click();
$('#end-story').onclick = () => {
  state.story = false;
  pause();
  renderCaption();
  save();
};
$('#chapter').addEventListener('focusin', pause);
$('#chapter').addEventListener('pointerenter', pause);
window.addEventListener('popstate', () => {
  isScrubbing = false;
  clearTimeout(yearTimer);
  yearTimer = null;
  pause();
  readURL();
  load();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pause();
});
window.addEventListener('pagehide', pause);
readURL();
save('replace');
load();

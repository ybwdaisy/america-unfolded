/**
 * America Unfolded · Core Interactive Map Engine
 * Free educational historical cartography application.
 */

(function () {
  'use strict';

  const DATA = window.AMERICA_DATA;
  if (!DATA) {
    console.error('Historical map data bundle not loaded.');
    return;
  }

  const { territoryShapes, stateShapes, timelineNodes } = DATA;

  // Acquisition color map by historical period / region
  const COLOR_PALETTE = {
    // 1783 Original 13 states & British cession
    14: '#2D445C',
    // 1803 Louisiana Purchase
    6: '#8E6D38',
    7: '#7D5F30',
    8: '#7D5F30',
    9: '#7D5F30',
    // 1818 British Cession (Red River Basin)
    2: '#3D5E4D',
    // 1819 Spanish Florida Cession & Adams-Onis
    3: '#8E3E30',
    13: '#8E3E30',
    17: '#8E3E30',
    // 1845 Texas Annexation
    15: '#B87A2B',
    // 1846 Oregon Treaty
    11: '#2E5A44',
    // 1848 Mexican Cession
    10: '#9C4837',
    // 1853 Gadsden Purchase
    4: '#A86824',
    // 1867 Alaska Purchase
    1: '#354E66',
    // 1898 Hawaii Annexation
    5: '#9E4E56'
  };

  // Original 13 states IDs
  const THIRTEEN_STATES_IDS = ['NH', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'DE', 'MD', 'VA', 'NC', 'SC', 'GA', 'ME', 'VT', 'WV'];

  // Application State
  const state = {
    currentNodeIndex: 0,
    isPlaying: false,
    playIntervalId: null,
    showModernStates: false,
    compareMode: false,
    isDrawerOpen: false,
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    selectedTerritory: null,
    isTourMode: false
  };

  // DOM Elements
  const mapSvg = document.getElementById('map-svg');
  const mapG = document.getElementById('map-viewport-group');
  const territoryLayer = document.getElementById('territory-layer');
  const stateLayer = document.getElementById('state-layer');
  const slider = document.getElementById('timeline-slider');
  const playBtn = document.getElementById('play-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const currentYearDisplay = document.getElementById('current-year-display');
  const currentEventTitle = document.getElementById('current-event-title');
  const modernStatesToggle = document.getElementById('toggle-modern-states');
  const compareModeToggle = document.getElementById('toggle-compare-mode');
  const tourBtn = document.getElementById('tour-btn');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const zoomResetBtn = document.getElementById('zoom-reset-btn');
  const shareBtn = document.getElementById('share-btn');
  const detailPanel = document.getElementById('detail-panel');
  const closePanelBtn = document.getElementById('close-panel-btn');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const toastNotice = document.getElementById('toast-notice');

  // Detail panel elements
  const panelPlateTag = document.getElementById('panel-plate-tag');
  const panelTitle = document.getElementById('panel-title');
  const panelDateBadge = document.getElementById('panel-date-badge');
  const panelTypeBadge = document.getElementById('panel-type-badge');
  const panelSummary = document.getElementById('panel-summary');
  const panelNarrative = document.getElementById('panel-narrative');
  const panelIndigenous = document.getElementById('panel-indigenous');
  const panelBoundaries = document.getElementById('panel-boundaries');
  const panelStatesList = document.getElementById('panel-states-list');
  const panelCitations = document.getElementById('panel-citations');

  /**
   * Initialize SVG and render static features
   */
  function initMap() {
    renderBasemap();
    renderMapDecorations();
    renderStateBoundaries();
    parseUrlState();
    updateView();
    setupEventListeners();
  }

  /**
   * Render cartographic graticules, frames, neatlines, and inset boxes
   */
  function renderMapDecorations() {
    const decGroup = document.getElementById('decorations-layer');
    if (!decGroup) return;

    // Graticules (Latitude & Longitude grid lines)
    const graticuleLines = [
      // Parallels
      'M 80,180 Q 480,240 880,180',
      'M 60,280 Q 480,340 900,280',
      'M 50,380 Q 480,440 910,380',
      // Meridians
      'M 240,80 Q 220,300 240,500',
      'M 400,80 Q 390,300 400,500',
      'M 560,80 Q 570,300 580,500',
      'M 720,80 Q 750,300 770,500'
    ];

    graticuleLines.forEach(d => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'map-graticule');
      decGroup.appendChild(path);
    });

    // Outer double border neatline
    const outerBorder = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    outerBorder.setAttribute('x', '6');
    outerBorder.setAttribute('y', '6');
    outerBorder.setAttribute('width', '948');
    outerBorder.setAttribute('height', '588');
    outerBorder.setAttribute('fill', 'none');
    outerBorder.setAttribute('stroke', '#8C8270');
    outerBorder.setAttribute('stroke-width', '1.5');
    decGroup.appendChild(outerBorder);

    const innerBorder = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    innerBorder.setAttribute('x', '10');
    innerBorder.setAttribute('y', '10');
    innerBorder.setAttribute('width', '940');
    innerBorder.setAttribute('height', '580');
    innerBorder.setAttribute('fill', 'none');
    innerBorder.setAttribute('stroke', '#D8CFBE');
    innerBorder.setAttribute('stroke-width', '0.8');
    decGroup.appendChild(innerBorder);

    // Inset 1: Alaska Frame (x: 20, y: 440, w: 210, h: 140)
    const akRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    akRect.setAttribute('x', '20');
    akRect.setAttribute('y', '440');
    akRect.setAttribute('width', '205');
    akRect.setAttribute('height', '140');
    akRect.setAttribute('class', 'inset-frame');
    decGroup.appendChild(akRect);

    const akLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    akLabel.setAttribute('x', '26');
    akLabel.setAttribute('y', '454');
    akLabel.setAttribute('class', 'inset-label');
    akLabel.textContent = 'ALASKA (INSET)';
    decGroup.appendChild(akLabel);

    const akNote = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    akNote.setAttribute('x', '26');
    akNote.setAttribute('y', '574');
    akNote.setAttribute('class', 'inset-note');
    akNote.textContent = 'Scale ~0.35x contiguous US; rotated 25° CCW';
    decGroup.appendChild(akNote);

    // Inset 2: Hawaii Frame (x: 232, y: 490, w: 135, h: 90)
    const hiRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    hiRect.setAttribute('x', '232');
    hiRect.setAttribute('y', '490');
    hiRect.setAttribute('width', '135');
    hiRect.setAttribute('height', '90');
    hiRect.setAttribute('class', 'inset-frame');
    decGroup.appendChild(hiRect);

    const hiLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    hiLabel.setAttribute('x', '238');
    hiLabel.setAttribute('y', '504');
    hiLabel.setAttribute('class', 'inset-label');
    hiLabel.textContent = 'HAWAII (INSET)';
    decGroup.appendChild(hiLabel);

    const hiNote = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    hiNote.setAttribute('x', '238');
    hiNote.setAttribute('y', '574');
    hiNote.setAttribute('class', 'inset-note');
    hiNote.textContent = 'Position adjusted for presentation';
    decGroup.appendChild(hiNote);
  }

  /**
   * Render geographic basemap: neighboring countries and Great Lakes
   * Provides spatial context so territories are recognizable as North America
   */
  function renderBasemap() {
    const basemapLayer = document.getElementById('basemap-layer');
    if (!basemapLayer) return;
    const bm = window.AMERICA_DATA && window.AMERICA_DATA.basemapShapes;
    if (!bm) return;

    const SVG_NS = 'http://www.w3.org/2000/svg';

    // Neighboring countries: Canada, Mexico, Cuba, Bahamas
    ['canada', 'mexico', 'cuba', 'bahamas'].forEach(key => {
      const d = bm[key];
      if (!d) return;
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'basemap-country');
      path.setAttribute('aria-hidden', 'true');
      basemapLayer.appendChild(path);
    });

    // Great Lakes as water bodies
    (bm.greatLakes || []).forEach(lake => {
      if (!lake.path) return;
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', lake.path);
      path.setAttribute('class', 'basemap-water');
      path.setAttribute('aria-hidden', 'true');
      basemapLayer.appendChild(path);
    });
  }

  /**
   * Render modern 50 state boundaries overlay
   */
  function renderStateBoundaries() {
    stateLayer.innerHTML = '';
    stateShapes.forEach(st => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', st.path);
      path.setAttribute('class', 'state-overlay-path');
      path.setAttribute('id', `state-bound-${st.id}`);
      stateLayer.appendChild(path);

      // Add state postal abbreviation label if centroid is valid
      if (st.centroid && st.centroid[0] > 0 && st.centroid[1] > 0) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', st.centroid[0]);
        text.setAttribute('y', st.centroid[1]);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('fill', '#6E6759');
        text.setAttribute('font-size', '8px');
        text.setAttribute('font-family', 'sans-serif');
        text.setAttribute('font-weight', '600');
        text.setAttribute('opacity', '0.85');
        text.setAttribute('pointer-events', 'none');
        text.textContent = st.id;
        stateLayer.appendChild(text);
      }
    });
  }

  /**
   * Render dynamic territory polygons for the current historical node
   */
  function renderTerritories() {
    territoryLayer.innerHTML = '';
    const node = timelineNodes[state.currentNodeIndex];
    if (!node) return;

    const is1776 = node.id === '1776-declaration-of-independence';

    if (is1776) {
      // For 1776, render the 13 original states
      stateShapes.forEach(st => {
        if (THIRTEEN_STATES_IDS.includes(st.id)) {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', st.path);
          path.setAttribute('class', 'territory-path is-active-step');
          path.setAttribute('fill', '#26384C');
          path.setAttribute('data-name', `${st.name} (One of the Thirteen Original States, 1776)`);
          attachTerritoryEvents(path, {
            name: `${st.name} · Original State`,
            notes: 'Claimed sovereignty under the 1776 Declaration of Independence, with charter claims extending westward.'
          });
          territoryLayer.appendChild(path);
        }
      });
      return;
    }

    // Standard territory shapes for subsequent historical nodes
    const activeIds = node.activeShapes;
    const newlyIds = node.newlyAcquiredShapes;

    territoryShapes.forEach(shape => {
      if (!activeIds.includes(shape.objectId)) return;

      const isNewAcquisition = newlyIds.includes(shape.objectId);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', shape.path);
      path.setAttribute('data-oid', shape.objectId);
      path.setAttribute('data-name', shape.name);

      let fillColor = COLOR_PALETTE[shape.objectId] || '#8E6D38';

      // Contrast / Compare Mode styling
      if (state.compareMode) {
        if (isNewAcquisition) {
          fillColor = '#8B3829'; // Vibrant terracotta for newly added land
          path.setAttribute('class', 'territory-path is-new-acquisition is-active-step');
        } else {
          fillColor = '#C8BEAE'; // Muted antique paper stone for previous land
          path.setAttribute('class', 'territory-path');
        }
      } else {
        path.setAttribute('class', isNewAcquisition ? 'territory-path is-active-step' : 'territory-path');
      }

      path.setAttribute('fill', fillColor);
      attachTerritoryEvents(path, shape);
      territoryLayer.appendChild(path);
    });
  }

  /**
   * Attach tooltip and click handlers to territory polygons
   */
  function attachTerritoryEvents(pathEl, shape) {
    pathEl.addEventListener('click', (e) => {
      e.stopPropagation();
      state.selectedTerritory = shape;
      openDetailPanel();
    });

    pathEl.addEventListener('mouseenter', () => {
      pathEl.classList.add('is-hovered');
    });

    pathEl.addEventListener('mouseleave', () => {
      pathEl.classList.remove('is-hovered');
    });
  }

  /**
   * Update the UI view based on current state
   */
  function updateView() {
    const node = timelineNodes[state.currentNodeIndex];
    if (!node) return;

    // 1. Update timeline controls
    slider.value = state.currentNodeIndex;
    currentYearDisplay.textContent = node.year;
    currentEventTitle.textContent = `${node.year} · ${node.title}`;

    // 2. Render territory paths
    renderTerritories();

    // 3. Update modern states overlay visibility
    stateLayer.style.display = state.showModernStates ? 'inline' : 'none';
    modernStatesToggle.classList.toggle('is-active', state.showModernStates);
    modernStatesToggle.setAttribute('aria-pressed', state.showModernStates);

    // 4. Update compare mode button
    compareModeToggle.classList.toggle('is-active', state.compareMode);
    compareModeToggle.setAttribute('aria-pressed', state.compareMode);

    // 5. Update Detail Panel contents
    panelPlateTag.textContent = node.latinPlate;
    panelTitle.textContent = node.title;
    panelDateBadge.textContent = node.exactDate;
    panelTypeBadge.textContent = node.category;
    panelSummary.textContent = node.shortSummary;
    panelNarrative.textContent = node.historicalNarrative;
    panelIndigenous.textContent = node.indigenousContext;
    panelBoundaries.textContent = node.boundariesAndPrecision;

    // States list
    panelStatesList.innerHTML = '';
    node.modernStatesCovered.forEach(st => {
      const span = document.createElement('span');
      span.className = 'badge';
      span.textContent = st;
      panelStatesList.appendChild(span);
    });

    // Citations list
    panelCitations.innerHTML = '';
    node.citations.forEach(cit => {
      const li = document.createElement('li');
      li.textContent = cit;
      panelCitations.appendChild(li);
    });

    // 6. Camera smooth navigation in tour mode
    if (state.isTourMode && node.focusView) {
      centerCameraOn(node.focusView.x, node.focusView.y, node.focusView.zoom);
    }

    // 7. Sync URL parameters
    syncUrlState();
  }

  /**
   * Adjust camera / zoom / pan
   */
  function applyTransform() {
    const cx = 480;
    const cy = 300;
    mapG.setAttribute(
      'transform',
      `translate(${state.pan.x}, ${state.pan.y}) translate(${cx}, ${cy}) scale(${state.zoom}) translate(${-cx}, ${-cy})`
    );
  }

  function centerCameraOn(x, y, zoom) {
    state.zoom = zoom || 1.2;
    state.pan.x = (480 - x) * 0.8;
    state.pan.y = (300 - y) * 0.8;
    applyTransform();
  }

  function resetCamera() {
    state.zoom = 1.0;
    state.pan = { x: 0, y: 0 };
    applyTransform();
  }

  /**
   * Step navigation
   */
  function goToIndex(idx) {
    if (idx < 0) idx = 0;
    if (idx >= timelineNodes.length) idx = timelineNodes.length - 1;
    state.currentNodeIndex = idx;
    updateView();
  }

  function nextStep() {
    if (state.currentNodeIndex < timelineNodes.length - 1) {
      goToIndex(state.currentNodeIndex + 1);
    } else {
      pausePlayback();
      state.isTourMode = false;
      tourBtn.classList.remove('is-active');
    }
  }

  function prevStep() {
    if (state.currentNodeIndex > 0) {
      goToIndex(state.currentNodeIndex - 1);
    }
  }

  /**
   * Autoplay & Guided Tour
   */
  function togglePlayback() {
    if (state.isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  }

  function startPlayback() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    playBtn.textContent = '⏸ Pause';
    playBtn.setAttribute('aria-label', 'Pause timeline playback');
    state.playIntervalId = setInterval(() => {
      if (state.currentNodeIndex >= timelineNodes.length - 1) {
        goToIndex(0);
      } else {
        nextStep();
      }
    }, 4500);
  }

  function pausePlayback() {
    if (!state.isPlaying) return;
    state.isPlaying = false;
    playBtn.textContent = '▶ Play';
    playBtn.setAttribute('aria-label', 'Play timeline playback');
    if (state.playIntervalId) {
      clearInterval(state.playIntervalId);
      state.playIntervalId = null;
    }
  }

  function toggleGuidedTour() {
    state.isTourMode = !state.isTourMode;
    tourBtn.classList.toggle('is-active', state.isTourMode);
    if (state.isTourMode) {
      openDetailPanel();
      goToIndex(0);
      startPlayback();
      showToast('Guided Tour started: Exploring territorial expansion chronologically');
    } else {
      pausePlayback();
      resetCamera();
      showToast('Guided Tour stopped');
    }
  }

  /**
   * Detail Panel (Drawer) Open / Close
   */
  function openDetailPanel() {
    state.isDrawerOpen = true;
    detailPanel.classList.add('is-open');
    drawerBackdrop.classList.add('is-visible');
  }

  function closeDetailPanel() {
    state.isDrawerOpen = false;
    detailPanel.classList.remove('is-open');
    drawerBackdrop.classList.remove('is-visible');
  }

  /**
   * URL State Synchronization
   */
  function syncUrlState() {
    const node = timelineNodes[state.currentNodeIndex];
    if (!node) return;
    const params = new URLSearchParams(window.location.search);
    params.set('node', node.slug);
    if (state.showModernStates) params.set('states', '1');
    else params.delete('states');
    if (state.compareMode) params.set('compare', '1');
    else params.delete('compare');

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ nodeIndex: state.currentNodeIndex }, '', newUrl);
  }

  function parseUrlState() {
    const params = new URLSearchParams(window.location.search);
    const nodeSlug = params.get('node');
    if (nodeSlug) {
      const idx = timelineNodes.findIndex(n => n.slug === nodeSlug || n.id === nodeSlug);
      if (idx !== -1) {
        state.currentNodeIndex = idx;
      }
    }
    if (params.get('states') === '1') {
      state.showModernStates = true;
    }
    if (params.get('compare') === '1') {
      state.compareMode = true;
    }
  }

  function showToast(msg) {
    if (!toastNotice) return;
    toastNotice.textContent = msg;
    toastNotice.classList.add('is-active');
    setTimeout(() => {
      toastNotice.classList.remove('is-active');
    }, 3200);
  }

  function shareCurrentView() {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard!');
      }).catch(() => {
        showToast(`Current URL: ${url}`);
      });
    } else {
      showToast(`Current URL: ${url}`);
    }
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Timeline slider
    slider.addEventListener('input', (e) => {
      pausePlayback();
      goToIndex(parseInt(e.target.value, 10));
    });

    playBtn.addEventListener('click', togglePlayback);
    prevBtn.addEventListener('click', () => {
      pausePlayback();
      prevStep();
    });
    nextBtn.addEventListener('click', () => {
      pausePlayback();
      nextStep();
    });

    // Toggles
    modernStatesToggle.addEventListener('click', () => {
      state.showModernStates = !state.showModernStates;
      updateView();
    });

    compareModeToggle.addEventListener('click', () => {
      state.compareMode = !state.compareMode;
      updateView();
      if (state.compareMode) {
        showToast('Contrast Mode: Highlighting new land acquisition');
      }
    });

    tourBtn.addEventListener('click', toggleGuidedTour);
    shareBtn.addEventListener('click', shareCurrentView);

    // Zoom & Pan buttons
    zoomInBtn.addEventListener('click', () => {
      state.zoom = Math.min(state.zoom + 0.25, 3.0);
      applyTransform();
    });

    zoomOutBtn.addEventListener('click', () => {
      state.zoom = Math.max(state.zoom - 0.25, 0.75);
      applyTransform();
    });

    zoomResetBtn.addEventListener('click', resetCamera);

    // Detail Panel drawer
    closePanelBtn.addEventListener('click', closeDetailPanel);
    drawerBackdrop.addEventListener('click', closeDetailPanel);
    const mobileDetailBtn = document.getElementById('mobile-detail-btn');
    if (mobileDetailBtn) {
      mobileDetailBtn.addEventListener('click', openDetailPanel);
    }

    // Map Drag / Pan gestures
    const container = document.getElementById('map-canvas-container');

    container.addEventListener('mousedown', (e) => {
      if (e.target.closest('button') || e.target.closest('.map-floating-controls')) return;
      state.isDragging = true;
      state.dragStart = { x: e.clientX - state.pan.x, y: e.clientY - state.pan.y };
      container.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!state.isDragging) return;
      state.pan.x = e.clientX - state.dragStart.x;
      state.pan.y = e.clientY - state.dragStart.y;
      applyTransform();
    });

    window.addEventListener('mouseup', () => {
      state.isDragging = false;
      container.style.cursor = 'grab';
    });

    // Touch pan gestures for mobile (preventing scrolling conflicts)
    let touchStartX = 0;
    let touchStartY = 0;

    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX - state.pan.x;
        touchStartY = e.touches[0].clientY - state.pan.y;
      }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        state.pan.x = e.touches[0].clientX - touchStartX;
        state.pan.y = e.touches[0].clientY - touchStartY;
        applyTransform();
      }
    }, { passive: true });

    // Wheel zoom
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      state.zoom = Math.min(Math.max(0.75, state.zoom + delta), 3.0);
      applyTransform();
    }, { passive: false });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevStep();
      } else if (e.key === 'ArrowRight') {
        nextStep();
      } else if (e.key === ' ' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlayback();
      } else if (e.key === 'Escape') {
        closeDetailPanel();
      }
    });

    // Browser back/forward navigation
    window.addEventListener('popstate', (e) => {
      parseUrlState();
      updateView();
    });
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }
})();

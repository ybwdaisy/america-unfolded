import { productionOrigin, analyticsEvents } from './analytics-contract.mjs';
import { events } from './data/events.mjs';
const allowed = new Set(analyticsEvents);
const chapters = new Set(events.map((e) => e.id));
const params = new URLSearchParams(location.search);
const key = 'america-unfolded:usa.ybwdaisy.com:';
const consentKey = key + 'analytics-consent-v1';
const qaKey = key + 'qa-v1';
let storageReady = true;
let persistent, session;
try {
  persistent = window.localStorage;
  session = window.sessionStorage;
} catch {
  storageReady = false;
}
function get(store, name) {
  try {
    return store.getItem(name);
  } catch {
    storageReady = false;
    return null;
  }
}
function put(store, name, value) {
  try {
    store.setItem(name, value);
  } catch {
    storageReady = false;
  }
}
let qa = get(persistent, qaKey) === '1' || get(session, qaKey) === '1';
if (params.get('analytics_test') === '0' && !navigator.webdriver) {
  qa = false;
  put(persistent, qaKey, '0');
  put(session, qaKey, '0');
}
if (navigator.webdriver || params.get('analytics_test') === '1' || params.get('qa') === '1') {
  qa = true;
  put(persistent, qaKey, '1');
  put(session, qaKey, '1');
}
const config = document.querySelector('meta[name="america-analytics"]');
const id = config?.content || '';
const eligible =
  location.origin === productionOrigin &&
  config?.dataset.environment === 'production' &&
  /^G-[A-Z0-9]+$/.test(id) &&
  storageReady &&
  !qa;
let consent = get(persistent, consentKey);
let started = false;
let pageSent = false;
const panel = document.querySelector('#analytics-consent');
const settings = document.querySelector('#analytics-settings');
function pagePath() {
  return document.querySelector('meta[name="america-page"]')?.content || '/404/';
}
function referrer() {
  try {
    const u = new URL(document.referrer);
    return u.origin === productionOrigin ? '' : u.origin + '/';
  } catch {
    return '';
  }
}
function gtag() {
  window.dataLayer.push(arguments);
}
function start() {
  if (!eligible || !storageReady || consent !== 'granted') return;
  window['ga-disable-' + id] = false;
  if (!started) {
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = gtag;
    const defaults = {
      send_page_view: false,
      page_location: productionOrigin + pagePath(),
      page_referrer: referrer(),
      page_title: document.title,
      cookie_domain: 'usa.ybwdaisy.com',
      cookie_prefix: 'au',
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    };
    gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    gtag('set', defaults);
    gtag('js', new Date());
    gtag('config', id, defaults);
    const script = document.createElement('script');
    script.id = 'america-google-tag';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(script);
  }
  if (!pageSent) {
    pageSent = true;
    gtag('event', 'page_view', common());
  }
}
function common() {
  return {
    send_to: id,
    content_group: 'america_unfolded_public',
    tool_id: 'america_unfolded',
    analytics_version: '1',
    page_location: productionOrigin + pagePath(),
    page_referrer: referrer(),
    page_title: document.title,
  };
}
export function track(name, values = {}) {
  if (!eligible || !storageReady || consent !== 'granted' || !allowed.has(name)) return;
  start();
  const safe = common();
  if (chapters.has(values.chapter_id)) safe.chapter_id = values.chapter_id;
  if (Number.isInteger(values.year) && values.year >= 1776 && values.year <= 1959)
    safe.year = values.year;
  if (['before', 'after'].includes(values.phase)) safe.phase = values.phase;
  if (['timeline', 'map', 'chapter', 'compare', 'play'].includes(values.method))
    safe.method = values.method;
  if (['region', 'chapter'].includes(values.detail_type)) safe.detail_type = values.detail_type;
  gtag('event', name, safe);
  return true;
}
let explored = false;
export function explore(method) {
  if (!explored) explored = !!track('map_explore_start', { method });
}
function choose(value) {
  consent = value;
  put(persistent, consentKey, value);
  panel.hidden = true;
  if (value === 'granted') start();
  else {
    window['ga-disable-' + id] = true;
    document.querySelector('#america-google-tag')?.remove();
    for (const part of document.cookie.split(';')) {
      const name = part.split('=')[0].trim();
      if (/^_?au_/.test(name))
        document.cookie = `${name}=; Max-Age=0; path=/; domain=usa.ybwdaisy.com; SameSite=Lax; Secure`;
    }
  }
}
if (eligible) {
  settings.hidden = false;
  settings.onclick = () => {
    panel.hidden = false;
    panel.scrollIntoView({ block: 'center' });
    panel.querySelector('button').focus();
  };
  panel
    .querySelectorAll('[data-analytics-consent]')
    .forEach((button) => (button.onclick = () => choose(button.dataset.analyticsConsent)));
  panel.hidden = !!consent;
  start();
}
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;
  const inDetails = link.closest('#chapter-content,.reading-page');
  if (inDetails && link.origin !== location.origin && link.protocol === 'https:')
    track('map_source_open');
});

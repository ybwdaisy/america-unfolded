import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { analyticsEvents } from '../src/analytics-contract.mjs';
const origin = 'https://usa.ybwdaisy.com';
const id = 'G-G1BH7EZXL9'; // Real, independently created web stream; collection always blocked here.
const results = [];
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CI ? {} : { channel: 'chrome' }),
  ...(process.env.REAL_SDK ? { proxy: { server: 'http://127.0.0.1:7897' } } : {}),
});
const mock = `window.__commands=window.dataLayer.map(a=>Array.from(a));const old=window.dataLayer.push.bind(window.dataLayer);window.dataLayer.push=(...entries)=>{window.__commands.push(...entries.map(a=>Array.from(a)));return old(...entries)};`;
const mime = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.html': 'text/html',
};
async function fixture({
  host = origin,
  human = true,
  qa = false,
  consent = false,
  production = true,
} = {}) {
  const c = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const sdk = [],
    packets = [],
    errors = [];
  await c.addInitScript(
    ({ human, qa, consent }) => {
      // A LOCAL fixture simulates a non-automated visitor to test the positive branch.
      if (human) Object.defineProperty(navigator, 'webdriver', { get: () => false });
      if (qa) localStorage.setItem('america-unfolded:usa.ybwdaisy.com:qa-v1', '1');
      if (consent)
        localStorage.setItem('america-unfolded:usa.ybwdaisy.com:analytics-consent-v1', 'granted');
    },
    { human, qa, consent },
  );
  // Block all transport before navigation, including SDK batch, beacon and unload requests.
  await c.route('**/*', async (route) => {
    const request = route.request(),
      u = new URL(request.url());
    if (/google-analytics\.com|googleadservices\.com|doubleclick\.net/.test(u.hostname)) {
      packets.push({ url: u.href, data: request.postData() });
      return route.fulfill({ status: 204, body: '' });
    }
    if (/googletagmanager\.com/.test(u.hostname)) {
      sdk.push(u.href);
      return process.env.REAL_SDK
        ? route.continue()
        : route.fulfill({ status: 200, contentType: 'text/javascript', body: mock });
    }
    if (u.origin !== host) return route.abort();
    let name = path.join('dist', u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname);
    let data,
      status = 200;
    try {
      data = await fs.readFile(name);
    } catch {
      name = 'dist/404.html';
      data = await fs.readFile(name);
      status = 404;
    }
    if (name.endsWith('.html'))
      data = Buffer.from(
        data
          .toString()
          .replace(
            /<meta name="america-analytics"[^>]*>/,
            `<meta name="america-analytics" content="${id}" data-environment="${production ? 'production' : 'preview'}">`,
          ),
      );
    return route.fulfill({
      status,
      contentType: mime[path.extname(name)] || 'application/octet-stream',
      body: data,
    });
  });
  const p = await c.newPage();
  p.on('pageerror', (e) => errors.push(e.message));
  return { c, p, sdk, packets, errors, host };
}
async function ready(p) {
  await p.waitForFunction(
    () => document.querySelector('#map-stage')?.getAttribute('aria-busy') === 'false',
  );
}
async function commands(p) {
  return p.evaluate(() => window.__commands || []);
}
async function events(p) {
  return (await commands(p)).filter((x) => x[0] === 'event');
}
async function check(name, run) {
  try {
    await run();
    results.push({ name, result: 'pass' });
    console.log('PASS', name);
  } catch (e) {
    results.push({ name, result: 'fail', error: e.message });
    console.error('FAIL', name, e.message);
  }
}
if (process.env.REAL_SDK) {
  await check(
    'actual Google SDK: query-free packets, single page view and consent withdrawal; collection intercepted',
    async () => {
      const f = await fixture();
      await f.p.goto(origin + '/?private=do-not-upload');
      await ready(f.p);
      assert.equal(f.sdk.length, 0);
      assert.equal(f.packets.length, 0);
      await f.p.locator('[data-analytics-consent=granted]').click();
      await f.p.waitForFunction(() => !!window.google_tag_manager, null, { timeout: 25000 });
      await f.p.locator('#next').click();
      await ready(f.p);
      await f.p.waitForTimeout(6500);
      const parsed = f.packets.flatMap((packet) => {
        const u = new URL(packet.url),
          rows = packet.data?.split(/\r?\n/).filter(Boolean) || [''];
        return rows.map((row) =>
          Object.fromEntries([...u.searchParams, ...new URLSearchParams(row)]),
        );
      });
      assert.equal(parsed.filter((e) => e.en === 'page_view').length, 1);
      assert.ok(
        parsed.some((e) => e.en === 'map_year_select'),
        JSON.stringify(parsed.map((e) => ({ name: e.en, keys: Object.keys(e) }))),
      );
      assert.ok(parsed.every((e) => !e.dl || !/[?#]/.test(e.dl)));
      assert.ok(!JSON.stringify(parsed).includes('do-not-upload'));
      assert.ok(parsed.filter((e) => e.en).every((e) => e.tid === id));
      await f.p.locator('#analytics-settings').click();
      await f.p.locator('[data-analytics-consent=denied]').click();
      const count = f.packets.length;
      await f.p.locator('#next').click();
      await ready(f.p);
      await f.p.waitForTimeout(1800);
      assert.equal(f.packets.length, count);
      assert.deepEqual(f.errors, []);
      await fs.writeFile(
        'docs/evidence/analytics-real-sdk.json',
        JSON.stringify(
          {
            collectionBlocked: true,
            ingestionVerified: false,
            sdk: f.sdk,
            eventNames: parsed.map((e) => e.en).filter(Boolean),
            locations: [...new Set(parsed.map((e) => e.dl).filter(Boolean))],
          },
          null,
          2,
        ),
      );
      await f.c.close();
    },
  );
} else {
  for (const [name, options, query] of [
    ['localhost never collects', { host: 'http://localhost:4173', consent: true }, ''],
    [
      'preview hostname never collects',
      { host: 'https://america-preview.vercel.app', consent: true },
      '',
    ],
    ['preview configuration never collects', { production: false, consent: true }, ''],
    [
      'webdriver cannot be opted into collection',
      { human: false, consent: true },
      '?analytics_test=0',
    ],
    ['explicit QA never collects', { consent: true }, '?analytics_test=1'],
    ['short QA marker never collects', { consent: true }, '?qa=1'],
    ['stored QA never collects', { qa: true, consent: true }, ''],
  ])
    await check(name, async () => {
      const f = await fixture(options);
      await f.p.goto(f.host + '/' + query);
      await ready(f.p);
      await f.p.locator('#next').click();
      await ready(f.p);
      await f.p.reload();
      await ready(f.p);
      assert.equal(f.sdk.length, 0);
      assert.equal(f.packets.length, 0);
      assert.deepEqual(f.errors, []);
      await f.c.close();
    });
  await check(
    'consent required; denied state survives navigation; permission queues exactly one safe page view',
    async () => {
      const f = await fixture();
      await f.p.goto(origin + '/?private=never-send');
      await ready(f.p);
      assert.equal(f.sdk.length, 0);
      await f.p.locator('[data-analytics-consent=denied]').click();
      await f.p.reload();
      await ready(f.p);
      assert.equal(f.sdk.length, 0);
      await f.p.locator('#analytics-settings').click();
      await f.p.locator('[data-analytics-consent=granted]').click();
      await f.p.waitForFunction(() => !!window.__commands);
      const list = await events(f.p);
      assert.equal(list.filter((e) => e[1] === 'page_view').length, 1);
      assert.equal(list[0][2].page_location, origin + '/');
      assert.ok(!JSON.stringify(await commands(f.p)).includes('never-send'));
      const config = (await commands(f.p)).find((e) => e[0] === 'config')[2];
      assert.equal(config.cookie_domain, 'usa.ybwdaisy.com');
      assert.equal(config.send_page_view, false);
      assert.equal(config.allow_google_signals, false);
      assert.equal(config.allow_ad_personalization_signals, false);
      await f.c.close();
    },
  );
  await check('map research, compare and successful share have real, ordered events', async () => {
    const f = await fixture({ consent: true });
    await f.p.goto(origin + '/events/louisiana-purchase/');
    await ready(f.p);
    await f.p.locator('.region[aria-label^="Louisiana Purchase,"]').click();
    await f.p
      .locator('#chapter-content a[href^="https:"]')
      .first()
      .click({ modifiers: [process.platform === 'darwin' ? 'Meta' : 'Control'] });
    await f.p.bringToFront();
    await f.p.locator('#compare').check();
    await f.p.locator('[data-phase=before]').click();
    await f.p.locator('[data-phase=after]').click();
    await f.p.locator('#share').click();
    await f.p.waitForFunction(
      () => document.querySelector('#share span').textContent === 'Link copied',
    );
    const list = await events(f.p),
      names = list.map((e) => e[1]);
    for (const name of [
      'map_explore_start',
      'map_region_select',
      'map_detail_view',
      'map_source_open',
      'map_compare_open',
      'map_compare_change',
      'map_share_success',
    ])
      assert.ok(names.includes(name), name);
    assert.equal(names.filter((e) => e === 'map_explore_start').length, 1);
    assert.ok(names.indexOf('map_region_select') < names.indexOf('map_detail_view'));
    await f.p.evaluate(() => {
      navigator.clipboard.writeText = async () => {
        throw Error('Clipboard denied');
      };
    });
    await f.p.locator('#share').click();
    assert.equal((await events(f.p)).filter((e) => e[1] === 'map_share_success').length, 1);
    assert.equal(await f.p.locator('#share-fallback').isVisible(), true);
    assert.ok(list.every((e) => !/[?#]/.test(e[2].page_location)));
    assert.deepEqual(f.errors, []);
    await f.c.close();
  });
  await check('complete guided story emits each step once and completion once', async () => {
    const f = await fixture({ consent: true });
    await f.p.goto(origin + '/');
    await ready(f.p);
    await f.p.locator('#start-story').click();
    await ready(f.p);
    for (let i = 0; i < 9; i++) {
      await f.p.locator('#story-next').click();
      await ready(f.p);
    }
    let list = await events(f.p);
    assert.equal(list.filter((e) => e[1] === 'story_start').length, 1);
    assert.equal(list.filter((e) => e[1] === 'story_step_view').length, 10);
    assert.equal(list.filter((e) => e[1] === 'story_complete').length, 1);
    await f.p.locator('#story-next').click();
    list = await events(f.p);
    assert.equal(list.filter((e) => e[1] === 'story_complete').length, 1);
    assert.deepEqual(f.errors, []);
    await f.c.close();
  });
  await check(
    'playback frames do not emit year-selection events; withdrawal stops all events',
    async () => {
      const f = await fixture({ consent: true });
      await f.p.goto(origin + '/?date=1805-12-31&event=louisiana-purchase');
      await ready(f.p);
      await f.p.clock.install();
      await f.p.locator('#play').click();
      await f.p.clock.runFor(1000);
      await ready(f.p);
      await f.p.locator('#play').click();
      let list = await events(f.p);
      assert.ok(list.some((e) => e[1] === 'map_play_start'));
      assert.ok(!list.some((e) => e[1] === 'map_year_select'));
      await f.p.locator('#analytics-settings').click();
      await f.p.locator('[data-analytics-consent=denied]').click();
      const count = list.length;
      await f.p.locator('#next').click();
      await ready(f.p);
      assert.equal((await events(f.p)).length, count);
      assert.equal(await f.p.locator('#america-google-tag').count(), 0);
      assert.equal(await f.p.evaluate((id) => window['ga-disable-' + id], id), true);
      assert.deepEqual(f.errors, []);
      await f.c.close();
    },
  );
  await check(
    'unknown events and unapproved values cannot enter the analytics contract',
    async () => {
      const f = await fixture({ consent: true });
      await f.p.goto(origin + '/privacy/');
      await f.p.waitForFunction(() => !!window.__commands);
      await f.p.evaluate(async () => {
        const { track } = await import('/assets/analytics.js');
        track('made_up_event');
        track('map_year_select', {
          year: 9999,
          chapter_id: 'private-person@example.com',
          phase: 'bad',
          coordinate: 'private',
        });
      });
      const list = await events(f.p);
      assert.ok(list.every((e) => e[1] === 'page_view' || analyticsEvents.includes(e[1])));
      assert.ok(!JSON.stringify(list).includes('private-person'));
      assert.ok(!JSON.stringify(list).includes('9999'));
      assert.deepEqual(f.errors, []);
      await f.c.close();
    },
  );
}
await browser.close();
await fs.mkdir('docs/evidence', { recursive: true });
await fs.writeFile(
  'docs/evidence/analytics-results.json',
  JSON.stringify(
    {
      kind: process.env.REAL_SDK
        ? 'Real SDK with collection blocked'
        : 'Offline SDK stub and local-origin fixture',
      collectionBlocked: true,
      ingestionVerified: false,
      results,
    },
    null,
    2,
  ),
);
if (results.some((e) => e.result === 'fail')) process.exitCode = 1;

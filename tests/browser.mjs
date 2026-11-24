import { chromium, webkit, devices } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.BASE_URL || 'http://localhost:4173';
const results = [];
const evidence = 'docs/evidence';
await fs.mkdir(evidence, { recursive: true });
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, result: 'pass' });
    console.log('PASS', name);
  } catch (e) {
    results.push({ name, result: 'fail', error: e.message });
    console.error('FAIL', name, e.message);
  }
}
async function ready(p) {
  await p.waitForFunction(
    () => document.querySelector('#map-stage')?.getAttribute('aria-busy') === 'false',
  );
  assert.equal(await p.locator('#map-status').isVisible(), false);
}
const b = await chromium.launch({ channel: 'chrome', headless: true });
const context = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(base);
await ready(page);
await check('initial dated map and chapter agree', async () => {
  assert.match(await page.locator('#snapshot-label').innerText(), /Apr 30, 1803/);
  assert.equal(await page.locator('.historic-regions path').count(), 22);
  assert.match(await page.locator('#chapter-content h2').innerText(), /Louisiana/);
});
await check('node controls and before/after comparison', async () => {
  await page.locator('#next').click();
  await ready(page);
  assert.equal(await page.locator('#current-year').innerText(), '1818');
  await page.locator('#compare').check();
  assert.equal((await page.locator('.region.changed').count()) > 0, true);
  await page.locator('[data-phase=before]').click();
  assert.equal(await page.locator('[data-phase=before]').getAttribute('aria-pressed'), 'true');
  await page.locator('[data-phase=after]').click();
  await page.locator('#modern').check();
  assert.equal(await page.locator('.modern-lines path').count(), 51);
});
await check('region keyboard selection, close and reopen', async () => {
  const region = page.locator('.region[aria-label^="Missouri Territory"]').first();
  await region.focus();
  await page.keyboard.press('Enter');
  assert.match(await page.locator('#chapter-content h2').innerText(), /Missouri/);
  assert.match(new URL(page.url()).searchParams.get('region'), /\d+/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#chapter').isVisible(), false);
  await page.locator('#open-details').click();
  assert.equal(await page.locator('#chapter').isVisible(), true);
});
await check('zoom, pan, reset and URL restoration', async () => {
  await page.locator('#zoom-in').click();
  const k = new URL(page.url()).searchParams.get('k');
  assert.ok(Number(k) > 1);
  await page.locator('#history-map').focus();
  await page.keyboard.press('ArrowRight');
  const saved = page.url();
  await page.reload();
  await ready(page);
  assert.equal(page.url(), saved);
  assert.equal(await page.locator('#modern').isChecked(), true);
  await page.locator('#reset-view').click();
  assert.equal(new URL(page.url()).searchParams.has('k'), false);
});
await check('browser back and forward restore event and state', async () => {
  await page.locator('#next').click();
  await ready(page);
  const next = page.url();
  await page.locator('#next').click();
  await ready(page);
  await page.goBack();
  await ready(page);
  assert.equal(page.url(), next);
  assert.equal(await page.locator('#current-year').innerText(), '1819');
  await page.goForward();
  await ready(page);
  assert.equal(await page.locator('#current-year').innerText(), '1845');
});
await check('year slider uses most recent dated snapshot and survives reload', async () => {
  await page.locator('#year-range').fill('1805');
  await page.locator('#year-range').dispatchEvent('change');
  await ready(page);
  assert.match(await page.locator('#snapshot-label').innerText(), /Jul 4, 1805/);
  const u = page.url();
  assert.equal(new URL(u).searchParams.get('date'), '1805-12-31');
  await page.reload();
  await ready(page);
  assert.equal(await page.locator('#current-year').innerText(), '1805');
});
await check('share copies a restorable URL', async () => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.locator('#share').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  assert.equal(text, page.url());
  const p = await context.newPage();
  await p.goto(text);
  await ready(p);
  assert.equal(await p.locator('#current-year').innerText(), '1805');
  await p.close();
});
await check('playback advances and pause stops it', async () => {
  await page.locator('#play').click();
  assert.equal(await page.locator('#play').getAttribute('aria-label'), 'Pause timeline');
  await page.waitForTimeout(4700);
  await ready(page);
  assert.equal(await page.locator('#current-year').innerText(), '1818');
  await page.locator('#play').click();
  const date = await page.locator('#current-year').innerText();
  await page.waitForTimeout(4700);
  assert.equal(await page.locator('#current-year').innerText(), date);
});
await check('guided story changes chapter and map focus', async () => {
  await page.locator('#start-story').click();
  await ready(page);
  assert.equal(await page.locator('#story-bar').isVisible(), true);
  assert.match(await page.locator('#chapter-content h2').innerText(), /Mississippi/);
  await page.locator('#story-next').click();
  await ready(page);
  assert.match(await page.locator('#chapter-content h2').innerText(), /Louisiana/);
  assert.ok(Number(new URL(page.url()).searchParams.get('k')) > 1);
  await page.locator('#end-story').click();
  assert.equal(await page.locator('#story-bar').isVisible(), false);
});
await check('1776 has no invented historical boundary', async () => {
  await page.locator('[data-event=independence]').click();
  await ready(page);
  assert.equal(await page.locator('.historic-regions path').count(), 0);
  assert.match(
    await page.locator('#snapshot-label').innerText(),
    /No historical boundary snapshot/,
  );
});
await check('late snapshots include Alaska and Hawaiʻi as states', async () => {
  await page.locator('[data-event=hawaii-statehood]').click();
  await ready(page);
  assert.equal(await page.locator('.region[aria-label^="Alaska, State"]').count(), 1);
  assert.equal(await page.locator('.region[aria-label^="Hawaii, State"]').count(), 1);
  await page.screenshot({ path: `${evidence}/desktop-1959.png` });
});
await check('before-map records open from the displayed snapshot', async () => {
  await page.goto(base + '/?date=1959-01-03&event=alaska-statehood&compare=1&phase=before');
  await ready(page);
  const territory = page.locator('.region[aria-label^="Alaska Territory"]').first();
  await territory.focus();
  await page.keyboard.press('Enter');
  assert.match(await page.locator('#chapter-content h2').innerText(), /Alaska Territory/);
  await page.reload();
  await ready(page);
  assert.match(await page.locator('#chapter-content h2').innerText(), /Alaska Territory/);
});
await check('before-map hatching uses the earlier snapshot date', async () => {
  await page.goto(base + '/?date=1867-10-18&event=alaska-purchase&compare=1&phase=before');
  await ready(page);
  assert.equal(
    await page
      .locator('.region[aria-label^="Alaska Department"]')
      .evaluate((e) => e.classList.contains('claim')),
    true,
  );
  await page.locator('[data-phase=after]').click();
  assert.equal(
    await page
      .locator('.region[aria-label^="Alaska Department"]')
      .evaluate((e) => e.classList.contains('claim')),
    false,
  );
});
await page.goto(base);
await ready(page);
await page.screenshot({ path: `${evidence}/desktop.png` });
await check('desktop controls fit 900px viewport and no horizontal overflow', async () => {
  await page.setViewportSize({ width: 1440, height: 900 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  const bounds = await page.locator('.timeline').boundingBox();
  assert.ok(bounds.y + bounds.height <= 900, `timeline bottom ${bounds.y + bounds.height}`);
  await page.screenshot({ path: `${evidence}/desktop-900.png` });
});
await check('missing-data error and retry recover', async () => {
  const p = await context.newPage();
  await p.route('**/data/snapshot-1803-04-30.json', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"type":"FeatureCollection","features":[]}',
    }),
  );
  await p.goto(base);
  await p.locator('#retry-map').waitFor();
  assert.match(await p.locator('#map-status h2').innerText(), /missing/);
  await p.unroute('**/data/snapshot-1803-04-30.json');
  await p.locator('#retry-map').click();
  await ready(p);
  assert.ok((await p.locator('.region').count()) > 0);
  await p.close();
});
await check('modern toggle is safe while map data is loading', async () => {
  const p = await context.newPage();
  const failures = [];
  p.on('pageerror', (e) => failures.push(e.message));
  await p.route('**/data/modern.json', async (r) => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    await r.continue();
  });
  await p.goto(base);
  await p.locator('#modern').check();
  await ready(p);
  assert.equal(await p.locator('.modern-lines path').count(), 51);
  assert.deepEqual(failures, []);
  await p.close();
});
await check('failed network and retry recover', async () => {
  const p = await context.newPage();
  await p.route('**/data/manifest.json', (r) => r.abort());
  await p.goto(base);
  await p.locator('#retry-map').waitFor();
  assert.match(await p.locator('#map-status h2').innerText(), /could not/);
  await p.unroute('**/data/manifest.json');
  await p.locator('#retry-map').click();
  await ready(p);
  await p.close();
});
await check('event pages and sources remain readable without JavaScript', async () => {
  const c = await b.newContext({ javaScriptEnabled: false });
  const p = await c.newPage();
  await p.goto(base + '/events/mexican-cession/');
  assert.match(await p.locator('body').innerText(), /ratifications were exchanged May 30/);
  assert.equal(
    (await p
      .locator('a[href="https://www.archives.gov/milestone-documents/treaty-of-guadalupe-hidalgo"]')
      .count()) > 0,
    true,
  );
  await p.goto(base + '/sources/');
  assert.match(await p.locator('h1').innerText(), /question/);
  await c.close();
});
const mobile = await b.newContext({
  ...devices['iPhone 13'],
  viewport: { width: 390, height: 844 },
});
const m = await mobile.newPage();
await m.goto(base);
await ready(m);
await check('mobile panel opens and closes without covering map or timeline', async () => {
  await m.locator('#read-chapter').click();
  assert.match(await m.locator('#chapter').getAttribute('class'), /expanded/);
  await m.locator('#close-details').click();
  assert.equal(await m.locator('#chapter').isVisible(), false);
  await m.locator('#open-details').click();
  const map = await m.locator('#map-stage').boundingBox(),
    time = await m.locator('.timeline').boundingBox(),
    chapter = await m.locator('#chapter').boundingBox();
  assert.ok(map.y + map.height <= time.y);
  assert.ok(time.y + time.height <= chapter.y);
});
await check('mobile guided story advances without opening full details', async () => {
  await m.locator('#start-story').click();
  await ready(m);
  assert.equal(await m.locator('#story-next-compact').isVisible(), true);
  await m.locator('#story-next-compact').click();
  await ready(m);
  assert.equal(await m.locator('#current-year').innerText(), '1803');
  await m.locator('#end-story').click();
  await m.locator('#read-chapter').click();
  await m.reload();
  await ready(m);
  assert.match(await m.locator('#chapter').getAttribute('class'), /expanded/);
});
await check('touch pan and pinch update map, not page position', async () => {
  await m.evaluate(() => scrollTo(0, 0));
  const session = await mobile.newCDPSession(m);
  const box = await m.locator('#history-map').boundingBox();
  const x = box.x + box.width * 0.65,
    y = box.y + box.height * 0.5;
  const before = await m.evaluate(() => scrollY);
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y, id: 0 }],
  });
  for (let i = 1; i <= 5; i++) {
    await m.waitForTimeout(60);
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x + i * 10, y: y + i * 3, id: 0 }],
    });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await m.waitForTimeout(100);
  assert.equal(await m.evaluate(() => scrollY), before);
  assert.ok(new URL(m.url()).searchParams.has('x'));
  await m.waitForTimeout(600);
  const initialK = Number(new URL(m.url()).searchParams.get('k') || 1);
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: x - 20, y, id: 0 },
      { x: x + 20, y, id: 1 },
    ],
  });
  for (let i = 1; i <= 4; i++) {
    await m.waitForTimeout(60);
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: x - 20 - i * 8, y, id: 0 },
        { x: x + 20 + i * 8, y, id: 1 },
      ],
    });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await m.waitForFunction(
    (k) => Number(new URL(location.href).searchParams.get('k')) > k,
    initialK,
    { timeout: 2500 },
  );
  await m.locator('#reset-view').click();
});
await check('mobile slider does not pan the map', async () => {
  const before = await m.locator('.map-content').getAttribute('transform');
  await m.locator('#year-range').fill('1822');
  await m.locator('#year-range').dispatchEvent('change');
  await ready(m);
  assert.equal(await m.locator('.map-content').getAttribute('transform'), before);
  assert.equal(await m.locator('#current-year').innerText(), '1822');
});
await check('narrow and landscape screens have no horizontal overflow', async () => {
  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [844, 390],
  ]) {
    await m.setViewportSize({ width, height });
    assert.ok(
      await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `${width}px overflow`,
    );
    await m.screenshot({ path: `${evidence}/mobile-${width}.png` });
  }
});
await check('reduced-motion mode has no animated map transitions', async () => {
  await m.emulateMedia({ reducedMotion: 'reduce' });
  await m.locator('#next').click();
  await ready(m);
  assert.equal(
    await m.locator('#history-map').evaluate((e) => getComputedStyle(e).animationName),
    'none',
  );
});
await check('all functional UI has focus indication', async () => {
  await page.locator('#zoom-in').focus();
  const outline = await page.locator('#zoom-in').evaluate((e) => getComputedStyle(e).outlineWidth);
  assert.ok(parseFloat(outline) >= 2);
});
assert.deepEqual(errors, []);
await b.close();
try {
  const wb = await webkit.launch({ headless: true });
  const wc = await wb.newContext({ ...devices['iPhone 13'] });
  const wp = await wc.newPage();
  await wp.goto(base);
  await ready(wp);
  await check('iPhone WebKit: map, timeline, details and history', async () => {
    await wp.locator('#next').click();
    await ready(wp);
    assert.equal(await wp.locator('#current-year').innerText(), '1818');
    await wp.locator('#read-chapter').click();
    await wp.locator('#close-details').click();
    assert.equal(await wp.locator('#chapter').isVisible(), false);
    await wp.goBack();
    await ready(wp);
    await wp.locator('#modern').check();
    assert.equal(await wp.locator('.modern-lines path').count(), 51);
    assert.ok(await wp.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await wp.screenshot({ path: `${evidence}/iphone-webkit.png`, fullPage: false });
  });
  await wb.close();
} catch (e) {
  results.push({ name: 'iPhone WebKit launch', result: 'fail', error: e.message });
  console.error(e.message);
}
await fs.writeFile(
  `${evidence}/browser-results.json`,
  JSON.stringify(
    {
      date: '2026-11-24',
      base,
      browsers: 'Installed Chrome; Playwright WebKit with iPhone emulation (not a physical iPhone)',
      results,
    },
    null,
    2,
  ),
);
if (results.some((x) => x.result === 'fail')) process.exitCode = 1;

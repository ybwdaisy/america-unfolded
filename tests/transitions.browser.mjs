import { chromium, webkit, devices } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.BASE_URL || 'http://localhost:4173';
const results = [];
async function ready(p) {
  await p.waitForFunction(
    () => document.querySelector('#map-stage').getAttribute('aria-busy') === 'false',
  );
}
async function observe(p) {
  await p.evaluate(() => {
    window.transitionFrames = [];
    window.watchTransitions = true;
    function frame() {
      if (!window.watchTransitions) return;
      const root = document.querySelector('.historic-regions');
      const status = document.querySelector('#map-status');
      const stable = root.querySelector('[aria-label^="Pennsylvania,"]');
      window.transitionFrames.push({
        count: root.children.length,
        overlay: !status.hidden,
        stableOpacity: stable ? getComputedStyle(stable).opacity : null,
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}
async function assertContinuous(p) {
  const frames = await p.evaluate(() => {
    window.watchTransitions = false;
    return window.transitionFrames;
  });
  assert.ok(frames.length > 2);
  assert.ok(
    frames.every((f) => f.count > 0 && !f.overlay),
    'No blank map or opaque loader frame',
  );
  assert.ok(
    frames.every((f) => f.stableOpacity === '1'),
    'Unchanged Pennsylvania stays fully opaque',
  );
}
for (const [name, engine, options] of [
  ['Chrome', chromium, { channel: 'chrome' }],
  ['iPhone WebKit', webkit, {}],
]) {
  const browser = await engine.launch({ headless: true, ...options });
  const context = await browser.newContext(
    name.includes('iPhone')
      ? { ...devices['iPhone 13'] }
      : { viewport: { width: 1440, height: 900 } },
  );
  async function check(title, run) {
    const p = await context.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    try {
      await p.goto(base);
      await ready(p);
      await run(p);
      assert.deepEqual(errors, []);
      results.push({ browser: name, test: title, result: 'pass' });
      console.log('PASS', name, title);
    } catch (e) {
      results.push({ browser: name, test: title, result: 'fail', error: e.message });
      console.error('FAIL', name, title, e.message);
    }
    await p.close();
  }
  await check('slow next snapshot keeps the existing map visible', async (p) => {
    await p.route('**/snapshot-1818-10-20.json', async (r) => {
      await new Promise((resolve) => setTimeout(resolve, 450));
      await r.continue();
    });
    await observe(p);
    await p.locator('#next').click();
    assert.equal(await p.locator('#map-status').isVisible(), false);
    assert.equal(await p.locator('.historic-regions path').count(), 22);
    await ready(p);
    await p.waitForTimeout(240);
    await assertContinuous(p);
    assert.equal(await p.locator('#current-year').innerText(), '1818');
    assert.equal(await p.locator('.map-previous').count(), 0);
  });
  await check('slider preserves pan and zoom and never shows a blank frame', async (p) => {
    await p.locator('#zoom-in').click();
    const view = await p.locator('.map-content').getAttribute('transform');
    await observe(p);
    await p.locator('#year-range').fill('1848');
    await p.locator('#year-range').dispatchEvent('change');
    await ready(p);
    await p.waitForTimeout(240);
    await assertContinuous(p);
    assert.equal(await p.locator('.map-content').getAttribute('transform'), view);
    assert.equal(await p.locator('#current-year').innerText(), '1848');
    assert.match(await p.locator('#snapshot-label').innerText(), /Aug 14, 1848/);
  });
  await check('rapid scrubbing commits only the latest request', async (p) => {
    await p.route('**/snapshot-1848-07-04.json', async (r) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await r.continue();
    });
    await p.locator('#year-range').fill('1848');
    await p.locator('#year-range').dispatchEvent('change');
    await p.waitForTimeout(40);
    await p.locator('#year-range').fill('1959');
    await p.locator('#year-range').dispatchEvent('change');
    await ready(p);
    await p.waitForTimeout(750);
    assert.equal(await p.locator('#current-year').innerText(), '1959');
    assert.equal(new URL(p.url()).searchParams.get('date'), '1959-08-21');
    assert.equal(await p.locator('.region[aria-label^="Hawaii, State"]').count(), 1);
    assert.equal(await p.locator('.map-previous').count(), 0);
  });
  await check('reduced motion skips snapshot fades', async (p) => {
    await p.emulateMedia({ reducedMotion: 'reduce' });
    await p.locator('#next').click();
    await ready(p);
    assert.equal(await p.locator('.map-previous').count(), 0);
    assert.equal(
      await p.locator('#history-map').evaluate((e) => e.getAnimations({ subtree: true }).length),
      0,
    );
  });
  await check('failed next snapshot retains a truthful old view and retries', async (p) => {
    await p.route('**/snapshot-1818-10-20.json', (r) => r.abort());
    await p.locator('#next').click();
    await p.locator('#retry-map').waitFor();
    assert.equal(await p.locator('.historic-regions path').count(), 22);
    assert.equal(await p.locator('#current-year').innerText(), '1803');
    assert.match(await p.locator('#map-status').innerText(), /Keeping the map/);
    assert.equal(
      await p.locator('#map-status').evaluate((e) => e.classList.contains('is-map-notice')),
      true,
    );
    await p.unroute('**/snapshot-1818-10-20.json');
    await p.locator('#retry-map').click();
    await ready(p);
    assert.equal(await p.locator('#current-year').innerText(), '1818');
  });
  if (name === 'Chrome')
    await check('playback prefetches and switches without loader frames', async (p) => {
      await observe(p);
      const prefetched = p.waitForResponse((r) => r.url().endsWith('snapshot-1818-10-20.json'));
      await p.locator('#play').click();
      await prefetched;
      assert.equal(await p.locator('#current-year').innerText(), '1803');
      await p.waitForFunction(() => document.querySelector('#current-year').textContent === '1818');
      await p.locator('#play').click();
      await p.waitForTimeout(240);
      await assertContinuous(p);
    });
  await browser.close();
}
await fs.writeFile(
  'docs/evidence/transition-results.json',
  JSON.stringify({ date: '2026-11-24', results }, null, 2),
);
if (results.some((r) => r.result === 'fail')) process.exitCode = 1;

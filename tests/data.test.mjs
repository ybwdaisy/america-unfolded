import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { feature } from 'topojson-client';
import { events, sources } from '../src/data/events.mjs';
import { geoAlbersUsa, geoAlbers, geoPath, geoArea } from 'd3-geo';
const manifest = JSON.parse(await fs.readFile('public/data/manifest.json', 'utf8'));
async function at(date) {
  const s = manifest.snapshots.filter((x) => x.date <= date).at(-1);
  if (!s) return null;
  const t = JSON.parse(await fs.readFile('public/data/' + s.file, 'utf8'));
  return feature(t, t.objects.regions);
}
test('chapters have unique IDs, ordered exact dates and real source references', () => {
  assert.equal(new Set(events.map((e) => e.id)).size, events.length);
  for (const [i, e] of events.entries()) {
    assert.ok(e.sourceIds.length);
    assert.ok(e.sourceIds.every((k) => sources[k]?.url.startsWith('https://')));
    if (i) assert.ok(events[i - 1].date <= e.date);
    assert.ok(e.dates.some((x) => x[1] === e.date));
  }
});
test('no invented 1776 boundary; source chronology starts in 1783', async () => {
  assert.equal(await at('1776-07-04'), null);
  assert.equal(manifest.snapshots[0].date, '1783-09-03');
});
test('acquisition and statehood nodes agree with supplied source records', async () => {
  for (const [date, name, expected] of [
    ['1803-04-29', 'Louisiana Purchase', false],
    ['1803-04-30', 'Louisiana Purchase', true],
    ['1819-02-22', 'Florida Unorg. FT', true],
    ['1845-12-29', 'Texas', true],
    ['1846-06-15', 'Oregon Unorg. FT', true],
    ['1848-07-03', 'Mexican Cession', false],
    ['1848-07-04', 'Mexican Cession', true],
    ['1853-12-31', 'Gadsden Purchase', false],
    ['1854-06-30', 'Gadsden Purchase', true],
    ['1867-03-30', 'Alaska Department', true],
    ['1898-07-07', 'Hawaii Annexation', true],
    ['1959-01-03', 'Alaska', true],
    ['1959-08-21', 'Hawaii', true],
  ]) {
    const a = await at(date);
    assert.equal(
      a.features.some((f) => f.properties.NAME === name),
      expected,
      `${date} ${name}`,
    );
  }
});
test('every snapshot decodes, has matching dates and valid projected geometry', async () => {
  const path = geoPath(geoAlbersUsa());
  for (const s of manifest.snapshots) {
    const data = await at(s.date);
    assert.equal(data.features.length, s.count);
    for (const f of data.features) {
      assert.ok(
        (f.properties.DISPLAY_START || f.properties.START_DATE) <= s.date &&
          f.properties.END_DATE >= s.date,
      );
      assert.ok(f.properties.CITATION);
      assert.ok(geoArea(f) < 1, `${s.date} ${f.properties.NAME} winding`);
      const p = path(f);
      if (p) assert.ok(!p.includes('NaN'));
    }
  }
});
test('reference layer has 50 states plus DC, not a historic statehood count', async () => {
  const t = JSON.parse(await fs.readFile('public/data/modern.json', 'utf8'));
  const shapes = feature(t, t.objects.regions).features;
  assert.equal(shapes.length, 51);
  assert.ok(shapes.every((f) => geoArea(f) < 1));
});
test('all event routes have readable sources and correct canonical paths without JS', async () => {
  for (const e of events) {
    const html = await fs.readFile(`dist/events/${e.id}/index.html`, 'utf8');
    assert.ok(html.includes(e.title));
    assert.ok(html.includes('Read the sources'));
    assert.ok(html.includes(`/events/${e.id}/`));
    assert.ok(html.includes('<noscript>'));
  }
});

test('license evidence is plain text and cannot execute upstream analytics', async () => {
  const names = await fs.readdir('dist/licenses');
  assert.ok(names.every((x) => !x.endsWith('.html')));
  assert.ok(names.includes('newberry-download-page.txt'));
  const html = await fs.readFile('dist/sources/index.html', 'utf8');
  assert.ok(html.includes('/licenses/newberry-download-page.txt'));
  assert.ok(!html.includes('googletagmanager.com'));
  assert.ok(!html.includes('No third-party map tiles, images, tracking,'));
});

test('mainland projection keeps Oregon Country out of the Alaska inset box', async () => {
  const mainland = geoAlbers()
    .parallels([29.5, 45.5])
    .rotate([96, 0])
    .center([-0.6, 38.7])
    .scale(1170)
    .translate([500, 305]);
  const mainlandPath = geoPath(mainland);
  const data = await at('1805-07-04');
  const oregon = data.features.find((f) => f.properties.NAME === 'Oregon Country');
  assert.ok(oregon, 'Oregon Country present in 1805 snapshot');
  const bounds = mainlandPath.bounds(oregon);
  assert.ok(bounds[1][1] < 300, `Oregon Country maxY leaked downward: ${bounds[1][1]}`);
});

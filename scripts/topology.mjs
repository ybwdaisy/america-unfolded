import fs from 'node:fs/promises';
import { topology } from 'topojson-server';
import { feature } from 'topojson-client';
const area = (r) =>
  r.reduce((a, p, i) => {
    const q = r[(i + 1) % r.length];
    return a + p[0] * q[1] - q[0] * p[1];
  }, 0) / 2;
let bytes = 0,
  collapsed = 0,
  reoriented = 0;
for (const file of await fs.readdir('public/data')) {
  if (!file.endsWith('.json') || file === 'manifest.json') continue;
  const original = JSON.parse(await fs.readFile('public/data/' + file, 'utf8'));
  if (original.type === 'Topology') continue;
  const topo = topology({ regions: original }, 100000);
  const decoded = feature(topo, topo.objects.regions);
  for (let i = 0; i < decoded.features.length; i++) {
    const coords = decoded.features[i].geometry,
      g = topo.objects.regions.geometries[i];
    const rings = (arcs, points) => {
      if (Math.abs(area(points[0])) < 1e-10) {
        collapsed++;
        return null;
      }
      return arcs.flatMap((a, j) => {
        const v = area(points[j]);
        if (Math.abs(v) < 1e-10) {
          collapsed++;
          return [];
        }
        if ((j === 0 && v > 0) || (j > 0 && v < 0)) {
          reoriented++;
          return [
            a
              .slice()
              .reverse()
              .map((x) => ~x),
          ];
        }
        return [a];
      });
    };
    if (g.type === 'Polygon') {
      g.arcs = rings(g.arcs, coords.coordinates);
      if (!g.arcs) {
        g.type = null;
        delete g.arcs;
      }
    } else if (g.type === 'MultiPolygon') {
      g.arcs = g.arcs.flatMap((a, j) => {
        const r = rings(a, coords.coordinates[j]);
        return r ? [r] : [];
      });
    }
  }
  topo.date = original.date;
  topo.source = original.source || 'newberry-state-terr-gen01';
  const text = JSON.stringify(topo);
  await fs.writeFile('public/data/' + file, text);
  bytes += Buffer.byteLength(text);
}
const provenance = JSON.parse(await fs.readFile('docs/DATA-PROVENANCE.json', 'utf8'));
provenance.encoding = {
  format: 'TopoJSON',
  quantization: 100000,
  note: 'Deterministic grid encoding, finer than source 0.01-degree generalization. Collapsed sub-grid rings omitted and winding preserved; not new historical survey coordinates.',
  collapsedRingOccurrences: collapsed,
  reorientedRingOccurrences: reoriented,
};
await fs.writeFile('docs/DATA-PROVENANCE.json', JSON.stringify(provenance, null, 2));
console.log({ bytes, collapsed, reoriented });

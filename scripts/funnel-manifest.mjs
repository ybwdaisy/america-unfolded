import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import { analyticsEvents } from '../src/analytics-contract.mjs';

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const hostname = 'usa.ybwdaisy.com';
export const contractBase = 'https://site-pulse-nine-tau.vercel.app/contracts/';
const schemaName = 'funnels-v1.schema.json';
const docName = 'funnels-v1.md';
const manifestPath = '.well-known/site-pulse.json';
const cachePath = (root) => join(root, 'analytics/contracts');

/** No coercion, default insertion, remote code or external schema loading. */
export async function validateManifest(manifest, root = projectRoot) {
  const schema = JSON.parse(await readFile(join(cachePath(root), schemaName), 'utf8'));
  assert.equal(schema.$id, contractBase + schemaName, 'Unexpected cached contract identity');
  const validate = new Ajv({ allErrors: true, strict: true }).compile(schema);
  assert.ok(validate(manifest), 'Invalid funnel manifest: ' + JSON.stringify(validate.errors));
  assert.equal(manifest.hostname, hostname, 'Manifest must use the exact production hostname');
  assert.equal(
    new Set(manifest.events).size,
    manifest.events.length,
    'Duplicate event declaration',
  );
  assert.equal(
    new Set(manifest.funnels.map((f) => f.id)).size,
    manifest.funnels.length,
    'Duplicate stable funnel ID',
  );
  const emitted = new Set(analyticsEvents);
  const declared = new Set(manifest.events);
  for (const event of manifest.events)
    assert.ok(emitted.has(event), `Event is not in the actual analytics contract: ${event}`);
  for (const funnel of manifest.funnels) {
    for (const step of funnel.definition.steps) {
      const candidates = step.event.split('|');
      assert.ok(candidates.length >= 1 && candidates.length <= 10, 'Invalid finite event OR');
      assert.equal(new Set(candidates).size, candidates.length, 'Repeated event in OR');
      for (const event of candidates) {
        assert.match(
          event,
          /^[a-zA-Z][a-zA-Z0-9_]{0,79}$/,
          'Event OR accepts names only, not regular expressions',
        );
        assert.ok(
          declared.has(event) && emitted.has(event),
          `Step references an undeclared or unsupported event: ${event}`,
        );
      }
    }
    if (funnel.source) {
      const url = new URL(funnel.source.url);
      assert.ok(
        url.protocol === 'https:' && !url.username && !url.password,
        'Source must be a public HTTPS URL',
      );
    }
  }
  return manifest;
}

/** The editable source is copied without serialization or a second definition. */
export async function manifestFiles(root = projectRoot, { write = false, dist = false } = {}) {
  const source = await readFile(join(root, 'analytics/funnels.json'));
  const manifest = await validateManifest(JSON.parse(source.toString('utf8')), root);
  const output = join(root, 'public', manifestPath);
  if (write) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, source);
  }
  assert.ok(
    source.equals(await readFile(output)),
    'Published manifest differs from analytics/funnels.json; regenerate it',
  );
  if (dist)
    assert.ok(
      source.equals(await readFile(join(root, 'dist', manifestPath))),
      'Built manifest is missing or differs from its source',
    );
  return manifest;
}

/** CI fails on unavailable, redirected or changed contracts; it never silently refreshes the cache. */
export async function checkOnlineContract({ root = projectRoot, fetcher = fetch } = {}) {
  for (const name of [schemaName, docName]) {
    const response = await fetcher(contractBase + name, {
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
    });
    assert.equal(response.status, 200, `Public contract unavailable: ${name}`);
    const online = Buffer.from(await response.arrayBuffer());
    assert.ok(
      online.equals(await readFile(join(cachePath(root), name))),
      `Public contract differs from validated cache: ${name}; review and update the contract cache explicitly`,
    );
  }
}

async function main() {
  const args = process.argv.slice(2);
  assert.ok(
    args.every((a) => ['--write', '--check', '--dist', '--contract'].includes(a)),
    'Unknown manifest command',
  );
  const ci = Boolean(process.env.CI && !/^(false|0)$/i.test(process.env.CI));
  if (
    args.includes('--contract') ||
    (args.includes('--write') && (ci || process.env.VERCEL === '1'))
  ) {
    await checkOnlineContract();
    console.log('PASS public funnel contract matches the validated local cache');
  }
  if (
    !args.includes('--contract') ||
    args.some((a) => ['--write', '--check', '--dist'].includes(a))
  ) {
    const manifest = await manifestFiles(projectRoot, {
      write: args.includes('--write'),
      dist: args.includes('--dist'),
    });
    console.log(
      `PASS ${hostname} manifest ${manifest.revision}: ${manifest.funnels.length} funnels, ${manifest.events.length} real contract events, exact published bytes`,
    );
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

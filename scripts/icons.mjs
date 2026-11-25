// Rasterize the original SVG with the project's existing Playwright dependency.
// Run: node scripts/icons.mjs (requires Playwright Chromium or PLAYWRIGHT_CHANNEL=chrome).
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const svg = await fs.readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8');
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
try {
  const frames = [];
  for (const size of [16, 32, 48, 180, 192, 512]) {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<style>html,body{margin:0}svg{display:block;width:100%;height:100%}</style>${svg}`,
    );
    const png = await page.screenshot({ type: 'png', omitBackground: false });
    if (size < 100) frames.push({ size, png });
    else
      await fs.writeFile(
        new URL(
          `../public/${size === 180 ? 'apple-touch-icon.png' : `icons/icon-${size}.png`}`,
          import.meta.url,
        ),
        png,
      );
    await page.close();
  }
  // Modern ICO supports PNG frames; retain small sizes for browser tabs/bookmarks.
  const header = Buffer.alloc(6 + frames.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  frames.forEach(({ size, png }, i) => {
    const entry = 6 + i * 16;
    header[entry] = header[entry + 1] = size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  await fs.writeFile(
    new URL('../public/favicon.ico', import.meta.url),
    Buffer.concat([header, ...frames.map((f) => f.png)]),
  );
} finally {
  await browser.close();
}

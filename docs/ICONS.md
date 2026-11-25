# Brand and home-screen icons

The original folded-map mark uses the atlas palette: navy, ivory, brass and brick red. It is a geometric brand symbol, not a historical boundary. The SVG and derived raster assets are original work under this repository's MIT license.

- `public/favicon.svg`: master artwork and masthead mark.
- `public/favicon.ico`: 16, 32 and 48 pixel browser/bookmark fallbacks.
- `public/apple-touch-icon.png`: opaque 180 × 180 PNG for Safari's Add to Home Screen. All routes explicitly link it; the standard root location also supports automatic discovery.
- `public/icons/icon-192.png` and `icon-512.png`: web manifest icons.
- `public/site.webmanifest`: English product identity, root scope and start URL. This is a browser shortcut; it does not add offline storage, a service worker or an installation prompt.

Regenerate with `node scripts/icons.mjs` after installing Playwright Chromium, or `PLAYWRIGHT_CHANNEL=chrome node scripts/icons.mjs` using an installed Chrome. Generated assets are committed, so deployment requires no browser or additional dependency.

Safari may retain an already-installed blank icon. After the update, remove that home-screen shortcut, reopen https://usa.ybwdaisy.com/ in Safari, and choose Share → Add to Home Screen again. Do not clear browsing data or analytics preferences for this.

Verification distinguishes desktop Chrome, iPhone-sized browser emulation and physical iPhone Safari. Automated PNG loading and metadata checks do not prove the iOS share sheet or installed icon on a physical device.

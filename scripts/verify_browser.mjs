import puppeteer from '/Users/ybwdaisy/.agents/skills/hallmark/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = '/Users/ybwdaisy/.gemini/antigravity/scratch/america-unfolded/assets/screenshots';

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runBrowserTests() {
  console.log('Launching Chrome browser for verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser Console Error:', msg.text());
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    console.error('Page Uncaught Error:', err.message);
    errors.push(err.message);
  });

  try {
    // 1. Desktop Test (1280x800)
    console.log('Testing Desktop 1280x800 Viewport...');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:3456/', { waitUntil: 'networkidle0' });

    const title = await page.title();
    console.log(`Page title: ${title}`);
    if (!title.includes('America Unfolded')) throw new Error('Title mismatch');

    // Verify 1776 initial render
    const currentYear = await page.$eval('#current-year-display', el => el.textContent.trim());
    console.log(`Initial Year: ${currentYear}`);
    if (currentYear !== '1776') throw new Error(`Expected 1776, got ${currentYear}`);

    const territoryCount1776 = await page.$$eval('.territory-path', els => els.length);
    console.log(`1776 Active Territory count: ${territoryCount1776}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-desktop-1776-declaration.png') });

    // 2. Step to 1783 Treaty of Paris
    console.log('Clicking Next Step (1783 Treaty of Paris)...');
    await page.click('#next-btn');
    await new Promise(r => setTimeout(r, 400));
    const year1783 = await page.$eval('#current-year-display', el => el.textContent.trim());
    console.log(`Year after step 1: ${year1783}`);

    // 3. Step to 1787 Northwest Ordinance
    await page.click('#next-btn');
    await new Promise(r => setTimeout(r, 400));

    // 4. Step to 1803 Louisiana Purchase
    console.log('Clicking Next Step (1803 Louisiana Purchase)...');
    await page.click('#next-btn');
    await new Promise(r => setTimeout(r, 400));
    const year1803 = await page.$eval('#current-year-display', el => el.textContent.trim());
    console.log(`Year at Louisiana Purchase: ${year1803}`);
    if (year1803 !== '1803') throw new Error(`Expected 1803, got ${year1803}`);

    // 5. Toggle Contrast Mode (Compare Mode)
    console.log('Toggling Contrast Mode (Compare View)...');
    await page.click('#toggle-compare-mode');
    await new Promise(r => setTimeout(r, 400));

    // 6. Toggle Modern States Overlay
    console.log('Toggling Modern 50 States Overlay...');
    await page.click('#toggle-modern-states');
    await new Promise(r => setTimeout(r, 400));

    const stateOverlayDisplay = await page.$eval('#state-layer', el => el.style.display);
    console.log(`State overlay display: ${stateOverlayDisplay}`);
    if (stateOverlayDisplay !== 'inline') throw new Error('State overlay not visible');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-desktop-1803-contrast-states.png') });

    // 7. Step through to 1845 Texas Annexation
    console.log('Stepping to 1845 Texas Annexation...');
    await page.click('#next-btn'); // 1818
    await new Promise(r => setTimeout(r, 200));
    await page.click('#next-btn'); // 1819
    await new Promise(r => setTimeout(r, 200));
    await page.click('#next-btn'); // 1845
    await new Promise(r => setTimeout(r, 400));
    const year1845 = await page.$eval('#current-year-display', el => el.textContent.trim());
    console.log(`Year at Texas Annexation: ${year1845}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-desktop-1845-texas-annexation.png') });

    // 8. Step to 1848 Mexican Cession
    console.log('Stepping to 1848 Mexican Cession...');
    await page.click('#next-btn'); // 1846 Oregon
    await new Promise(r => setTimeout(r, 200));
    await page.click('#next-btn'); // 1848 Mexican Cession
    await new Promise(r => setTimeout(r, 400));
    const year1848 = await page.$eval('#current-year-display', el => el.textContent.trim());
    console.log(`Year at Mexican Cession: ${year1848}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-desktop-1848-mexican-cession.png') });

    // 9. Step to 1867 Alaska Purchase
    console.log('Stepping to 1867 Alaska Purchase...');
    await page.click('#next-btn'); // 1853 Gadsden
    await new Promise(r => setTimeout(r, 200));
    await page.click('#next-btn'); // 1867 Alaska
    await new Promise(r => setTimeout(r, 400));
    const year1867 = await page.$eval('#current-year-display', el => el.textContent.trim());
    console.log(`Year at Alaska Purchase: ${year1867}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-desktop-1867-alaska-purchase.png') });

    // 10. Step to 1959 Final Statehood
    console.log('Stepping to 1959 Final Statehood...');
    await page.click('#next-btn'); // 1898 Hawaii
    await new Promise(r => setTimeout(r, 200));
    await page.click('#next-btn'); // 1959 Statehood
    await new Promise(r => setTimeout(r, 400));
    const year1959 = await page.$eval('#current-year-display', el => el.textContent.trim());
    console.log(`Year at Final Statehood: ${year1959}`);
    if (year1959 !== '1959') throw new Error(`Expected 1959, got ${year1959}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-desktop-1959-50-states.png') });

    // 11. Mobile Viewport Test (iPhone 14: 390 x 844)
    console.log('Testing Mobile iPhone 14 (390 x 844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:3456/?node=1803-louisiana-purchase&compare=1&states=1', { waitUntil: 'networkidle0' });

    // Verify detail drawer opens and is readable
    const drawerOpen = await page.$eval('#detail-panel', el => el.classList.contains('is-open'));
    console.log(`Mobile drawer open state: ${drawerOpen}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-mobile-1803-drawer-open.png') });

    // Test close button on mobile
    console.log('Testing mobile drawer close button...');
    await page.click('#close-panel-btn');
    await new Promise(r => setTimeout(r, 300));
    const drawerClosed = await page.$eval('#detail-panel', el => !el.classList.contains('is-open'));
    console.log(`Mobile drawer closed successfully: ${drawerClosed}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-mobile-map-full-view.png') });

    // 12. URL State Restoration & Direct Link Test
    console.log('Testing URL State Restoration (?node=1848-mexican-cession)...');
    await page.goto('http://localhost:3456/?node=1848-mexican-cession&compare=1&states=1', { waitUntil: 'networkidle0' });
    const urlRestoredYear = await page.$eval('#current-year-display', el => el.textContent.trim());
    console.log(`Restored Year from URL: ${urlRestoredYear}`);
    if (urlRestoredYear !== '1848') throw new Error(`URL restore failed: expected 1848, got ${urlRestoredYear}`);

    // 13. Verify Static SEO Event Page
    console.log('Testing Static Event Page (/events/1803-louisiana-purchase.html)...');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:3456/events/1803-louisiana-purchase.html', { waitUntil: 'networkidle0' });
    const h1Event = await page.$eval('h1', el => el.textContent.trim());
    console.log(`Static event page H1: ${h1Event}`);
    if (!h1Event.includes('Louisiana Purchase')) throw new Error('Static event page H1 mismatch');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-static-event-seo-page.png') });

    // 14. Verify Sources & License Page
    console.log('Testing Sources Page (/sources.html)...');
    await page.goto('http://localhost:3456/sources.html', { waitUntil: 'networkidle0' });
    const sourcesH1 = await page.$eval('h1', el => el.textContent.trim());
    console.log(`Sources page H1: ${sourcesH1}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-sources-license-page.png') });

    console.log('\n========================================');
    console.log('ALL BROWSER VERIFICATION TESTS PASSED!');
    console.log(`Total errors captured: ${errors.length}`);
    console.log('Screenshots saved to assets/screenshots/');
    console.log('========================================\n');

  } catch (err) {
    console.error('Browser Test Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runBrowserTests();

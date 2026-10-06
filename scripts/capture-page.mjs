import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = (process.env.SCREENSHOT_BASE_URL || 'https://helioconde.github.io/riot-legacy/').replace(/\/?$/, '/');
const outputDir = process.env.SCREENSHOT_OUTPUT_DIR || 'visual-snapshots';
const timeout = Number(process.env.SCREENSHOT_TIMEOUT || 30000);

const targets = [
  {
    name: 'landing-desktop',
    url: baseUrl,
    viewport: { width: 1440, height: 1000 }
  },
  {
    name: 'profile-desktop',
    url: baseUrl + '?riotId=AlchemyFlames%23BR1&server=br1',
    viewport: { width: 1440, height: 1000 }
  },
  {
    name: 'profile-mobile',
    url: baseUrl + '?riotId=AlchemyFlames%23BR1&server=br1',
    viewport: { width: 390, height: 844 },
    isMobile: true
  }
];

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const capturedAt = new Date().toISOString();
const metadata = {
  capturedAt,
  baseUrl,
  commit: process.env.GITHUB_SHA || null,
  files: []
};

try {
  for (const target of targets) {
    const context = await browser.newContext({
      viewport: target.viewport,
      deviceScaleFactor: 1,
      isMobile: Boolean(target.isMobile)
    });
    const page = await context.newPage();

    await page.goto(target.url, {
      waitUntil: 'domcontentloaded',
      timeout
    });

    // Let fonts and asynchronous profile hydration settle.
    await page.waitForTimeout(1200);
    if (target.name.startsWith('profile-')) {
      await page.waitForFunction(() => {
        const badge = document.querySelector('#demo-badge');
        return badge && badge.dataset.sourceState !== 'loading';
      }, { timeout: 18000 }).catch(() => {});
      await page.waitForTimeout(700);
    }

    // Prevent animations/caret from producing noisy diffs.
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition: none !important;
          caret-color: transparent !important;
        }
        html { scroll-behavior: auto !important; }
      `
    });

    const file = path.join(outputDir, `${target.name}.png`);
    await page.screenshot({
      path: file,
      fullPage: true,
      animations: 'disabled'
    });

    const reviewFile = path.join(outputDir, `review-${target.name}.jpg`);
    await page.screenshot({
      path: reviewFile,
      fullPage: false,
      type: 'jpeg',
      quality: 72,
      animations: 'disabled'
    });

    const tabReviews = [];
    if (target.name.startsWith('profile-')) {
      for (const tab of ['league', 'tft', 'share']) {
        await page.locator(`[data-tab="${tab}"]`).click();
        const panel = page.locator(`#panel-${tab}`);
        await panel.evaluate(element => {
          const top = element.getBoundingClientRect().top + window.scrollY - 86;
          window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
        });
        await page.waitForTimeout(250);
        const tabFile = path.join(outputDir, `review-${target.name}-${tab}.jpg`);
        await page.screenshot({
          path: tabFile,
          fullPage: false,
          type: 'jpeg',
          quality: 72,
          animations: 'disabled'
        });
        tabReviews.push({ tab, file: tabFile });
      }
      await page.locator('[data-tab="legacy"]').click();
    }

    metadata.files.push({
      name: target.name,
      file,
      reviewFile,
      tabReviews,
      url: target.url,
      viewport: target.viewport
    });

    await context.close();
  }
} finally {
  await browser.close();
}

await fs.writeFile(
  path.join(outputDir, 'metadata.json'),
  JSON.stringify(metadata, null, 2) + '\n',
  'utf8'
);

console.log(`Saved ${metadata.files.length} full-page snapshots to ${outputDir}`);

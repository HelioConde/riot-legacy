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
    url: baseUrl + '?riotId=VisualTest%23BR1&server=br1',
    viewport: { width: 1440, height: 1000 }
  },
  {
    name: 'profile-mobile',
    url: baseUrl + '?riotId=VisualTest%23BR1&server=br1',
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

    // Let fonts, async UI and the explicit demo fallback settle.
    await page.waitForTimeout(2500);

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

    metadata.files.push({
      name: target.name,
      file,
      url: target.url.replace('VisualTest%23BR1', 'demo-profile'),
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

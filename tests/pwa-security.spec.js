const { test, expect } = require('@playwright/test');

test('PWA não guarda Riot IDs parametrizados e preserva caches de outros projetos', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const unrelated = await caches.open('zerotwo-shell-sentinel');
    await unrelated.put('/zerotwo-offline-data', new Response('preserved'));
    await navigator.serviceWorker.register('./sw.js');
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await page.goto('/?riotId=AlchemyFlames%23BR1&token=private-regression-token');
  await page.evaluate(() => fetch('./version.json?token=private-regression-token', { cache: 'no-store' }));

  const found = await page.evaluate(async () => {
    const names = await caches.keys();
    const urls = [];
    for (const name of names) {
      const cache = await caches.open(name);
      urls.push(...(await cache.keys()).map(req => req.url));
    }
    const other = await caches.open('zerotwo-shell-sentinel');
    return { names, urls, other: await (await other.match('/zerotwo-offline-data'))?.text() };
  });

  expect(found.names).toContain('riot-legacy-v6');
  expect(found.other).toBe('preserved');
  expect(found.urls.some(url => url.includes('private-regression-token'))).toBe(false);
  expect(found.urls.some(url => url.includes('version.json?'))).toBe(false);
});

test('atualização do worker remove apenas caches antigos do Riot Legacy', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) await registration.unregister();
    await caches.open('riot-legacy-v3');
    await caches.open('chibi-gg-offline-sentinel');
    await navigator.serviceWorker.register('./sw.js?qa=upgrade', { scope: './' });
    await navigator.serviceWorker.ready;
  });
  await expect.poll(() => page.evaluate(async () => await caches.keys())).not.toContain('riot-legacy-v3');
  const names = await page.evaluate(() => caches.keys());
  expect(names).toContain('riot-legacy-v6');
  expect(names).toContain('chibi-gg-offline-sentinel');
});

test('app shell permanece disponível offline sem transmitir dados privados', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('./sw.js');
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await context.setOffline(true);
  try {
    const html = await page.evaluate(async () => {
      const response = await fetch('./index.html');
      return { ok: response.ok, body: await response.text() };
    });
    expect(html.ok).toBe(true);
    expect(html.body).toContain('id="riot-form"');
  } finally {
    await context.setOffline(false);
  }
});

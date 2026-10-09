// Riot Legacy operates on a GitHub Pages origin shared with other products.
// Never cache Riot IDs, personal query URLs or other applications' resources.
const CACHE_NAME = 'riot-legacy-v6';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './i18n.js',
  './backend-config.js',
  './ads-config.js',
  './ads.js',
  './live-update.js',
  './manifest.webmanifest',
  './assets/ui/logo.png',
  './assets/ui/app-icon.png',
  './assets/ui/hero.png',
  './assets/ui/hero-mobile.png',
  './assets/ui/profile-header.png',
  './assets/ui/hud-lol.png',
  './assets/ui/hud-tft.png',
  './assets/ui/status-live.png',
  './assets/ui/status-cache.png',
  './assets/ui/share-bg.png',
  './assets/ui/icon-league-round.png',
  './assets/ui/icon-tft-round.png',
  './assets/ui/icon-mastery-crown.png',
  './assets/ui/icon-stats-bars.png',
  './assets/ui/icon-calendar.png',
  './assets/ui/icon-trophy.png',
  './assets/ui/icon-star.png',
  './assets/ui/icon-heart.png',
  './assets/ui/bg-history-blue.png',
  './assets/ui/bg-history-gold.png',
  './assets/ui/bg-history-violet.png',
  './assets/ui/rank-iron.png',
  './assets/ui/rank-bronze.png',
  './assets/ui/rank-silver.png',
  './assets/ui/rank-gold.png',
  './assets/ui/rank-platinum.png',
  './assets/ui/rank-emerald.png',
  './assets/ui/rank-diamond.png',
  './assets/ui/rank-master.png',
  './assets/ui/rank-grandmaster.png',
  './assets/ui/rank-challenger.png',
  './assets/ui/role-top.png',
  './assets/ui/role-jungle.png',
  './assets/ui/role-mid.png',
  './assets/ui/role-adc.png',
  './assets/ui/role-support.png',
  './assets/ui/card-frame.png',
  './assets/ui/panel-frame.png'
];
const APP_SCOPE = new URL(self.registration.scope);
const SHELL_PATHS = new Set(APP_SHELL.map(file => new URL(file, self.registration.scope).pathname));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('riot-legacy-v') && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== APP_SCOPE.origin || !url.pathname.startsWith(APP_SCOPE.pathname)) return;

  const isNavigation = request.mode === 'navigate';
  const canCache = !url.search && SHELL_PATHS.has(url.pathname);
  if (!canCache && !isNavigation) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (canCache && response.ok && response.type === 'basic') {
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      if (canCache) {
        const found = await cache.match(request);
        if (found) return found;
      }
      // For offline profile deep links, serve only the static public application shell.
      if (isNavigation) {
        const pathname = SHELL_PATHS.has(url.pathname)
          ? url.pathname
          : new URL('./index.html', self.registration.scope).pathname;
        const shell = await cache.match(APP_SCOPE.origin + pathname);
        if (shell) return shell;
      }
      return Response.error();
    }
  })());
});

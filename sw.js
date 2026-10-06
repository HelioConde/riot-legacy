const CACHE_NAME = 'riot-legacy-v4';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './i18n.js',
  './backend-config.js',
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
  './assets/ui/rank-gold.png',
  './assets/ui/rank-bronze.png',
  './assets/ui/role-top.png',
  './assets/ui/role-jungle.png',
  './assets/ui/role-mid.png',
  './assets/ui/role-adc.png',
  './assets/ui/role-support.png',
  './assets/ui/card-frame.png',
  './assets/ui/panel-frame.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then(hit => hit || caches.match('./index.html')))
  );
});

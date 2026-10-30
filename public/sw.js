const CACHE_NAME = 'hablemos-calendar-v1';
const APP_SHELL = [
  '/', '/calendar', '/calendar/', '/offline.html', '/manifest.webmanifest',
  '/assets/img/pagina/logo.svg', '/assets/css/main.css',
  '/calendar/css/style.css', '/calendar/js/main.js',
  '/calendar/js/calendarEngine.js', '/calendar/js/astronomicalEngine.js',
  '/calendar/js/moonPhase.js', '/calendar/js/parashotEngine.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => Promise.allSettled(APP_SHELL.map(url => cache.add(url)))));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('hablemos-calendar-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CLEAR_PWA_CACHE') {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('hablemos-calendar-')).map(key => caches.delete(key)))).then(async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach(client => client.postMessage({ type: 'PWA_CACHE_CLEARED' }));
    }));
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin || url.pathname.startsWith('/admin') || url.pathname.startsWith('/api') || url.pathname.startsWith('/uploads')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match('/calendar')) || caches.match('/offline.html')));
    return;
  }

  if (url.pathname.startsWith('/assets/calendar/') || url.pathname.startsWith('/calendar/')) {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return response;
    }).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});


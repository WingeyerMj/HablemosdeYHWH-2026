// Service Worker — Carpeta Autónoma Calendar/
const CACHE_NAME = 'yhwh-calendario-standalone-v6';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/main.js',
  './js/calendarEngine.js',
  './js/parashotEngine.js',
  './js/moonPhase.js',
  './js/data/year2025.js',
  './js/data/year2026.js',
  './js/data/year2027.js',
  './js/data/year2028.js',
  './js/data/year2029.js',
  './js/data/year2030.js',
  './js/data/year2031.js',
  './js/data/year2032.js',
  './js/data/year2033.js',
  './js/data/year2034.js',
  './js/data/year2035.js',
  './js/data/year2036.js',
  './js/data/year2037.js',
  './js/data/year2038.js',
  './js/data/year2039.js',
  './js/data/year2040.js',
  './icons/calendar-icon.svg',
  './icons/cal-icon.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(ASSETS.map((u) => cache.add(u)))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});


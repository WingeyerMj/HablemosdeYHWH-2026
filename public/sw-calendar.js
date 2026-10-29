// Service Worker — Calendario Lunisolar Hablemos de YHWH (100% Offline PWA)
const CACHE_NAME = 'yhwh-calendario-pwa-v2';

const CORE_CALENDAR_ASSETS = [
  '/calendar',
  '/calendar?pwa=1',
  '/manifest-calendar.json',
  '/assets/calendar/css/style.css',
  '/assets/calendar/js/main.js',
  '/assets/calendar/js/calendarEngine.js',
  '/assets/calendar/js/parashotEngine.js',
  '/assets/calendar/js/moonPhase.js',
  '/assets/calendar/js/data/year2025.js',
  '/assets/calendar/js/data/year2026.js',
  '/assets/calendar/js/data/year2027.js',
  '/assets/calendar/js/data/year2028.js',
  '/assets/calendar/js/data/year2029.js',
  '/assets/calendar/js/data/year2030.js',
  '/assets/calendar/js/data/year2031.js',
  '/assets/calendar/js/data/year2032.js',
  '/assets/calendar/js/data/year2033.js',
  '/assets/calendar/js/data/year2034.js',
  '/assets/calendar/js/data/year2035.js',
  '/assets/calendar/js/data/year2036.js',
  '/assets/calendar/js/data/year2037.js',
  '/assets/calendar/js/data/year2038.js',
  '/assets/calendar/js/data/year2039.js',
  '/assets/calendar/js/data/year2040.js',
  '/assets/calendar/icons/calendar-icon.svg',
  '/assets/calendar/icons/icon-192.png',
  '/assets/calendar/icons/icon-512.png',
  '/assets/calendar/icons/apple-touch-icon.png',
  '/assets/css/main.css',
  '/assets/js/main.js',
  '/assets/img/pagina/logo.svg',
  '/assets/img/pagina/logo1.svg',
  '/assets/vendor/bootstrap/css/bootstrap.min.css',
  '/assets/vendor/bootstrap/js/bootstrap.bundle.min.js',
  '/assets/vendor/bootstrap-icons/bootstrap-icons.css',
  '/assets/vendor/bootstrap-icons/fonts/bootstrap-icons.woff2',
  '/assets/vendor/bootstrap-icons/fonts/bootstrap-icons.woff'
];

const OPTIONAL_EXTERNAL_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.allSettled(
        CORE_CALENDAR_ASSETS.map(async (url) => {
          try {
            const req = new Request(url, { cache: 'reload' });
            const res = await fetch(req);
            if (res && res.ok) {
              await cache.put(url, res);
            }
          } catch (err) {
            // Ignorar error individual para no abortar la instalación offline
          }
        })
      );
      await Promise.allSettled(
        OPTIONAL_EXTERNAL_ASSETS.map(async (url) => {
          try {
            const res = await fetch(url, { mode: 'cors' });
            if (res && res.ok) {
              await cache.put(url, res);
            }
          } catch (err) {
            // Ignorar si no hay internet al instalar
          }
        })
      );
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key.startsWith('yhwh-calendario-pwa-') && key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'GET_CACHE_STATUS') {
    caches.open(CACHE_NAME).then(async (cache) => {
      const keys = await cache.keys();
      if (event.source) {
        event.source.postMessage({
          type: 'CACHE_STATUS',
          ready: keys.length >= 18,
          count: keys.length
        });
      }
    });
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. Peticiones de navegación a /calendar (o fallback offline de la PWA)
  const isCalendarNav =
    request.mode === 'navigate' &&
    (url.pathname === '/calendar' || url.pathname.startsWith('/calendar/'));

  if (isCalendarNav) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            cache.put('/calendar', networkResponse.clone());
            return networkResponse;
          }
        } catch (err) {
          // Sin conexión: servir desde caché local
        }
        const cachedExact = await cache.match(request);
        if (cachedExact) return cachedExact;
        const cachedCalendar = await cache.match('/calendar') || await cache.match('/calendar?pwa=1');
        if (cachedCalendar) return cachedCalendar;
        return new Response('Calendario sin conexión no disponible aún. Abre la página una vez con internet.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })()
    );
    return;
  }

  // 2. Recursos estáticos del calendario, iconos, fuentes y librerías PDF/PNG
  const isCalendarAsset =
    url.pathname.startsWith('/assets/calendar/') ||
    url.pathname === '/manifest-calendar.json' ||
    url.pathname.startsWith('/assets/vendor/') ||
    url.pathname.startsWith('/assets/css/') ||
    url.pathname.startsWith('/assets/js/') ||
    url.pathname.startsWith('/assets/img/pagina/logo') ||
    url.hostname === 'cdnjs.cloudflare.com' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';

  if (isCalendarAsset) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = (await cache.match(request)) || (await cache.match(request, { ignoreSearch: true }));
        if (cached) {
          // Actualizar en segundo plano si hay red (Stale-While-Revalidate)
          fetch(request)
            .then((netRes) => {
              if (netRes && netRes.ok) {
                cache.put(request, netRes.clone());
              }
            })
            .catch(() => {});
          return cached;
        }

        try {
          const netRes = await fetch(request);
          if (netRes && netRes.ok) {
            cache.put(request, netRes.clone());
          }
          return netRes;
        } catch (err) {
          return new Response('', { status: 504 });
        }
      })()
    );
  }
});


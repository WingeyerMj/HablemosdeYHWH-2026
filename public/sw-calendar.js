// Service Worker — Calendario Lunisolar Hablemos de YHWH (100% Offline PWA)
const CACHE_NAME = 'yhwh-calendario-pwa-v6';

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
  '/assets/calendar/icons/cal-icon.jpg',
  '/assets/calendar/icons/icon-192.png',
  '/assets/calendar/icons/icon-512.png',
  '/assets/calendar/icons/apple-touch-icon.png',
  // Plantilla general del sitio (necesaria para que la página nunca quede "pensando")
  '/assets/css/main.css',
  '/assets/js/main.js',
  '/assets/js/modules/nav.js',
  '/assets/js/modules/components.js',
  '/assets/img/pagina/logo.svg',
  '/assets/img/pagina/logo1.svg',
  '/assets/vendor/bootstrap/css/bootstrap.min.css',
  '/assets/vendor/bootstrap/js/bootstrap.bundle.min.js',
  '/assets/vendor/bootstrap-icons/bootstrap-icons.css',
  '/assets/vendor/bootstrap-icons/fonts/bootstrap-icons.woff2',
  '/assets/vendor/bootstrap-icons/fonts/bootstrap-icons.woff',
  '/assets/vendor/aos/aos.css',
  '/assets/vendor/aos/aos.js',
  '/assets/vendor/swiper/swiper-bundle.min.css',
  '/assets/vendor/swiper/swiper-bundle.min.js',
  '/assets/vendor/glightbox/css/glightbox.min.css',
  '/assets/vendor/glightbox/js/glightbox.min.js',
  '/assets/vendor/imagesloaded/imagesloaded.pkgd.min.js',
  '/assets/vendor/isotope-layout/isotope.pkgd.min.js',
  '/assets/vendor/php-email-form/validate.js'
];

const OPTIONAL_EXTERNAL_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

async function cacheUrl(cache, url, options) {
  try {
    const res = await fetch(new Request(url, options || { cache: 'reload' }));
    if (res && (res.ok || res.type === 'opaque')) {
      await cache.put(url, res);
    }
  } catch (err) {
    // Ignorar error individual para no abortar la instalación offline
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.allSettled(CORE_CALENDAR_ASSETS.map((url) => cacheUrl(cache, url)));
      await Promise.allSettled(OPTIONAL_EXTERNAL_ASSETS.map((url) => cacheUrl(cache, url, { mode: 'cors' })));
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
  if (event.data.type === 'CACHE_URLS' && Array.isArray(event.data.urls)) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(async (cache) => {
        await Promise.allSettled(
          event.data.urls.map(async (url) => {
            try {
              const u = new URL(url, self.location.origin);
              if (u.origin !== self.location.origin) return;
              if (await cache.match(u.href)) return;
              await cacheUrl(cache, u.href, { cache: 'default' });
            } catch (e) {}
          })
        );
      })
    );
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

function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(request).then(
      (res) => { clearTimeout(timer); resolve(res); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 0. Evitar que Google Analytics / Tag Manager deje el navegador "pensando" sin internet
  if (
    url.hostname.includes('googletagmanager.com') ||
    url.hostname.includes('google-analytics.com')
  ) {
    event.respondWith(
      fetchWithTimeout(request, 1500).catch(
        () => new Response('', { status: 200, headers: { 'Content-Type': 'application/javascript' } })
      )
    );
    return;
  }

  // 1. Navegación a /calendar, /calendar/ o arranque de la App instalada (/calendar?pwa=1)
  const isCalendarNav =
    request.mode === 'navigate' &&
    (url.pathname === '/calendar' || url.pathname.startsWith('/calendar/'));

  if (isCalendarNav) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached =
          (await cache.match(request)) ||
          (await cache.match('/calendar?pwa=1')) ||
          (await cache.match('/calendar'));

        // Si ya tenemos el calendario en memoria local, entregarlo AL INSTANTE (0 ms de espera)
        // y actualizar la caché en segundo plano si hay internet.
        if (cached) {
          event.waitUntil(
            fetchWithTimeout(new Request('/calendar', { cache: 'reload' }), 4000)
              .then((netRes) => {
                if (netRes && netRes.ok && !netRes.redirected) {
                  cache.put('/calendar', netRes.clone());
                  cache.put('/calendar?pwa=1', netRes.clone());
                }
              })
              .catch(() => {})
          );
          return cached;
        }

        // Primera visita sin caché previa: ir a la red y guardar
        try {
          const networkResponse = await fetchWithTimeout(request, 6000);
          if (networkResponse && networkResponse.ok && !networkResponse.redirected) {
            cache.put('/calendar', networkResponse.clone());
            cache.put('/calendar?pwa=1', networkResponse.clone());
            return networkResponse;
          }
          if (networkResponse) return networkResponse;
        } catch (err) {
          // Sin conexión
        }

        return new Response('Calendario sin conexión no disponible aún. Abre la página una vez con internet.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })()
    );
    return;
  }

  // 2. Recursos estáticos (mismo sitio) + librerías externas del calendario
  const isSameOriginStatic =
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/assets/') ||
      url.pathname.startsWith('/uploads/') ||
      url.pathname.startsWith('/calendar/') ||
      url.pathname === '/manifest-calendar.json');

  const isExternalLib =
    url.hostname === 'cdnjs.cloudflare.com' ||
    url.hostname === 'cdn.jsdelivr.net' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';

  if (isSameOriginStatic || isExternalLib) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = (await cache.match(request)) || (await cache.match(request, { ignoreSearch: true }));
        if (cached) {
          event.waitUntil(
            fetchWithTimeout(request, 4000)
              .then((netRes) => {
                if (netRes && netRes.ok) return cache.put(request, netRes.clone());
              })
              .catch(() => {})
          );
          return cached;
        }

        try {
          const netRes = await fetchWithTimeout(request, 4000);
          if (netRes && (netRes.ok || netRes.type === 'opaque')) {
            cache.put(request, netRes.clone());
          }
          return netRes;
        } catch (err) {
          if (request.destination === 'style') {
            return new Response('', { status: 200, headers: { 'Content-Type': 'text/css' } });
          }
          if (request.destination === 'script') {
            return new Response('', { status: 200, headers: { 'Content-Type': 'application/javascript' } });
          }
          return new Response('', { status: 204 });
        }
      })()
    );
  }
});

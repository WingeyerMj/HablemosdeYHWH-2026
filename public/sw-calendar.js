// Service Worker — Calendario Lunisolar Hablemos de YHWH (100% Offline PWA)
const CACHE_NAME = 'yhwh-calendario-pwa-v15';

async function safeCachePut(cache, key, response) {
  try {
    if (!response || response.status === 206) return;
    if (response.status !== 200 && response.type !== 'opaque') return;
    if (response.headers && response.headers.has('content-range')) return;
    await cache.put(key, response);
  } catch (_) {
    // Evitar errores en consola por respuestas parciales (206) o límites de caché
  }
}

// Navigation requests use redirect:manual. A cached response that followed a
// redirect cannot be returned to them: Chromium rejects it with ERR_FAILED.
// Rebuild the final HTML response to remove its internal redirected URL list.
async function calendarDocumentResponse(response) {
  if (!response || !response.ok || !response.headers.get('content-type')?.includes('text/html')) return response;
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.delete('etag');
  let html = await response.text();
  // The public server serves /calendar/ with relative js/, css/ and icons/.
  // Keep that base when the offline document is opened at /calendar?pwa=1.
  if (!/<base\b/i.test(html)) html = html.replace(/<head\b[^>]*>/i, '$&<base href="/calendar/">');
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function isCalendarDocument(url) {
  return /^\/calendar\/?$/.test(new URL(url, self.location.origin).pathname);
}

const CORE_CALENDAR_ASSETS = [
  '/calendar',
  '/calendar?pwa=1',
  '/manifest-calendar.json',
  '/manifest.webmanifest',
  '/assets/js/pwa-manager.js',
  '/assets/calendar/css/style.css',
  '/assets/calendar/js/main.js',
  '/assets/calendar/js/windowsInstaller.js',
  '/assets/calendar/icons/calendar.ico',
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

// Both public URL layouts are in use; cache the URLs actually used by the
// standalone calendar as well as the integrated backend template.
CORE_CALENDAR_ASSETS.push(...CORE_CALENDAR_ASSETS
  .filter(url => url.startsWith('/assets/calendar/'))
  .map(url => url.replace('/assets/calendar/', '/calendar/')));

async function cacheUrl(cache, url, options) {
  try {
    const res = await fetchWithTimeout(new Request(url, options || { cache: 'reload' }), 8000);
    if (res && (res.status === 200 || res.type === 'opaque')) {
      await safeCachePut(cache, url, isCalendarDocument(url) ? await calendarDocumentResponse(res) : res);
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
          if ((key.startsWith('yhwh-calendario-pwa-') || key.startsWith('hablemos-calendar-')) && key !== CACHE_NAME) {
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
  if (event.data.type === 'CLEAR_PWA_CACHE') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(key => key.startsWith('yhwh-calendario-pwa-') || key.startsWith('hablemos-calendar-')).map(key => caches.delete(key)));
      const cache = await caches.open(CACHE_NAME);
      await Promise.allSettled(CORE_CALENDAR_ASSETS.map(url => cacheUrl(cache, url)));
      if (event.source) event.source.postMessage({ type: 'PWA_CACHE_CLEARED' });
    })());
    return;
  }
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
  if (request.headers && request.headers.has('range')) return;
  if (request.destination === 'video' || request.destination === 'audio') return;

  const url = new URL(request.url);
  if (/\.(mp4|webm|ogg|mp3|wav|m4a|aac|flac)$/i.test(url.pathname)) return;

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
              .then(async (netRes) => {
                if (netRes && netRes.status === 200) {
                  const documentResponse = await calendarDocumentResponse(netRes);
                  return Promise.all([
                    safeCachePut(cache, '/calendar', documentResponse.clone()),
                    safeCachePut(cache, '/calendar?pwa=1', documentResponse.clone())
                  ]);
                }
              })
              .catch(() => {})
          );
          return calendarDocumentResponse(cached);
        }

        // Primera visita sin caché previa: ir a la red y guardar
        try {
          const networkResponse = await fetchWithTimeout(new Request(request.url, {
            cache: 'reload', credentials: 'same-origin', redirect: 'follow'
          }), 6000);
          if (networkResponse && networkResponse.status === 200) {
            const documentResponse = await calendarDocumentResponse(networkResponse);
            await Promise.all([
              safeCachePut(cache, '/calendar', documentResponse.clone()),
              safeCachePut(cache, '/calendar?pwa=1', documentResponse.clone())
            ]);
            return documentResponse;
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
              .then(async (netRes) => {
                if (netRes && netRes.status === 200) return safeCachePut(cache, request, netRes.clone());
              })
              .catch(() => {})
          );
          return cached;
        }

        try {
          const netRes = await fetchWithTimeout(request, 4000);
          if (netRes && (netRes.status === 200 || netRes.type === 'opaque')) {
            await safeCachePut(cache, request, netRes.clone());
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


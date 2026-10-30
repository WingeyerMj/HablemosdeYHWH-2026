(() => {
  if (!('serviceWorker' in navigator)) return;

  const storage = window.localStorage;
  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    navigator.standalone === true ||
    new URLSearchParams(window.location.search).get('pwa') === '1';

  const isInstalledDevice = () =>
    isStandalone() || storage.getItem('yhwhCalendarInstalled') === '1';

  const installationId = (() => {
    let id = storage.getItem('hy_pwa_installation_id');
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
      storage.setItem('hy_pwa_installation_id', id);
    }
    return id;
  })();

  let pendingVersion = null;
  let updateRequested = false;
  let reloadStarted = false;

  const reloadAfterRequestedUpdate = () => {
    if (!updateRequested || reloadStarted) return;
    reloadStarted = true;
    if (pendingVersion) {
      storage.setItem('hy_pwa_content_version', pendingVersion);
    }
    location.reload();
  };

  const postActivity = async (version, eventName) => {
    try {
      await fetch('/api/pwa/installations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installationId,
          platform: navigator.userAgentData?.platform || navigator.platform || 'Desconocido',
          displayMode: (isStandalone() || eventName === 'installed') ? 'standalone' : 'browser',
          userAgent: navigator.userAgent,
          appVersion: version || storage.getItem('hy_pwa_content_version') || '',
          event: eventName
        }),
        keepalive: true
      });
    } catch (_) {}
  };

  const ensureNoticeStyles = () => {
    if (document.getElementById('pwa-notice-styles')) return;
    const style = document.createElement('style');
    style.id = 'pwa-notice-styles';
    style.textContent = '#pwa-update-notice{position:fixed;z-index:10050;right:18px;bottom:18px;max-width:min(390px,calc(100vw - 36px));border:1px solid rgba(212,184,149,.65);border-radius:14px;background:#171717;color:#fff;box-shadow:0 14px 38px rgba(0,0,0,.55);padding:16px 18px}#pwa-update-notice strong{display:block;color:#e8c99f;margin-bottom:5px}#pwa-update-notice p{margin:0 0 12px;font-size:.9rem;color:#ddd}#pwa-update-notice .actions{display:flex;gap:8px;justify-content:flex-end}#pwa-update-notice button{border:0;padding:9px 13px;border-radius:8px;font-weight:700;cursor:pointer}#pwa-update-now{background:#d4b895;color:#111}#pwa-update-later{background:#333;color:#fff}@media(max-width:576px){#pwa-update-notice{right:10px;bottom:10px;max-width:calc(100vw - 20px)}}';
    document.head.appendChild(style);
  };

  const escapeHtml = str => String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const showUpdateNotice = (version, customMessage) => {
    if (!isInstalledDevice()) return;
    if (document.getElementById('pwa-update-notice')) return;
    pendingVersion = version;
    ensureNoticeStyles();
    const msg = escapeHtml(customMessage || 'Hay una versión nueva. Actualizá ahora para descargarla y seguir usándola sin conexión.');
    const box = document.createElement('aside');
    box.id = 'pwa-update-notice';
    box.setAttribute('role', 'status');
    box.innerHTML = `<strong>📅 Actualización del calendario disponible</strong><p>${msg}</p><div class="actions"><button type="button" id="pwa-update-later">Más tarde</button><button type="button" id="pwa-update-now">Actualizar ahora</button></div>`;
    document.body.appendChild(box);
    box.querySelector('#pwa-update-later').addEventListener('click', () => {
      try { sessionStorage.setItem('hy_pwa_dismissed_version', version); } catch (_) {}
      box.remove();
    });
    box.querySelector('#pwa-update-now').addEventListener('click', async () => {
      updateRequested = true;
      storage.setItem('hy_pwa_content_version', version);
      await postActivity(version, 'updated');
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      else if (navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_PWA_CACHE' });
      else reloadAfterRequestedUpdate();
    });
  };

  const checkVersion = async () => {
    if (!navigator.onLine) return;
    try {
      const response = await fetch('/api/pwa/version', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (!data || !data.version) return;

      const currentLocalVersion = storage.getItem('hy_pwa_content_version');
      if (!currentLocalVersion) {
        storage.setItem('hy_pwa_content_version', data.version);
      }

      if (isStandalone()) {
        postActivity(storage.getItem('hy_pwa_content_version') || data.version, 'heartbeat');
      }

      // Solo mostrar la alerta si fue disparada manualmente desde el Dashboard (alertActive === true)
      // y únicamente en dispositivos que tienen instalado el calendario.
      if (
        data.alertActive === true &&
        isInstalledDevice() &&
        storage.getItem('hy_pwa_content_version') !== data.version &&
        sessionStorage.getItem('hy_pwa_dismissed_version') !== data.version
      ) {
        showUpdateNotice(data.version, data.alertMessage);
      }
    } catch (_) {}
  };

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    window.__deferredCalendarInstallPrompt = event;
  });

  window.addEventListener('appinstalled', () => {
    try { storage.setItem('yhwhCalendarInstalled', '1'); } catch (_) {}
    postActivity(storage.getItem('hy_pwa_content_version'), 'installed');
  });
  window.addEventListener('online', checkVersion);
  window.addEventListener('focus', checkVersion);
  navigator.serviceWorker.addEventListener('controllerchange', reloadAfterRequestedUpdate);
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'PWA_CACHE_CLEARED') reloadAfterRequestedUpdate();
  });

  navigator.serviceWorker.register('/sw-calendar.js', { scope: '/', updateViaCache: 'none' }).then(registration => {
    registration.update();
  }).catch(() => {});

  checkVersion();
  setInterval(checkVersion, 2 * 60 * 1000);
})();

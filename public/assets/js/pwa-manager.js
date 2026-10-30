(() => {
  if (!('serviceWorker' in navigator)) return;

  const storage = window.localStorage;
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const installationId = (() => {
    let id = storage.getItem('hy_pwa_installation_id');
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
      storage.setItem('hy_pwa_installation_id', id);
    }
    return id;
  })();

  let deferredInstallPrompt = null;
  let pendingVersion = null;

  const postActivity = async (version, eventName) => {
    try {
      await fetch('/api/pwa/installations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installationId,
          platform: navigator.userAgentData?.platform || navigator.platform || 'Desconocido',
          displayMode: isStandalone() ? 'standalone' : 'browser',
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
    style.textContent = '#pwa-update-notice,#pwa-install-button{position:fixed;z-index:10050;right:18px;bottom:18px;max-width:min(390px,calc(100vw - 36px));border:1px solid rgba(212,184,149,.65);border-radius:14px;background:#171717;color:#fff;box-shadow:0 14px 38px rgba(0,0,0,.55)}#pwa-update-notice{padding:16px 18px}#pwa-update-notice strong{display:block;color:#e8c99f;margin-bottom:5px}#pwa-update-notice p{margin:0 0 12px;font-size:.9rem;color:#ddd}#pwa-update-notice .actions{display:flex;gap:8px;justify-content:flex-end}#pwa-update-notice button,#pwa-install-button{border:0;padding:9px 13px;border-radius:8px;font-weight:700}#pwa-update-now{background:#d4b895;color:#111}#pwa-update-later{background:#333;color:#fff}#pwa-install-button{padding:12px 16px;background:#d4b895;color:#111;font-size:.9rem}@media(max-width:576px){#pwa-update-notice,#pwa-install-button{right:10px;bottom:10px;max-width:calc(100vw - 20px)}}';
    document.head.appendChild(style);
  };

  const showUpdateNotice = version => {
    if (document.getElementById('pwa-update-notice')) return;
    pendingVersion = version;
    ensureNoticeStyles();
    const box = document.createElement('aside');
    box.id = 'pwa-update-notice';
    box.setAttribute('role', 'status');
    box.innerHTML = '<strong>📅 Actualización del calendario disponible</strong><p>Hay una versión nueva. Actualizá ahora para descargarla y seguir usándola sin conexión.</p><div class="actions"><button type="button" id="pwa-update-later">Más tarde</button><button type="button" id="pwa-update-now">Actualizar ahora</button></div>';
    document.body.appendChild(box);
    box.querySelector('#pwa-update-later').addEventListener('click', () => box.remove());
    box.querySelector('#pwa-update-now').addEventListener('click', async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      else if (navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_PWA_CACHE' });
      else location.reload();
    });
  };

  const checkVersion = async () => {
    if (!navigator.onLine) return;
    try {
      const response = await fetch('/api/pwa/version', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const previous = storage.getItem('hy_pwa_content_version');
      if (!previous) storage.setItem('hy_pwa_content_version', data.version);
      else if (previous !== data.version) showUpdateNotice(data.version);
      if (isStandalone()) postActivity(data.version, 'heartbeat');
    } catch (_) {}
  };

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (!location.pathname.startsWith('/calendar') || isStandalone()) return;
    ensureNoticeStyles();
    const button = document.createElement('button');
    button.id = 'pwa-install-button';
    button.type = 'button';
    button.textContent = '⬇️ Instalar calendario sin conexión';
    document.body.appendChild(button);
    button.addEventListener('click', async () => {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      button.remove();
    });
  });

  window.addEventListener('appinstalled', () => postActivity(storage.getItem('hy_pwa_content_version'), 'installed'));
  window.addEventListener('online', checkVersion);
  window.addEventListener('focus', checkVersion);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (pendingVersion) storage.setItem('hy_pwa_content_version', pendingVersion);
    location.reload();
  });
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'PWA_CACHE_CLEARED') {
      if (pendingVersion) storage.setItem('hy_pwa_content_version', pendingVersion);
      location.reload();
    }
  });

  navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).then(registration => {
    registration.update();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdateNotice('service-worker-update');
      });
    });
  }).catch(() => {});

  checkVersion();
  setInterval(checkVersion, 5 * 60 * 1000);
})();


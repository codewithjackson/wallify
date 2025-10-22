// ✅ Wallify Unified Service Worker
const CACHE_NAME = 'wallify-cache-v3';
const OFFLINE_URL = '/offline.html';
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 🔔 Notify all active clients (for optional toast updates)
function notifyClients(type, message) {
  self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type, message });
    });
  });
}

// 🧩 Install event — pre-cache core assets
self.addEventListener('install', (event) => {
  console.log('📦 Installing Wallify service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => notifyClients('INFO', '✅ Core assets cached successfully!'))
      .catch(() => notifyClients('ERROR', '❌ Failed to cache core assets.'))
  );
  self.skipWaiting();
});

// 🔄 Activate event — cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('♻️ Activating new service worker...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🗑 Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => {
      self.clients.claim();
      notifyClients('INFO', 'Service worker activated!');
    })
  );
});

// 🌐 Fetch event — smart caching strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Cache-first for images & videos
  if (req.destination === 'image' || req.destination === 'video') {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((networkRes) => {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
            notifyClients('DOWNLOAD_COMPLETE', `${req.destination} cached for offline use.`);
            return networkRes;
          })
          .catch(() => cached || caches.match(OFFLINE_URL));
      })
    );
    return;
  }

  // Network-first for everything else
  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        const copy = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return networkRes;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || caches.match(OFFLINE_URL))
      )
  );
});

// 💬 Message listener for update requests
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 📲 Install prompt support
self.addEventListener('beforeinstallprompt', (e) => {
  console.log('📱 Install prompt captured by service worker.');
  e.preventDefault();
  self.deferredPrompt = e;
  notifyClients('INSTALL_READY', 'App install prompt captured.');
});
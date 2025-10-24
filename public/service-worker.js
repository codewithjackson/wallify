const CACHE_NAME = 'wallify-cache-v1';
const ASSETS_TO_CACHE = [
  '/', // main page
  '/favicon.ico',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 🧠 Install service worker
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ Caching core assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 🚀 Activate service worker
self.addEventListener('activate', (event) => {
  console.log('🔁 Service Worker: Activated');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log(`🗑️ Removing old cache: ${key}`);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ⚡ Fetch event: network-first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        return (
          cached ||
          new Response('You are offline. Please reconnect.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          })
        );
      })
  );
});

// 🔔 Listen for skipWaiting message (for app updates)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
const CACHE_NAME = 'chinese-practice-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './lesson_metadata.js',
  './vocab_data.js',
  './grammar_data.js',
  './manifest.json',
  './icon.svg',
  './vocab_images/placeholder.svg'
];

// Install: Pre-cache application shell and data
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first strategy with offline fallbacks
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignore browser extensions or non-http schemes
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache if connected
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {
          // Offline, quietly ignore background revalidation failure
        });
        return cachedResponse;
      }

      // Not in cache: fetch from network and store in cache
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return networkResponse;
      }).catch(() => {
        // Network failed (airplane mode / offline)
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        if (request.destination === 'image' || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg')) {
          return caches.match('./vocab_images/placeholder.svg');
        }
      });
    })
  );
});

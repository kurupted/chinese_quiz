const CACHE_NAME = 'chinese-practice-v3';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './style.css?v=3',
  './app.js?v=3',
  './lesson_metadata.js?v=3',
  './vocab_data.js?v=3',
  './grammar_data.js?v=3',
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

// Fetch: Network-first for app shell/scripts/styles, cache-first for images, with offline fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignore browser extensions or non-http schemes
  if (!url.protocol.startsWith('http')) return;

  const isImage = request.destination === 'image' || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.svg');

  if (isImage) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch(() => caches.match('./vocab_images/placeholder.svg'));
      })
    );
    return;
  }

  // Network-first for HTML, CSS, JS, JSON so updates appear immediately when online
  event.respondWith(
    fetch(request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
      }
      return networkResponse;
    }).catch(() => {
      return caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

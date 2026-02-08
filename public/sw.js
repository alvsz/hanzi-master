const CACHE_NAME = 'hanzi-master-v11';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

/**
 * Installation Event
 * We ensure the installation promise always resolves, even if some assets fail to cache.
 * We avoid Promise.allSettled to ensure compatibility with older environments that might be 
 * used in specific cloud/sandboxed shells.
 */
self.addEventListener('install', (event) => {
  console.log('SW: Install event triggered.');
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Pre-caching core assets...');
        // Individually catch each add operation so one failure doesn't stop the whole process
        const promises = ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`SW: Could not cache ${url} during install:`, err);
            // Return null so the overall Promise.all still resolves
            return null;
          });
        });
        return Promise.all(promises);
      })
      .then(() => {
        console.log('SW: Installation logic completed successfully.');
      })
      .catch((err) => {
        // We catch everything to ensure the Service Worker doesn't enter an 'error' state
        console.error('SW: Critical error during installation, but allowing SW to start:', err);
      })
  );
});

/**
 * Activation Event
 * Cleans up old caches.
 */
self.addEventListener('activate', (event) => {
  console.log('SW: Activate event triggered.');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => {
      console.log('SW: Activation complete, taking control of clients.');
      return self.clients.claim();
    })
  );
});

/**
 * Fetch Event
 * Network-first-then-cache strategy for the main application shell, 
 * but cache-first for assets if already known.
 */
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for web resources
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If found in cache, return it immediately
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise try network
      return fetch(event.request).then((response) => {
        // We could cache new results here, but staying simple for now to avoid quota issues
        return response;
      }).catch((err) => {
        // Fallback for navigation requests when offline
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        // For other resources, just let it fail naturally
        console.debug('SW: Fetch failed and no cache available for:', event.request.url);
        throw err;
      });
    })
  );
});

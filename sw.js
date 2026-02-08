const CACHE_NAME = 'hanzi-master-v2';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'index.tsx',
  'App.tsx',
  'data.ts',
  'types.ts',
  'components/Header.tsx',
  'components/LevelSelector.tsx',
  'components/Flashcard.tsx',
  'components/Stats.tsx',
  'components/Search.tsx',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Estratégia: Cache First, falling back to Network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        // Se falhar e for uma navegação, retorna o index.html do cache
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});

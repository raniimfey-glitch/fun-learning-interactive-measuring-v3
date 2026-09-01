const CACHE_NAME = 'interactive-capacities-v2';
const STATIC_CACHE_NAME = 'interactive-capacities-static-v2';
const FONT_CACHE_NAME = 'interactive-capacities-fonts-v2';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/screenshots/screenshot-explore-wide.png',
  '/screenshots/screenshot-pour-wide.png',
  '/screenshots/screenshot-quiz-narrow.png',
  '/screenshots/screenshot-balance-narrow.png'
];

// Install Event - Pre-cache essential app shell assets safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        // Use individual adds so a single missing optional asset won't fail the whole install
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            fetch(url, { cache: 'no-cache' }).then((response) => {
              if (response && response.status === 200) {
                return cache.put(url, response);
              }
            })
          )
        );
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('Service worker pre-cache warning:', err);
      })
  );
});

// Activate Event - Clean up stale legacy caches and claim clients immediately
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, STATIC_CACHE_NAME, FONT_CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !currentCaches.includes(name))
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event - Strategic caching tailored for reliability, speed, and offline access
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Never intercept API calls, non-GET methods, or special schemes (chrome-extension, blob, data)
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.protocol.startsWith('chrome-extension') ||
    url.protocol.startsWith('blob:')
  ) {
    return;
  }

  // 2. Google Web Fonts - Cache-First with background revalidation
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. Navigation Requests (HTML documents) - Network-First with Cache Fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline, check cache for requested page, root, or offline fallback
          const cachedNavigate = await caches.match(event.request);
          if (cachedNavigate) return cachedNavigate;

          const cachedRoot = await caches.match('/');
          if (cachedRoot) return cachedRoot;

          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) return cachedIndex;

          const cachedOffline = await caches.match('/offline.html');
          if (cachedOffline) return cachedOffline;

          return new Response('Offline - No connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' }),
          });
        })
    );
    return;
  }

  // 4. Static Assets (JS, CSS, Images, Icons, Manifest) - Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type !== 'opaque'
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Return cached response if network fails
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Support explicit skip-waiting message from UI if needed
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

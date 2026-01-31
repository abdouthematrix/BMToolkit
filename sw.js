// sw.js - Service Worker for PWA

const CACHE_NAME = 'bmtoolkit-v1';
const FONTS_CACHE_NAME = 'bmtoolkit-fonts-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/rtl.css',
  './js/app.js',
  './js/router.js',
  './js/i18n.js',
  './js/firebase-config.js',
  './js/services/auth.js',
  './js/services/firestore.js',
  './js/services/financial-calculator.js',
  './js/pages/home.js',
  './js/pages/secured-loans.js',
  './js/pages/unsecured-loans.js',
  './js/pages/advancedtools.js',
  './js/pages/login.js',
  './js/pages/admin.js'
];

// Google Fonts to cache
const fontsToCache = [
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800&display=swap',
  'https://fonts.gstatic.com/s/manrope/v15/cHpsfuQw1Vc86XVj_dCyVIVIGQkD7IrY.0.woff2',
  'https://fonts.gstatic.com/s/manrope/v15/cHpsfuQw1Vc86XVj_dCyVIVIGQkD7IrY.1.woff2',
  'https://fonts.gstatic.com/s/cairo/v28/SLXsc1NY6HkvangtZmHyx44.0.woff2',
  'https://fonts.gstatic.com/s/cairo/v28/SLXsc1NZ6HkvangtZmHyV4YE.0.woff2'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Opened cache');
          return cache.addAll(urlsToCache);
        })
        .catch((error) => {
          console.error('Cache installation failed:', error);
        }),
      caches.open(FONTS_CACHE_NAME)
        .then((cache) => {
          console.log('Opened fonts cache');
          return cache.addAll(fontsToCache);
        })
        .catch((error) => {
          console.error('Fonts cache installation failed:', error);
        })
    ])
  );
  self.skipWaiting();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Handle Google Fonts with stale-while-revalidate strategy
  if (event.request.url.includes('fonts.googleapis.com') || event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }

          return fetch(event.request).then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(FONTS_CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
        })
        .catch(() => {
          console.warn('Fonts unavailable offline');
        })
    );
    return;
  }

  // Skip Firebase and other external API calls
  if (
    event.request.url.includes('firebase') ||
    event.request.url.includes('firestore') ||
    event.request.url.includes('googleapis') ||
    event.request.url.includes('cdnjs')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('./index.html');
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== FONTS_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

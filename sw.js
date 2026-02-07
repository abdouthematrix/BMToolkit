// sw.js - Service Worker for PWA

const CACHE_NAME = 'bmtoolkit-v1';
const FONTS_CACHE_NAME = 'bmtoolkit-fonts-v1';
// 1. Define the Firebase Modular SDKs to cache
const FIREBASE_SDKS = [
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
];
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
                    // Cache local files AND Firebase SDKs
                    return cache.addAll([...urlsToCache, ...FIREBASE_SDKS]);
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

    const url = event.request.url;

    // 2. Handle Firebase SDKs (Cache First strategy)
    // We want to cache the scripts from gstatic.com, but NOT the data calls to googleapis.com
    if (FIREBASE_SDKS.includes(url)) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request).then((fetchResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                });
            })
        );
        return;
    }

    // 3. Ignore Firestore Data / Auth API calls
    // These are dynamic and handled by the SDK's internal offline logic or network
    if (
        url.includes('firestore.googleapis.com') ||
        url.includes('identitytoolkit.googleapis.com') ||
        url.includes('securetoken.googleapis.com')
    ) {
        return; // Let the browser/SDK handle the network request
    }

    // Handle Google Fonts
    if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) return response;
                    return fetch(event.request).then((response) => {
                        if (!response || response.status !== 200) return response;
                        const responseToCache = response.clone();
                        caches.open(FONTS_CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    });
                })
        );
        return;
    }

    // Default Stale-While-Revalidate for app shell
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                });
            })
            .catch(() => {
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

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
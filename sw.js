// sw.js - Service Worker for PWA

const CACHE_NAME = 'bmtoolkit-v2';
const FONTS_CACHE_NAME = 'bmtoolkit-fonts-v2';
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
  './js/pages/admin.js',
  ...FIREBASE_SDKS
];

// Install event - cache core app shell and SDKs
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and storing app shell');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Fetch event - handle dynamic fonts and app shell
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = event.request.url;

    // 1. DYNAMIC GOOGLE FONTS (Cache-First, then Network)
    if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;

                return fetch(event.request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200) return networkResponse;

                    const responseToCache = networkResponse.clone();
                    caches.open(FONTS_CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return networkResponse;
                });
            })
        );
        return;
    }

    // 2. BYPASS FIREBASE DATA CALLS
    // Let the Firebase SDK handle its own data persistence
    if (
        url.includes('firestore.googleapis.com') ||
        url.includes('identitytoolkit.googleapis.com') ||
        url.includes('securetoken.googleapis.com')
    ) {
        return;
    }

    // 3. APP SHELL (Stale-While-Revalidate)
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Fallback to index.html for navigation requests if offline and not in cache
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });

            return cachedResponse || fetchPromise;
        })
    );
});

// Activate event - cleanup
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
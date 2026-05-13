// firebase-config.js - Firebase Configuration

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getAnalytics,
    isSupported as analyticsIsSupported
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    CACHE_SIZE_UNLIMITED
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ─── Firebase config ──────────────────────────────────────────────────────────

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyClI6uex0h6127f91Ui3h59af3yDopijcM",
    authDomain: "bmtoolkit-2026.firebaseapp.com",
    projectId: "bmtoolkit-2026",
    storageBucket: "bmtoolkit-2026.firebasestorage.app",
    messagingSenderId: "550744579418",
    appId: "1:550744579418:web:4b7a0235fba336809fe763",
    measurementId: "G-QZ8BEMRWJ1"
};

const MEASUREMENT_ID = FIREBASE_CONFIG.measurementId;

// ─── GA4 cookie domain ────────────────────────────────────────────────────────
// GitHub Pages is a Public Suffix (*.github.io). Browsers reject cookies scoped
// to ".github.io", so we pin cookie_domain to the exact subdomain.
function resolveGaCookieDomain() {
    const { hostname } = window.location;
    if (hostname.endsWith('.github.io')) return hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'none';
    return 'auto';
}

// ─── Exported service references ──────────────────────────────────────────────
// Populated synchronously for auth/db (no async risk).
// analytics is null until initAnalytics() resolves after page load.
export let auth = null;
export let db = null;
export let analytics = null;

// ─── Core init (auth + firestore only) ───────────────────────────────────────
// Called once by app.js before anything else. Does NOT touch Analytics.
// Keeping this synchronous-style (no await at module scope) ensures the module
// graph always resolves and DOMContentLoaded always fires.

const _app = initializeApp(FIREBASE_CONFIG);

db = initializeFirestore(_app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
    })
});

auth = getAuth(_app);

// ─── Analytics — deferred ─────────────────────────────────────────────────────
//
// ROOT CAUSE of "IDB transaction not active" error:
//
//   Firebase Analytics calls getInstallationEntry() which opens an IndexedDB
//   transaction to read/write the installation ID. When called during the
//   module evaluation phase (especially with a Service Worker active), the IDB
//   transaction is created, then the JS engine yields for other micro/macro
//   tasks (SW fetch handlers, Firestore init, etc.), and by the time the
//   Analytics async callback resumes the transaction has already auto-committed
//   and closed — throwing the DOMException.
//
// FIX: Defer analytics entirely until after 'load' fires. At that point the
//      page is fully interactive, the SW has settled, Firestore is warm, and
//      IDB transactions complete without interference.

export function initAnalytics() {
    // Wait for the page 'load' event so the browser is fully settled.
    // If 'load' already fired (e.g. this is called late) run immediately.
    const run = async () => {
        try {
            if (!(await analyticsIsSupported())) return;

            analytics = getAnalytics(_app);

            // Pin cookie_domain — must happen right after getAnalytics()
            if (typeof window.gtag === 'function') {
                window.gtag('config', MEASUREMENT_ID, {
                    cookie_domain: resolveGaCookieDomain(),
                    cookie_flags: 'SameSite=None;Secure'
                });
            }

            console.log('[Firebase] Analytics ready');
        } catch (err) {
            // Analytics is non-critical — log and move on. Never rethrow.
            console.warn('[Firebase] Analytics init skipped:', err.message);
        }
    };

    if (document.readyState === 'complete') {
        // Page already loaded — defer one task so IDB is fully idle
        setTimeout(run, 0);
    } else {
        window.addEventListener('load', () => setTimeout(run, 0), { once: true });
    }
}
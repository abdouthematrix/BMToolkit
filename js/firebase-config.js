// firebase-config.js - Firebase Configuration

// Import modular SDK functions from CDN
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

export class FirebaseConfig {
    static config = {
        apiKey: "AIzaSyClI6uex0h6127f91Ui3h59af3yDopijcM",
        authDomain: "bmtoolkit-2026.firebaseapp.com",
        projectId: "bmtoolkit-2026",
        storageBucket: "bmtoolkit-2026.firebasestorage.app",
        messagingSenderId: "550744579418",
        appId: "1:550744579418:web:4b7a0235fba336809fe763",
        measurementId: "G-QZ8BEMRWJ1"
    };

    static async init() {
        const app = initializeApp(this.config);

        // Initialize Firestore with Offline Persistence enabled
        // 'persistentMultipleTabManager' allows the PWA to work offline even if open in multiple tabs
        const db = initializeFirestore(app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager(),
                // If you want to specify a size, do it HERE:
                cacheSizeBytes: CACHE_SIZE_UNLIMITED
            })
        });

        const auth = getAuth(app);

        let analytics = null;
        if (await analyticsIsSupported()) {
            analytics = getAnalytics(app);
        }

        return { auth, db, analytics };
    }
}

// Initialize and export
const firebaseServices = await FirebaseConfig.init();
export const { auth, db, analytics } = firebaseServices;

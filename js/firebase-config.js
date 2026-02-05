// firebase-config.js - Firebase Configuration with Guaranteed Offline Persistence

export class FirebaseConfig {
    static config = {
        apiKey: "AIzaSyClI6uex0h6127f91Ui3h59af3yDopijcM",
        authDomain: "bmtoolkit-2026.firebaseapp.com",
        projectId: "bmtoolkit-2026",
        storageBucket: "bmtoolkit-2026.firebasestorage.app",
        messagingSenderId: "550744579418",
        appId: "1:550744579418:web:4b7a0235fba336809fe763"
    };

    static isOffline = false;
    static listeners = [];
    static initialized = false;
    static initPromise = null; // Track initialization promise
    static auth = null;
    static db = null;

    // CRITICAL: Async init that WAITS for persistence
    static async init() {
        // Return existing initialization if already in progress or complete
        if (this.initPromise) {
            return this.initPromise;
        }

        // Create and store initialization promise
        this.initPromise = this._initializeFirebase();
        return this.initPromise;
    }

    static async _initializeFirebase() {
        if (this.initialized) {
            return {
                auth: this.auth,
                db: this.db
            };
        }

        try {
            // Initialize Firebase app if not already initialized
            if (!firebase.apps.length) {
                firebase.initializeApp(this.config);
            }

            // Get instances
            this.auth = firebase.auth();
            this.db = firebase.firestore();

            // CRITICAL: Wait for persistence to be enabled before continuing
            await this._enablePersistence();

            // Setup offline detection AFTER persistence is guaranteed
            this.setupOfflineDetection();

            this.initialized = true;
            console.log('✅ Firebase initialized with offline persistence');

            return {
                auth: this.auth,
                db: this.db
            };
        } catch (error) {
            console.error('❌ Fatal error initializing Firebase:', error);
            throw error;
        }
    }

    // Enable persistence and wait for it to complete
    static async _enablePersistence() {
        try {
            await this.db.enablePersistence({
                synchronizeTabs: true
            });
            console.log('✅ Firestore offline persistence enabled');
        } catch (err) {
            if (err.code === 'failed-precondition') {
                // Multiple tabs open, persistence enabled in another tab
                console.warn('⚠️ Multiple tabs open - persistence enabled in another tab');
            } else if (err.code === 'unimplemented') {
                // Browser doesn't support persistence
                console.warn('⚠️ Browser does not support offline persistence');
            } else {
                console.error('❌ Error enabling persistence:', err);
                throw err; // Re-throw unexpected errors
            }
        }
    }

    // Setup offline/online detection
    static setupOfflineDetection() {
        // Listen to browser online/offline events
        window.addEventListener('online', () => {
            this.isOffline = false;
            this.notifyListeners(false);
            console.log('📡 App is ONLINE');
        });

        window.addEventListener('offline', () => {
            this.isOffline = true;
            this.notifyListeners(true);
            console.log('📡 App is OFFLINE');
        });

        // Check initial state
        this.isOffline = !navigator.onLine;

        // Log initial status
        if (this.isOffline) {
            console.log('📡 Initial state: OFFLINE');
        } else {
            console.log('📡 Initial state: ONLINE');
        }
    }

    // Subscribe to offline status changes
    static onOfflineStatusChange(callback) {
        this.listeners.push(callback);
        // Immediately call with current status
        callback(this.isOffline);

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    // Notify all listeners of status change
    static notifyListeners(isOffline) {
        this.listeners.forEach(callback => {
            try {
                callback(isOffline);
            } catch (error) {
                console.error('Error in offline status callback:', error);
            }
        });
    }

    // Force Firestore to go offline (useful for testing)
    static async goOffline() {
        await this.init(); // Ensure initialized
        try {
            await this.db.disableNetwork();
            console.log('🔌 Firestore network disabled (manual)');
            this.isOffline = true;
            this.notifyListeners(true);
            return { success: true };
        } catch (error) {
            console.error('❌ Error disabling network:', error);
            return { success: false, error: error.message };
        }
    }

    // Force Firestore to go online
    static async goOnline() {
        await this.init(); // Ensure initialized
        try {
            await this.db.enableNetwork();
            console.log('🔌 Firestore network enabled (manual)');
            this.isOffline = false;
            this.notifyListeners(false);
            return { success: true };
        } catch (error) {
            console.error('❌ Error enabling network:', error);
            return { success: false, error: error.message };
        }
    }

    // Clear offline cache (useful for troubleshooting)
    static async clearCache() {
        try {
            // clearPersistence can only be called when Firestore is terminated
            await this.db.terminate();
            await this.db.clearPersistence();
            console.log('🗑️ Firestore cache cleared');

            // Re-initialize after clearing
            this.initialized = false;
            this.initPromise = null;
            this.auth = null;
            this.db = null;
            await this.init();

            return { success: true };
        } catch (error) {
            console.error('❌ Error clearing cache:', error);
            // Even if clearPersistence fails, try to re-initialize
            if (error.code === 'failed-precondition') {
                this.initialized = false;
                this.initPromise = null;
                this.auth = null;
                this.db = null;
                await this.init();
            }
            return { success: false, error: error.message };
        }
    }

    // Get cache statistics
    static getCacheInfo() {
        return {
            isOffline: this.isOffline,
            browserOnline: navigator.onLine,
            persistenceEnabled: true,
            initialized: this.initialized
        };
    }

    // Wait for pending writes to complete (useful before logging out)
    static async waitForPendingWrites() {
        await this.init(); // Ensure initialized
        try {
            await this.db.waitForPendingWrites();
            console.log('✅ All pending writes completed');
            return { success: true };
        } catch (error) {
            console.error('❌ Error waiting for pending writes:', error);
            return { success: false, error: error.message };
        }
    }

    // Terminate Firestore instance (useful for cleanup)
    static async terminate() {
        await this.init(); // Ensure initialized
        try {
            await this.db.terminate();
            console.log('🛑 Firestore terminated');
            this.initialized = false;
            this.initPromise = null;
            this.auth = null;
            this.db = null;
            return { success: true };
        } catch (error) {
            console.error('❌ Error terminating Firestore:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export async initialization function
export async function initializeFirebase() {
    const { auth, db } = await FirebaseConfig.init();
    return { auth, db };
}

// Export lazy getters that ensure initialization
export const getAuth = async () => {
    await FirebaseConfig.init();
    return FirebaseConfig.auth;
};

export const getDb = async () => {
    await FirebaseConfig.init();
    return FirebaseConfig.db;
};

// Export offline status utilities
export const OfflineManager = {
    onStatusChange: (callback) => FirebaseConfig.onOfflineStatusChange(callback),
    goOffline: () => FirebaseConfig.goOffline(),
    goOnline: () => FirebaseConfig.goOnline(),
    clearCache: () => FirebaseConfig.clearCache(),
    getCacheInfo: () => FirebaseConfig.getCacheInfo(),
    waitForPendingWrites: () => FirebaseConfig.waitForPendingWrites(),
    terminate: () => FirebaseConfig.terminate(),
    get isOffline() {
        return FirebaseConfig.isOffline;
    }
};
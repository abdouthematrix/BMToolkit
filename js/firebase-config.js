// firebase-config.js - Firebase Configuration with CDN Compat API

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

    static init() {
        if (this.initialized) {
            return {
                auth: firebase.auth(),
                db: firebase.firestore()
            };
        }

        if (!firebase.apps.length) {
            // Initialize Firebase
            firebase.initializeApp(this.config);

            // Get Firestore instance
            const db = firebase.firestore();

            // Enable persistence using the compat API
            // This must be called before any other Firestore operations
            db.enablePersistence({ synchronizeTabs: true })
                .then(() => {
                    console.log('✓ Firestore offline persistence enabled');
                    this.setupOfflineDetection();
                })
                .catch((err) => {
                    if (err.code === 'failed-precondition') {
                        console.warn('⚠ Multiple tabs open - persistence enabled in another tab');
                    } else if (err.code === 'unimplemented') {
                        console.warn('⚠ Browser does not support offline persistence');
                    } else {
                        console.error('Error enabling persistence:', err);
                    }
                    this.setupOfflineDetection();
                });

            this.initialized = true;
        }

        return {
            auth: firebase.auth(),
            db: firebase.firestore()
        };
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
    static goOffline() {
        return firebase.firestore().disableNetwork()
            .then(() => {
                console.log('🔌 Firestore network disabled (manual)');
                this.isOffline = true;
                this.notifyListeners(true);
                return { success: true };
            })
            .catch((error) => {
                console.error('❌ Error disabling network:', error);
                return { success: false, error: error.message };
            });
    }

    // Force Firestore to go online
    static goOnline() {
        return firebase.firestore().enableNetwork()
            .then(() => {
                console.log('🔌 Firestore network enabled (manual)');
                this.isOffline = false;
                this.notifyListeners(false);
                return { success: true };
            })
            .catch((error) => {
                console.error('❌ Error enabling network:', error);
                return { success: false, error: error.message };
            });
    }

    // Clear offline cache (useful for troubleshooting)
    static async clearCache() {
        try {
            // clearPersistence can only be called when Firestore is terminated
            const db = firebase.firestore();
            await db.terminate();
            await db.clearPersistence();
            console.log('🗑️ Firestore cache cleared');

            // Re-initialize after clearing
            this.initialized = false;
            this.init();

            return { success: true };
        } catch (error) {
            console.error('❌ Error clearing cache:', error);
            // Even if clearPersistence fails, try to re-initialize
            if (error.code === 'failed-precondition') {
                this.initialized = false;
                this.init();
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
        try {
            await firebase.firestore().waitForPendingWrites();
            console.log('✓ All pending writes completed');
            return { success: true };
        } catch (error) {
            console.error('❌ Error waiting for pending writes:', error);
            return { success: false, error: error.message };
        }
    }

    // Terminate Firestore instance (useful for cleanup)
    static async terminate() {
        try {
            await firebase.firestore().terminate();
            console.log('🛑 Firestore terminated');
            this.initialized = false;
            return { success: true };
        } catch (error) {
            console.error('❌ Error terminating Firestore:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize Firebase (only once)
export const { auth, db } = FirebaseConfig.init();

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
// firebase-config.js - Firebase Configuration with Offline Persistence

export class FirebaseConfig {
    static config = {
        apiKey: "AIzaSyClI6uex0h6127f91Ui3h59af3yDopijcM",
        authDomain: "bmtoolkit-2026.firebaseapp.com",
        projectId: "bmtoolkit-2026",
        storageBucket: "bmtoolkit-2026.firebasestorage.app",
        messagingSenderId: "550744579418",
        appId: "1:550744579418:web:4b7a0235fba336809fe763"
    };

    static init() {
        if (!firebase.apps.length) {
            firebase.initializeApp(this.config);
            
            // Enable offline persistence
            firebase.firestore().enablePersistence({ synchronizeTabs: true })
                .catch((err) => {
                    if (err.code === 'failed-precondition') {
                        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
                    } else if (err.code === 'unimplemented') {
                        console.warn('The current browser does not support persistence.');
                    }
                });
        }
        return {
            auth: firebase.auth(),
            db: firebase.firestore()
        };
    }
}

// Initialize Firebase
export const { auth, db } = FirebaseConfig.init();
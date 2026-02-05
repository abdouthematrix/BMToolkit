// auth.js - Authentication Service with Async Initialization

import { getAuth } from '../firebase-config.js';

export class AuthService {
    static currentUser = null;
    static isAdmin = false;
    static authInstance = null;
    static initialized = false;

    // CRITICAL: Ensure auth is initialized before use
    static async getAuthInstance() {
        if (!this.authInstance) {
            this.authInstance = await getAuth();
        }
        return this.authInstance;
    }

    // Check if user is authenticated
    static isAuthenticated() {
        return this.currentUser !== null;
    }

    // Initialize auth state listener
    static async init() {
        try {
            // Wait for auth instance to be ready
            const auth = await this.getAuthInstance();

            return new Promise((resolve) => {
                auth.onAuthStateChanged((user) => {
                    this.currentUser = user;
                    this.initialized = true;
                    this.updateUI();

                    console.log(user ? '✅ User authenticated' : '📭 No user signed in');
                    resolve(user);
                });
            });
        } catch (error) {
            console.error('❌ Error initializing auth:', error);
            throw error;
        }
    }

    // Login with email and password
    static async login(email, password) {
        try {
            // Ensure auth is initialized
            const auth = await this.getAuthInstance();

            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            this.isAdmin = true; // Simple admin check - can be enhanced
            this.updateUI();

            console.log('✅ Login successful:', userCredential.user.email);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, error: error.message };
        }
    }

    // Logout
    static async logout() {
        try {
            // Ensure auth is initialized
            const auth = await this.getAuthInstance();

            await auth.signOut();
            this.currentUser = null;
            this.isAdmin = false;
            this.updateUI();

            console.log('✅ Logout successful');
            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update UI based on auth state
    static updateUI() {
        const userMenu = document.getElementById('user-menu');
        const loginBtn = document.getElementById('login-btn');
        const adminLinks = document.querySelectorAll('.admin-only');

        if (this.currentUser) {
            // User is logged in
            if (userMenu) userMenu.style.display = 'block';
            if (loginBtn) loginBtn.style.display = 'none';

            // Update user name
            const userName = document.getElementById('user-name');
            if (userName) {
                userName.textContent = this.currentUser.displayName || this.currentUser.email.split('@')[0];
            }

            // Show admin links if admin
            if (this.isAdmin) {
                adminLinks.forEach(link => link.style.display = '');
            }
        } else {
            // User is logged out
            if (userMenu) userMenu.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'flex';
            adminLinks.forEach(link => link.style.display = 'none');
        }
    }

    // Get current user
    static getCurrentUser() {
        return this.currentUser;
    }

    // Get ID token for API requests
    static async getIdToken(forceRefresh = false) {
        try {
            if (!this.currentUser) {
                throw new Error('No user logged in');
            }

            const token = await this.currentUser.getIdToken(forceRefresh);
            return { success: true, token };
        } catch (error) {
            console.error('❌ Error getting ID token:', error);
            return { success: false, error: error.message };
        }
    }

    // Check if current user has admin role (enhance this based on your needs)
    static async checkAdminRole() {
        try {
            if (!this.currentUser) {
                return false;
            }

            // Option 1: Check custom claims (recommended for production)
            const idTokenResult = await this.currentUser.getIdTokenResult();
            return idTokenResult.claims.admin === true;

            // Option 2: Simple email-based check (use for development)
            // const adminEmails = ['admin@example.com'];
            // return adminEmails.includes(this.currentUser.email);
        } catch (error) {
            console.error('❌ Error checking admin role:', error);
            return false;
        }
    }
}
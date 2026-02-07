// auth.js - Authentication Service

import { auth } from '../firebase-config.js';

export class AuthService {
    static currentUser = null;
    static isAdmin = false;

    // Check if user is authenticated
    static isAuthenticated() {
        return this.currentUser !== null;
    }

    // Initialize auth state listener
    static init() {
        return new Promise((resolve) => {
            auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.updateUI();
                resolve(user);
            });
        });
    }

    // Login with email and password
    static async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            this.isAdmin = true; // Simple admin check - can be enhanced
            this.updateUI();
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    // Logout
    static async logout() {
        try {
            await auth.signOut();
            this.currentUser = null;
            this.isAdmin = false;
            this.updateUI();
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
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
}

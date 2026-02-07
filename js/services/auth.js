// auth.js - Authentication Service

import { auth } from '../firebase-config.js';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
            onAuthStateChanged(auth, (user) => {
                this.currentUser = user;
                this.updateUI();
                resolve(user);
            });
        });
    }

    // Login with email and password
    static async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            this.currentUser = userCredential.user;
            this.isAdmin = true;
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
            await signOut(auth);
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
            if (userMenu) userMenu.style.display = 'block';
            if (loginBtn) loginBtn.style.display = 'none';

            const userName = document.getElementById('user-name');
            if (userName) {
                userName.textContent = this.currentUser.displayName || this.currentUser.email.split('@')[0];
            }

            if (this.isAdmin) {
                adminLinks.forEach(link => link.style.display = '');
            }
        } else {
            if (userMenu) userMenu.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'flex';
            adminLinks.forEach(link => link.style.display = 'none');
        }
    }

    static getCurrentUser() {
        return this.currentUser;
    }
}
// app.js - Main Application Entry Point with Offline Support

import { Router } from './router.js';
import { i18n } from './i18n.js';
import { AuthService } from './services/auth.js';
import { OfflineManager } from './firebase-config.js';
import { HomePage } from './pages/home.js';
import { SecuredLoansPage } from './pages/secured-loans.js';
import { UnsecuredLoansPage } from './pages/unsecured-loans.js';
import { AdvancedToolsPage } from './pages/advancedtools.js';
import { LoginPage } from './pages/login.js';
import { AdminPage } from './pages/admin.js';

class App {
    constructor() {
        this.router = new Router();
        this.offlineStatusUnsubscribe = null;
        this.setupRoutes();
        this.setupEventListeners();
        this.setupTheme();
        this.setupOfflineIndicator();
    }

    async init() {
        // Initialize Firebase Auth
        await AuthService.init();

        // Initialize i18n
        i18n.init();

        // Setup offline status monitoring
        this.setupOfflineMonitoring();

        // Start routing
        this.router.handleRoute(true);
    }

    setupRoutes() {
        // Public routes
        this.router.register('home', () => HomePage.init(), {
            title: 'BMToolkit - Home'
        });

        this.router.register('secured-loans', () => SecuredLoansPage.init(), {
            title: 'BMToolkit - Secured Loans'
        });

        this.router.register('unsecured-loans', () => UnsecuredLoansPage.init(), {
            title: 'BMToolkit - Unsecured Loans'
        });

        this.router.register('advancedtools', () => AdvancedToolsPage.init(), {
            title: 'BMToolkit - Advanced Tools'
        });

        this.router.register('login', () => LoginPage.init(), {
            title: 'BMToolkit - Login'
        });

        // Protected routes
        this.router.register('admin', () => AdminPage.init(), {
            title: 'BMToolkit - Admin Panel',
            requireAuth: true
        });

        // 404 route
        this.router.register('404', () => {
            this.router.render(`
                <div class="container">
                    <div class="card" style="max-width: 600px; margin: 50px auto; text-align: center;">
                        <div class="card-body">
                            <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--accent); margin-bottom: var(--spacing-lg);"></i>
                            <h2>Page Not Found</h2>
                            <p>The page you're looking for doesn't exist.</p>
                            <button onclick="window.location.hash='home'" class="btn-primary">
                                <i class="fas fa-home"></i>
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            `);
        }, {
            title: 'BMToolkit - Not Found'
        });
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Language toggle
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                i18n.toggleLanguage();
                // Refresh current page to update translations
                this.router.handleRoute(true);
            });
        }

        // User menu dropdown
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        if (userMenuBtn && userMenuDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenuDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userMenuDropdown.classList.remove('show');
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await this.handleLogout();
            });
        }

        // Login button (when not logged in)
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.hash = 'login';
            });
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mainNav = document.getElementById('main-nav');
        if (mobileMenuToggle && mainNav) {
            mobileMenuToggle.addEventListener('click', () => {
                mainNav.classList.toggle('show');
            });

            // Close mobile menu when clicking a link
            mainNav.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    mainNav.classList.remove('show');
                });
            });
        }
    }

    async handleLogout() {
        // Wait for any pending writes before logging out
        const writeResult = await OfflineManager.waitForPendingWrites();
        if (!writeResult.success) {
            console.warn('Some writes may not have completed');
        }

        const result = await AuthService.logout();
        if (result.success) {
            this.showToast(i18n.t('logout-success'), 'success');
            window.location.hash = 'home';
        } else {
            this.showToast(result.error || 'Logout failed', 'error');
        }
    }

    setupTheme() {
        // Load saved theme or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    // Setup offline status indicator in the UI
    setupOfflineIndicator() {
        // Create offline indicator element
        const indicator = document.createElement('div');
        indicator.id = 'offline-indicator';
        indicator.className = 'offline-indicator';
        indicator.innerHTML = `
            <div class="offline-indicator-content">
                <i class="fas fa-wifi-slash"></i>
                <span data-i18n="offline-mode">Offline Mode - Changes will sync when online</span>
            </div>
        `;
        document.body.appendChild(indicator);

        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .offline-indicator {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
                color: white;
                padding: 0.75rem;
                text-align: center;
                font-size: 0.9rem;
                font-weight: 600;
                z-index: 10000;
                transform: translateY(-100%);
                transition: transform 0.3s ease;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }

            .offline-indicator.show {
                transform: translateY(0);
            }

            .offline-indicator-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }

            .offline-indicator i {
                font-size: 1.1rem;
            }

            /* Adjust body padding when offline indicator is shown */
            body.offline-mode {
                padding-top: 3.5rem;
            }

            /* Animation for indicator */
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }

            .offline-indicator.show i {
                animation: pulse 2s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
    }

    // Setup offline status monitoring
    setupOfflineMonitoring() {
        const indicator = document.getElementById('offline-indicator');

        // Subscribe to offline status changes
        this.offlineStatusUnsubscribe = OfflineManager.onStatusChange((isOffline) => {
            if (isOffline) {
                // Show offline indicator
                indicator.classList.add('show');
                document.body.classList.add('offline-mode');
                this.showToast(i18n.t('offline-detected') || 'You are offline. Changes will be saved locally.', 'warning');
                console.log('Application is OFFLINE');
            } else {
                // Hide offline indicator
                indicator.classList.remove('show');
                document.body.classList.remove('offline-mode');
                this.showToast(i18n.t('online-detected') || 'You are back online. Syncing changes...', 'success');
                console.log('Application is ONLINE');
            }
        });
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Cleanup when app is destroyed
    destroy() {
        if (this.offlineStatusUnsubscribe) {
            this.offlineStatusUnsubscribe();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});

// Make app globally accessible
export default App;
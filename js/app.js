// app.js - Main Application Entry Point

import { Router } from './router.js';
import { i18n } from './i18n.js';
import { AuthService } from './services/auth.js';
import { HomePage } from './pages/home.js';
import { LoansPage } from './pages/loans.js';
import { SecuredLoansPage } from './pages/secured-loans.js';
import { UnsecuredLoansPage } from './pages/unsecured-loans.js';
import { CreditCardsPage } from './pages/credit-cards.js';
import { AdvancedToolsPage } from './pages/advancedtools.js';
import { LoginPage } from './pages/login.js';
import { AdminPage } from './pages/admin.js';

class App {
    constructor() {
        this.router = new Router();
        this.setupRoutes();
        this.setupEventListeners();
        this.setupTheme();
    }

    async init() {
        // Initialize Firebase Auth
        await AuthService.init();

        // Initialize i18n
        i18n.init();

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

        this.router.register('loans', () => LoansPage.init(), {
            title: 'BMToolkit - Loans'
        });

        this.router.register('unsecured-loans', () => UnsecuredLoansPage.init(), {
            title: 'BMToolkit - Unsecured Loans'
        });

        this.router.register('credit-cards', () => CreditCardsPage.init(), {
            title: 'BMToolkit - Credit Cards'
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

        // Share button
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.handleShare());
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

        // Listen for the moment the user comes back online
        window.addEventListener('online', async () => {
            console.log("Internet restored. Refreshing cache in background...");

            // Silently fetch fresh data to prime the cache
            await FirestoreService.getConstants();
            await FirestoreService.getProducts();
        });

        window.addEventListener('offline', () => {
            console.log("Working offline: Using cached data.");
        });
    }

    async handleLogout() {
        const result = await AuthService.logout();
        if (result.success) {
            this.showToast(i18n.t('logout-success'), 'success');
            window.location.hash = 'home';
        } else {
            this.showToast(result.error || 'Logout failed', 'error');
        }
    }

    async handleShare() {
        const shareData = {
            title: document.title || i18n.t('app-name'),
            text: i18n.t('share-text'),
            url: window.location.href,
        };

        // Use native Web Share API if available (ideal for PWA / mobile)
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                // User cancelled or share failed — fall through to clipboard
                if (err.name === 'AbortError') return;
            }
        }

        // Fallback: copy URL to clipboard
        try {
            await navigator.clipboard.writeText(shareData.url);
            this.showShareFeedback(true);
        } catch {
            // Last resort: prompt for manual copy
            window.prompt(i18n.t('share-copy-prompt'), shareData.url);
        }
    }

    showShareFeedback(success) {
        const btn = document.getElementById('share-btn');
        const icon = document.getElementById('share-icon');
        if (!btn || !icon) return;

        const originalClass = icon.className;
        const originalTitle = btn.title;

        if (success) {
            icon.className = 'fas fa-check';
            btn.classList.add('share-btn--copied');
            btn.title = i18n.t('share-copied');
            this.showToast(i18n.t('share-copied'), 'success');
        } else {
            icon.className = 'fas fa-xmark';
            btn.classList.add('share-btn--error');
            this.showToast(i18n.t('share-failed'), 'error');
        }

        setTimeout(() => {
            icon.className = originalClass;
            btn.title = originalTitle;
            btn.classList.remove('share-btn--copied', 'share-btn--error');
        }, 2000);
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
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});

// Make app globally accessible
export default App;

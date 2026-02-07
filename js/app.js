// app.js - Main Application Entry Point

import { Router } from './router.js';
import { i18n } from './i18n.js';
import { AuthService } from './services/auth.js';
import { HomePage } from './pages/home.js';
import { SecuredLoansPage } from './pages/secured-loans.js';
import { UnsecuredLoansPage } from './pages/unsecured-loans.js';
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

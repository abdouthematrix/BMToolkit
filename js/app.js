// app.js - Main Application Entry Point

import { Router } from './router.js';
import { i18n } from './i18n.js';
import { AuthService } from './services/auth.js';
import { FirestoreService } from './services/firestore.js';
import { initAnalytics } from './firebase-config.js'; // deferred analytics bootstrapper
import { HomePage } from './pages/home.js';
import { LoansPage } from './pages/loans.js';
import { CashLoansPage } from './pages/cash-loans.js';
import { SecuredLoansPage } from './pages/secured-loans.js';
import { UnsecuredLoansPage } from './pages/unsecured-loans.js';
import { MortgagePage } from './pages/mortgage.js';
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
        try {
            // 1. Auth must be ready before routing so protected routes work
            await AuthService.init();

            // 2. Translations
            i18n.init();

            // 3. Route to the correct page
            this.router.handleRoute(true);

            // 4. Fire-and-forget: Analytics deferred until 'load' event so it
            //    never races with Firestore / IDB during startup
            initAnalytics();

        } catch (err) {
            console.error('[App] init failed:', err);
            this._renderCrashScreen(err);
        }
    }

    /** Last-resort UI shown when init() throws. */
    _renderCrashScreen(err) {
        const content = document.getElementById('app-content');
        if (!content) return;
        content.innerHTML = `
            <div class="container">
                <div class="card" style="max-width:600px;margin:50px auto;text-align:center;">
                    <div class="card-body">
                        <i class="fas fa-exclamation-circle"
                           style="font-size:4rem;color:var(--accent);margin-bottom:var(--spacing-lg);"></i>
                        <h2>Failed to start</h2>
                        <p>Something went wrong during startup. Please refresh the page.</p>
                        <pre style="text-align:left;font-size:.75rem;opacity:.6;white-space:pre-wrap;">${err?.message ?? err}</pre>
                        <button onclick="location.reload()" class="btn-primary" style="margin-top:1rem;">
                            <i class="fas fa-rotate-right"></i> Refresh
                        </button>
                    </div>
                </div>
            </div>`;
    }

    setupRoutes() {
        this.router.register('home', () => HomePage.init(), { title: 'BMToolkit - Home' });
        this.router.register('secured-loans', () => SecuredLoansPage.init(), { title: 'BMToolkit - Secured Loans' });
        this.router.register('loans', () => LoansPage.init(), { title: 'BMToolkit - Loans' });
        this.router.register('cash-loans', () => CashLoansPage.init(), { title: 'BMToolkit - Cash Loans' });
        this.router.register('unsecured-loans', () => UnsecuredLoansPage.init(), { title: 'BMToolkit - Unsecured Loans' });
        this.router.register('mortgage', () => MortgagePage.init(), { title: 'BMToolkit - Mortgage' });
        this.router.register('credit-cards', () => CreditCardsPage.init(), { title: 'BMToolkit - Credit Cards' });
        this.router.register('advancedtools', () => AdvancedToolsPage.init(), { title: 'BMToolkit - Advanced Tools' });
        this.router.register('login', () => LoginPage.init(), { title: 'BMToolkit - Login' });

        // Protected
        this.router.register('admin', () => AdminPage.init(), {
            title: 'BMToolkit - Admin Panel',
            requireAuth: true
        });

        // 404
        this.router.register('404', () => {
            this.router.render(`
                <div class="container">
                    <div class="card" style="max-width:600px;margin:50px auto;text-align:center;">
                        <div class="card-body">
                            <i class="fas fa-exclamation-triangle"
                               style="font-size:4rem;color:var(--accent);margin-bottom:var(--spacing-lg);"></i>
                            <h2>Page Not Found</h2>
                            <p>The page you're looking for doesn't exist.</p>
                            <button onclick="window.location.hash='home'" class="btn-primary">
                                <i class="fas fa-home"></i> Go Home
                            </button>
                        </div>
                    </div>
                </div>`);
        }, { title: 'BMToolkit - Not Found' });
    }

    setupEventListeners() {
        // Theme
        document.getElementById('theme-toggle')
            ?.addEventListener('click', () => this.toggleTheme());

        // Share
        document.getElementById('share-btn')
            ?.addEventListener('click', () => this.handleShare());

        // Language
        document.getElementById('lang-toggle')
            ?.addEventListener('click', () => {
                i18n.toggleLanguage();
                this.router.handleRoute(true);
            });

        // User menu dropdown
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        if (userMenuBtn && userMenuDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenuDropdown.classList.toggle('show');
            });
            document.addEventListener('click', () => {
                userMenuDropdown.classList.remove('show');
            });
        }

        // Logout
        document.getElementById('logout-btn')
            ?.addEventListener('click', () => this.handleLogout());

        // Login
        document.getElementById('login-btn')
            ?.addEventListener('click', () => { window.location.hash = 'login'; });

        // Mobile menu
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const mainNav = document.getElementById('main-nav');
        if (mobileToggle && mainNav) {
            mobileToggle.addEventListener('click', () => mainNav.classList.toggle('show'));
            mainNav.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => mainNav.classList.remove('show'));
            });
        }

        // Connectivity
        window.addEventListener('online', async () => {
            console.log('[App] Online — refreshing cache...');
            try {
                await FirestoreService.getConstants();
                await FirestoreService.getProducts();
            } catch (err) {
                console.warn('[App] Background cache refresh failed:', err);
            }
        });

        window.addEventListener('offline', () => {
            console.log('[App] Offline — using cached data.');
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
            url: window.location.href
        };

        if (navigator.share) {
            try { await navigator.share(shareData); return; }
            catch (err) { if (err.name === 'AbortError') return; }
        }

        try {
            await navigator.clipboard.writeText(shareData.url);
            this.showShareFeedback(true);
        } catch {
            window.prompt(i18n.t('share-copy-prompt'), shareData.url);
        }
    }

    showShareFeedback(success) {
        const btn = document.getElementById('share-btn');
        const icon = document.getElementById('share-icon');
        if (!btn || !icon) return;

        const origClass = icon.className;
        const origTitle = btn.title;

        icon.className = success ? 'fas fa-check' : 'fas fa-xmark';
        btn.classList.add(success ? 'share-btn--copied' : 'share-btn--error');
        if (success) {
            btn.title = i18n.t('share-copied');
            this.showToast(i18n.t('share-copied'), 'success');
        } else {
            this.showToast(i18n.t('share-failed'), 'error');
        }

        setTimeout(() => {
            icon.className = origClass;
            btn.title = origTitle;
            btn.classList.remove('share-btn--copied', 'share-btn--error');
        }, 2000);
    }

    setupTheme() {
        this.setTheme(localStorage.getItem('theme') || 'light');
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        this.setTheme(current === 'light' ? 'dark' : 'light');
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        const icon = document.getElementById('theme-icon');
        if (icon) icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display:flex;align-items:center;gap:var(--spacing-sm);">
                <i class="fas fa-${this._toastIcon(type)}"></i>
                <span>${message}</span>
            </div>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    _toastIcon(type) {
        return {
            success: 'check-circle', error: 'exclamation-circle',
            warning: 'exclamation-triangle', info: 'info-circle'
        }[type] ?? 'info-circle';
    }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});

export default App;
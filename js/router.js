// router.js - Hash-based Router with URL Parameters

import { AuthService } from './services/auth.js';

export class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.currentRouteWithQuery = null;
        this.contentElement = document.getElementById('app-content');

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    // Register a route
    register(path, handler, options = {}) {
        this.routes[path] = {
            handler,
            requireAuth: options.requireAuth || false,
            title: options.title || 'BMToolkit'
        };
    }

    // Navigate to a route
    navigate(path) {
        window.location.hash = path;
    }

    // Get current path (without query parameters)
    getCurrentPath() {
        const hash = window.location.hash.slice(1) || 'home';
        return hash.split('?')[0];
    }

    // Get full hash including query params
    getFullHash() {
        return window.location.hash.slice(1) || 'home';
    }

    // Handle route change
    async handleRoute(force = false) {
        const path = this.getCurrentPath();
        const fullPath = this.getFullHash();

        // Prevent re-rendering only if both path AND query params are identical
        if (fullPath === this.currentRouteWithQuery && force === false) return;

        const route = this.routes[path] || this.routes['404'];

        if (!route) {
            this.showError('Route not found');
            return;
        }

        // Check authentication
        if (route.requireAuth && !AuthService.isAuthenticated()) {
            this.navigate('login');
            return;
        }

        // Update page title
        document.title = route.title;

        // Execute route handler
        try {
            this.currentRoute = path;
            this.currentRouteWithQuery = fullPath;
            await route.handler();
            this.updateNavigation();
        } catch (error) {
            console.error('Route handler error:', error);
            this.showError('An error occurred while loading the page.');
        }
    }

    // Update navigation UI based on current route
    updateNavigation() {
        const navLinks = document.querySelectorAll('[data-route]');
        navLinks.forEach(link => {
            const linkRoute = link.getAttribute('data-route');
            if (linkRoute === this.currentRoute) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Show error message
    showError(message) {
        if (this.contentElement) {
            this.contentElement.innerHTML = `
                <div class="container">
                    <div class="card" style="max-width: 600px; margin: 50px auto; text-align: center;">
                        <div class="card-body">
                            <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--accent); margin-bottom: var(--spacing-lg);"></i>
                            <h2 data-i18n="error">Error</h2>
                            <p>${message}</p>
                            <button onclick="window.history.back()" class="btn-primary">
                                <i class="fas fa-arrow-left"></i>
                                <span data-i18n="go-back">Go Back</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Render content to app
    render(html) {
        if (this.contentElement) {
            this.contentElement.innerHTML = html;
        }
    }

    // Get query parameters from hash
    getQueryParams() {
        const hash = window.location.hash;
        const queryString = hash.includes('?') ? hash.split('?')[1] : '';
        const params = {};

        if (queryString) {
            queryString.split('&').forEach(param => {
                const [key, value] = param.split('=');
                if (key && value) {
                    params[key] = decodeURIComponent(value);
                }
            });
        }

        return params;
    }

    // Update URL parameters without reloading
    updateQueryParams(params) {
        const path = this.getCurrentPath();
        const queryString = Object.keys(params)
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');

        const newHash = queryString ? `${path}?${queryString}` : path;

        // Update without triggering hashchange event
        if (window.location.hash.slice(1) !== newHash) {
            window.history.replaceState(null, null, `#${newHash}`);
            this.currentRouteWithQuery = newHash;
        }
    }
}

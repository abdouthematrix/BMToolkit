// login.js - Login Page

import { i18n } from '../i18n.js';
import { AuthService } from '../services/auth.js';

export class LoginPage {
    static async init() {
        const router = window.app?.router;
        if (router) {
            router.render(this.render());
            i18n.updatePageText();
            this.attachEventListeners();
        }
    }

    static render() {
        return `
            <div class="container">
                <div class="card" style="max-width: 500px; margin: 50px auto;">
                    <div class="card-header" style="text-align: center;">
                        <i class="fas fa-lock" style="font-size: 3rem; color: var(--primary); margin-bottom: var(--spacing-md);"></i>
                        <h2 class="card-title" data-i18n="admin-panel">Admin Panel</h2>
                        <p class="text-muted" data-i18n="login-panel-desc">Login to manage rates and products</p>
                    </div>
                    <div class="card-body">
                        <form id="login-form">
                            <div class="form-group">
                                <label class="form-label" data-i18n="email">Email</label>
                                <input type="email" id="login-email" class="form-input" required autocomplete="username">
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="password">Password</label>
                                <input type="password" id="login-password" class="form-input" required autocomplete="current-password">
                            </div>
                            <button type="submit" class="btn-primary" style="width: 100%;">
                                <i class="fas fa-sign-in-alt"></i>
                                <span data-i18n="login">Login</span>
                            </button>
                        </form>
                    </div>
                    <div class="card-footer" style="text-align: center;">
                        <p class="text-muted" style="margin: 0;">
                            <a href="#home" style="color: var(--primary);">
                                <i class="fas fa-arrow-left"></i>
                                <span data-i18n="back-to-home">Back to Home</span>
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    static attachEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }
    }

    static async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const result = await AuthService.login(email, password);

        if (result.success) {
            window.app.showToast(i18n.t('login-success'), 'success');
            setTimeout(() => {
                window.location.hash = 'admin';
            }, 1000);
        } else {
            window.app.showToast(result.error || i18n.t('login-failed'), 'error');
        }
    }
}
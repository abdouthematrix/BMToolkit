// admin.js - Admin Page

import { i18n } from '../i18n.js';
import { FirestoreService } from '../services/firestore.js';
import { AuthService } from '../services/auth.js';

export class AdminPage {
    static constants = {};

    static async init() {
        // Check if user is authenticated
        if (!AuthService.isAuthenticated()) {
            window.location.hash = 'login';
            return;
        }

        const router = window.app?.router;
        if (router) {
            router.render(this.render());
            i18n.updatePageText();
            await this.loadConstants();
            this.attachEventListeners();
        }
    }

    static async loadConstants() {
        this.constants = await FirestoreService.getConstants();
        this.populateForm();
    }

    static render() {
        return `
            <div class="container">
                <div style="margin-bottom: var(--spacing-2xl);">
                    <h1><i class="fas fa-cog" style="color: var(--primary);"></i> <span data-i18n="admin-panel">Admin Panel</span></h1>
                    <p class="text-muted">Manage rates, margins, and constants for all calculators</p>
                </div>

                <!-- Constants Management -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title" data-i18n="rates-margins">Rates & Margins</h3>
                    </div>
                    <div class="card-body">
                        <div class="warning-box">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Important:</strong> Changes made here will affect all users and all calculations globally.
                        </div>

                        <form id="constants-form" style="margin-top: var(--spacing-lg);">
                            <!-- Secured Loans Constants -->
                            <h4>Secured Loans</h4>
                            <div class="grid grid-3">
                                <div class="form-group">
                                    <label class="form-label" data-i18n="cd-rate-label">CD Rate (%)</label>
                                    <input type="number" id="cd-rate-admin" class="form-input" min="0" max="100" step="0.01" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="td-margin-label">TD Margin (%)</label>
                                    <input type="number" id="td-margin-admin" class="form-input" min="0" max="100" step="0.01" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="min-rate-label">Minimum Rate (%)</label>
                                    <input type="number" id="min-rate-admin" class="form-input" min="0" max="100" step="0.01" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Max Loan Percent (%)</label>
                                    <input type="number" id="max-loan-percent-admin" class="form-input" min="0" max="100" step="1" required>
                                </div>
                            </div>

                            <!-- Unsecured Loans Constants -->
                            <h4 style="margin-top: var(--spacing-xl);">Unsecured Loans</h4>
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label" data-i18n="max-dti-label">Max DTI Ratio (%)</label>
                                    <input type="number" id="max-dti-admin" class="form-input" min="0" max="100" step="1" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="stamp-duty-rate">Stamp Duty Rate (‰)</label>
                                    <input type="number" id="stamp-duty-admin" class="form-input" min="0" max="100" step="0.1" required>
                                </div>
                            </div>

                            <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-xl);">
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-save"></i>
                                    <span data-i18n="save-changes">Save Changes</span>
                                </button>
                                <button type="button" id="reset-constants" class="btn-secondary">
                                    <i class="fas fa-undo"></i>
                                    Reset to Defaults
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Products Management Preview -->
                <div class="card" style="margin-top: var(--spacing-lg);">
                    <div class="card-header">
                        <h3 class="card-title">Unsecured Loan Products</h3>
                    </div>
                    <div class="card-body">
                        <p class="text-muted">Product management interface would go here. This would allow adding, editing, and removing unsecured loan products with their rates.</p>
                        <div class="info-box">
                            <i class="fas fa-info-circle"></i>
                            Products are currently loaded from the default dataset. To manage products, they should be added to Firebase Firestore.
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static populateForm() {
        document.getElementById('cd-rate-admin').value = (this.constants.CD_RATE * 100).toFixed(2);
        document.getElementById('td-margin-admin').value = (this.constants.TD_MARGIN * 100).toFixed(2);
        document.getElementById('min-rate-admin').value = (this.constants.MIN_RATE * 100).toFixed(2);
        document.getElementById('max-loan-percent-admin').value = (this.constants.MAX_LOAN_PERCENT * 100).toFixed(0);
        document.getElementById('max-dti-admin').value = (this.constants.MAX_DBR_RATIO * 100).toFixed(0);
        document.getElementById('stamp-duty-admin').value = this.constants.STAMP_DUTY_RATE.toFixed(1);
    }

    static attachEventListeners() {
        const constantsForm = document.getElementById('constants-form');
        if (constantsForm) {
            constantsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveConstants();
            });
        }

        const resetBtn = document.getElementById('reset-constants');
        if (resetBtn) {
            resetBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to reset all constants to defaults?')) {
                    await this.resetConstants();
                }
            });
        }
    }

    static async saveConstants() {
        const constants = {
            CD_RATE: parseFloat(document.getElementById('cd-rate-admin').value) / 100,
            TD_MARGIN: parseFloat(document.getElementById('td-margin-admin').value) / 100,
            MIN_RATE: parseFloat(document.getElementById('min-rate-admin').value) / 100,
            MAX_LOAN_PERCENT: parseFloat(document.getElementById('max-loan-percent-admin').value) / 100,
            MAX_DBR_RATIO: parseFloat(document.getElementById('max-dti-admin').value) / 100,
            STAMP_DUTY_RATE: parseFloat(document.getElementById('stamp-duty-admin').value)
        };

        const result = await FirestoreService.updateConstants(constants);

        if (result.success) {
            window.app.showToast(i18n.t('save-success'), 'success');
            this.constants = constants;
        } else {
            window.app.showToast(result.error || 'Failed to save', 'error');
        }
    }

    static async resetConstants() {
        const defaults = FirestoreService.getDefaultConstants();
        const result = await FirestoreService.updateConstants(defaults);

        if (result.success) {
            window.app.showToast('Constants reset to defaults', 'success');
            this.constants = defaults;
            this.populateForm();
        } else {
            window.app.showToast(result.error || 'Failed to reset', 'error');
        }
    }
}

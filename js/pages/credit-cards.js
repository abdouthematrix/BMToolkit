// credit-cards.js - Credit Cards Installment Calculator (Tabbed)

import { i18n } from '../i18n.js';
import { FinancialCalculator } from '../services/financial-calculator.js';
import { FirestoreService } from '../services/firestore.js';

export class CreditCardsPage {
    static PERIODS = [36, 24, 18, 12, 9, 6, 3];

    static DEFAULT_REGULAR_RATES = {
        3: 0.0281,
        6: 0.0277,
        9: 0.0276,
        12: 0.0273,
        18: 0.0267,
        24: 0.0263,
        36: 0.0256
    };

    static DEFAULT_STAFF_RATE = 0.0225;

    static DEFAULT_ADMIN_FEES = {
        3: 0.0485,
        6: 0.0840,
        9: 0.1150,
        12: 0.1450,
        18: 0.1983,
        24: 0.2500,
        36: 0.3300
    };

    static MIN_AMOUNT = 1000;
    static activeTab = 'installment';
    static constants = null;
    static STORAGE_KEY = 'credit-cards-active-tab';

    static getRatesConfig() {
        const source = this.constants?.CREDIT_CARDS || this.constants?.CREDIT_CARD || {};
        const regularRatesRaw = source.REGULAR_RATES || source.RATES || {};
        const adminFeesRaw = source.ADMIN_FEES || {};

        const regularRates = {};
        const adminFees = {};

        this.PERIODS.forEach((period) => {
            regularRates[period] = this.normalizeRate(regularRatesRaw[period], this.DEFAULT_REGULAR_RATES[period]);
            adminFees[period] = this.normalizeRate(adminFeesRaw[period], this.DEFAULT_ADMIN_FEES[period]);
        });

        const staffRate = this.normalizeRate(
            source.STAFF_RATE ?? source.STAFF_MONTHLY_RATE ?? this.constants?.CREDIT_CARD_STAFF_RATE,
            this.DEFAULT_STAFF_RATE
        );

        return { regularRates, staffRate, adminFees };
    }

    static normalizeRate(value, fallback) {
        if (value === undefined || value === null || value === '') return fallback;
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return fallback;
        return parsed > 1 ? parsed / 100 : parsed;
    }

    static determineActiveTab() {
        const savedTab = sessionStorage.getItem(this.STORAGE_KEY);
        const urlParams = window.app?.router?.getQueryParams() || {};
        const requestedTab = urlParams.tab || savedTab || 'installment';
        this.activeTab = requestedTab === 'admin-fees' ? 'admin-fees' : 'installment';
    }

    static getAmountFromUrl() {
        const urlParams = window.app?.router?.getQueryParams() || {};
        if (!urlParams.amount) return null;

        const amount = parseFloat(urlParams.amount);
        if (Number.isNaN(amount) || amount < this.MIN_AMOUNT) return null;
        return amount;
    }

    static getStaffFromUrl() {
        const urlParams = window.app?.router?.getQueryParams() || {};
        return String(urlParams.staff).toLowerCase() === '1' || String(urlParams.staff).toLowerCase() === 'true';
    }

    static render() {
        return `
            <div class="container">
                <div style="margin-bottom: var(--spacing-2xl);">
                    <h1><i class="fas fa-credit-card" style="color: var(--secondary);"></i> <span data-i18n="credit-cards-title">Credit Cards</span></h1>
                    <p class="text-muted" data-i18n="credit-cards-desc">Transactions installment calculator for credit cards</p>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title" data-i18n="cc-installment-calculator-simple">Credit Card Installment Rates Summary</h3>
                    </div>
                    <div class="card-body">
                        <form id="credit-card-installment-form">
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label" data-i18n="transaction-amount">Transaction Amount (EGP)</label>
                                    <input type="number" id="cc-amount" class="form-input" min="${this.MIN_AMOUNT}" step="0.01" value="22000" required>
                                    <small class="text-muted" data-i18n="cc-cash-min-note">Minimum transaction is 1,000 EGP.</small>
                                </div>
                                <div class="form-group" id="cc-staff-toggle-group">
                                    <label class="form-label" data-i18n="cc-staff-mode">Staff Mode</label>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="cc-staff-toggle">
                                        <span data-i18n="cc-staff-mode-note">Use staff monthly rate (2.25%)</span>
                                    </label>
                                </div>
                            </div>
                            <div class="cc-actions-row" style="margin-top: var(--spacing-md);">
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-calculator"></i>
                                    <span data-i18n="calculate">Calculate</span>
                                </button>
                                <button type="reset" class="btn-secondary">
                                    <i class="fas fa-redo"></i>
                                    <span data-i18n="reset">Reset</span>
                                </button>
                            </div>
                        </form>

                        <div class="tabs cc-tabs" style="margin-top: var(--spacing-xl);">
                            <button class="tab-btn ${this.activeTab === 'installment' ? 'active' : ''}" data-tab="installment">
                                <i class="fas fa-receipt"></i>
                                <span data-i18n="cc-tab-installment">Installment</span>
                            </button>
                            <button class="tab-btn ${this.activeTab === 'admin-fees' ? 'active' : ''}" data-tab="admin-fees">
                                <i class="fas fa-file-invoice-dollar"></i>
                                <span data-i18n="cc-tab-admin-fees">Admin Fees</span>
                            </button>
                        </div>

                        <div id="cc-tab-installment" class="tab-content ${this.activeTab === 'installment' ? 'active' : ''}" data-tab-content="installment" style="margin-top: var(--spacing-lg);"></div>
                        <div id="cc-tab-admin-fees" class="tab-content ${this.activeTab === 'admin-fees' ? 'active' : ''}" data-tab-content="admin-fees" style="margin-top: var(--spacing-lg);"></div>
                    </div>
                </div>
            </div>
        `;
    }

    static async init() {
        const router = window.app?.router;
        if (!router) return;

        this.determineActiveTab();
        router.render(this.render());
        i18n.updatePageText();

        this.applyUrlState();
        this.attachEventListeners();

        await this.loadConstants();
        this.updateTabVisibility();
        this.calculateAllScenarios();
    }

    static async loadConstants() {
        this.constants = await FirestoreService.getConstants();
    }

    static applyUrlState() {
        const amountFromUrl = this.getAmountFromUrl();
        const staffFromUrl = this.getStaffFromUrl();

        const amountInput = document.getElementById('cc-amount');
        const staffToggle = document.getElementById('cc-staff-toggle');

        if (amountInput && amountFromUrl !== null) {
            amountInput.value = String(amountFromUrl);
        }

        if (staffToggle) {
            staffToggle.checked = staffFromUrl;
        }
    }

    static attachEventListeners() {
        const form = document.getElementById('credit-card-installment-form');
        const staffToggle = document.getElementById('cc-staff-toggle');

        if (!form) return;

        form.addEventListener('submit', (e) => this.handleCalculate(e));
        form.addEventListener('reset', () => {
            setTimeout(() => {
                this.activeTab = 'installment';
                this.updateTabVisibility();
                this.calculateAllScenarios();
            }, 0);
        });

        if (staffToggle) {
            staffToggle.addEventListener('change', () => {
                if (this.activeTab === 'installment') {
                    this.calculateAllScenarios();
                }
            });
        }

        document.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.activeTab = btn.getAttribute('data-tab');
                sessionStorage.setItem(this.STORAGE_KEY, this.activeTab);
                this.updateTabVisibility();
                this.calculateAllScenarios();
            });
        });
    }

    static handleCalculate(event) {
        event.preventDefault();
        this.calculateAllScenarios();
    }

    static updateTabVisibility() {
        document.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === this.activeTab);
        });
        document.querySelectorAll('.tab-content').forEach((content) => {
            content.classList.toggle('active', content.getAttribute('data-tab-content') === this.activeTab);
        });

        const staffGroup = document.getElementById('cc-staff-toggle-group');
        if (staffGroup) {
            staffGroup.style.display = this.activeTab === 'installment' ? '' : 'none';
        }
    }

    static syncUrlState(amount) {
        const router = window.app?.router;
        if (!router) return;

        const staffEnabled = document.getElementById('cc-staff-toggle')?.checked === true;
        router.updateQueryParams({
            tab: this.activeTab,
            amount: Number.isFinite(amount) ? String(amount) : String(this.MIN_AMOUNT),
            staff: staffEnabled ? '1' : '0'
        });
    }

    static calculateAllScenarios() {
        const amountInput = document.getElementById('cc-amount');
        if (!amountInput) return;

        const amount = parseFloat(amountInput.value);
        if (Number.isNaN(amount) || amount < this.MIN_AMOUNT) {
            alert(i18n.t('cc-cash-min-validation'));
            return;
        }

        this.syncUrlState(amount);
        this.renderInstallmentTabResults(amount);
        this.renderAdminFeesTabResults(amount);
    }

    static renderInstallmentTabResults(amount) {
        const { regularRates, staffRate } = this.getRatesConfig();
        const isStaff = document.getElementById('cc-staff-toggle')?.checked === true;

        const matrixRows = this.PERIODS.map((period) => {
            const rate = isStaff ? staffRate : regularRates[period];
            const monthlyInstallment = FinancialCalculator.PMT(rate, period, amount);
            const totalInterest = (monthlyInstallment * period) - amount;
            const totalWithInterest = monthlyInstallment * period;
            const annualFlatEquivalent = ((totalInterest / amount) / (period / 12)) * 100;

            return `
                <tr>
                    <th scope="row">${period} ${i18n.t('months')}</th>
                    <td data-label="${i18n.t('interest-rate')}">${(rate * 100).toFixed(2)}%</td>
                    <td data-label="${i18n.t('monthly-installment')}">${this.formatCurrency(monthlyInstallment)}</td>
                    <td data-label="${i18n.t('total-interest')}">${this.formatCurrency(totalInterest)}</td>
                    <td data-label="${i18n.t('cc-total-with-interest')}">${this.formatCurrency(totalWithInterest)}</td>
                    <td data-label="${i18n.t('cc-flat-equivalent')}">${annualFlatEquivalent.toFixed(2)}%</td>
                </tr>
            `;
        }).join('');

        const mount = document.getElementById('cc-tab-installment');
        if (!mount) return;

        mount.innerHTML = `
            <div class="results-card">
                <h3 style="margin-bottom: var(--spacing-md);"><i class="fas fa-table"></i> ${i18n.t('cc-tab-installment')}</h3>
                <p class="text-muted" style="margin-bottom: var(--spacing-md);">
                    ${i18n.t('transaction-amount')}: <strong>${this.formatCurrency(amount)}</strong>
                    • ${i18n.t('cc-active-rate')}: <strong>${isStaff ? i18n.t('cc-staff-rate') : i18n.t('cc-regular-rate')}</strong>
                </p>

                <div class="results-table-wrapper">
                    <table class="results-table cc-scenarios-table">
                        <thead>
                            <tr>
                                <th data-i18n="tenor">Duration</th>
                                <th data-i18n="interest-rate">Interest Rate (%)</th>
                                <th data-i18n="monthly-installment">Monthly Installment</th>
                                <th data-i18n="total-interest">Total Interest</th>
                                <th data-i18n="cc-total-with-interest">Total Amount with Interest</th>
                                <th data-i18n="cc-flat-equivalent">Approx. Annual Flat Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${matrixRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        i18n.updatePageText();
    }

    static renderAdminFeesTabResults(amount) {
        const { adminFees } = this.getRatesConfig();

        const matrixRows = this.PERIODS.map((period) => {
            const adminFeeAmount = amount * adminFees[period];
            return `
                <tr>
                    <th scope="row">${period} ${i18n.t('months')}</th>
                    <td data-label="${i18n.t('cc-admin-fee')}">${(adminFees[period] * 100).toFixed(2)}%</td>
                    <td data-label="${i18n.t('cc-admin-fee-amount')}">${this.formatCurrency(adminFeeAmount)}</td>
                    <td data-label="${i18n.t('cc-installment-no-interest')}">${this.formatCurrency(amount / period)}</td>
                    <td data-label="${i18n.t('cc-total-with-admin')}">${this.formatCurrency(amount + adminFeeAmount)}</td>
                </tr>
            `;
        }).join('');

        const mount = document.getElementById('cc-tab-admin-fees');
        if (!mount) return;

        mount.innerHTML = `
            <div class="results-card">
                <h3 style="margin-bottom: var(--spacing-md);"><i class="fas fa-table"></i> ${i18n.t('cc-tab-admin-fees')}</h3>
                <p class="text-muted" style="margin-bottom: var(--spacing-md);">
                    ${i18n.t('transaction-amount')}: <strong>${this.formatCurrency(amount)}</strong>
                </p>

                <div class="results-table-wrapper">
                    <table class="results-table cc-scenarios-table">
                        <thead>
                            <tr>
                                <th data-i18n="tenor">Duration</th>
                                <th data-i18n="cc-admin-fee">Admin Fee (One-time)</th>
                                <th data-i18n="cc-admin-fee-amount">Admin Fee Amount</th>
                                <th data-i18n="cc-installment-no-interest">Installment Amount (No Interest)</th>
                                <th data-i18n="cc-total-with-admin">Total Amount with Admin Fee</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${matrixRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        i18n.updatePageText();
    }

    static formatCurrency(value) {
        return new Intl.NumberFormat(i18n.currentLanguage === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency',
            currency: 'EGP',
            maximumFractionDigits: 2
        }).format(value);
    }
}

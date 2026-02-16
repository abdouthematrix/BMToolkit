// credit-cards.js - Credit Cards Installment Calculator (Simple)

import { i18n } from '../i18n.js';
import { FinancialCalculator } from '../services/financial-calculator.js';

export class CreditCardsPage {
    static PERIODS = [3, 6, 9, 12, 18, 24, 36];

    static REGULAR_RATES = {
        3: 0.0281,
        6: 0.0277,
        9: 0.0276,
        12: 0.0273,
        18: 0.0267,
        24: 0.0263,
        36: 0.0256
    };

    static STAFF_RATE = 0.0225;

    static ADMIN_FEES = {
        3: 0.0485,
        6: 0.0840,
        9: 0.1150,
        12: 0.1450,
        18: 0.1983,
        24: 0.2500,
        36: 0.3300
    };

    static MIN_AMOUNT = 1000;

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
                                    <input type="number" id="cc-amount" class="form-input" min="${this.MIN_AMOUNT}" step="0.01" value="5000" required>
                                    <small class="text-muted" data-i18n="cc-cash-min-note">Minimum transaction is 1,000 EGP.</small>
                                </div>
                            </div>
                            <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md);">
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

                        <div id="cc-results" style="display: none; margin-top: var(--spacing-xl);"></div>
                    </div>
                </div>
            </div>
        `;
    }

    static async init() {
        const router = window.app?.router;
        if (router) {
            router.render(this.render());
            i18n.updatePageText();
            this.attachEventListeners();
            this.calculateAllScenarios();
        }
    }

    static attachEventListeners() {
        const form = document.getElementById('credit-card-installment-form');
        if (!form) return;

        form.addEventListener('submit', (e) => this.handleCalculate(e));
        form.addEventListener('reset', () => {
            setTimeout(() => this.calculateAllScenarios(), 0);
        });
    }

    static handleCalculate(event) {
        event.preventDefault();
        this.calculateAllScenarios();
    }

    static calculateAllScenarios() {
        const amount = parseFloat(document.getElementById('cc-amount').value);

        if (Number.isNaN(amount) || amount < this.MIN_AMOUNT) {
            alert(i18n.t('cc-cash-min-validation'));
            return;
        }

        const rows = this.PERIODS.map((period) => {
            const regularRate = this.REGULAR_RATES[period];
            const staffRate = this.STAFF_RATE;
            const adminFeeRate = this.ADMIN_FEES[period];

            const adminFeeAmount = amount * adminFeeRate;

            const regularMonthlyInstallment = FinancialCalculator.PMT(regularRate, period, amount);
            const staffMonthlyInstallment = FinancialCalculator.PMT(staffRate, period, amount);

            const regularTotalWithoutFees = regularMonthlyInstallment * period;
            const staffTotalWithoutFees = staffMonthlyInstallment * period;

            const regularTotalWithFees = regularTotalWithoutFees + adminFeeAmount;
            const staffTotalWithFees = staffTotalWithoutFees + adminFeeAmount;

            return `
                <tr>
                    <td>${period} ${i18n.t('months').toLowerCase()}</td>
                    <td>${(regularRate * 100).toFixed(2)}%</td>
                    <td>${(staffRate * 100).toFixed(2)}%</td>
                    <td>${(adminFeeRate * 100).toFixed(2)}%</td>
                    <td>${this.formatCurrency(regularMonthlyInstallment)}</td>
                    <td>${this.formatCurrency(staffMonthlyInstallment)}</td>
                    <td>${this.formatCurrency(regularTotalWithFees)}</td>
                    <td>${this.formatCurrency(staffTotalWithFees)}</td>
                </tr>
            `;
        }).join('');

        const results = document.getElementById('cc-results');
        results.innerHTML = `
            <div class="results-card">
                <h3 style="margin-bottom: var(--spacing-md);"><i class="fas fa-table"></i> ${i18n.t('results')}</h3>
                <p class="text-muted" style="margin-bottom: var(--spacing-md);">
                    ${i18n.t('transaction-amount')}: <strong>${this.formatCurrency(amount)}</strong>
                </p>

                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th data-i18n="cc-installment-period">Installment Period</th>
                                <th data-i18n="cc-regular-rate">Regular Rate (Monthly)</th>
                                <th data-i18n="cc-staff-rate">Staff Rate (Monthly)</th>
                                <th data-i18n="cc-admin-fee">Admin Fee (One-time)</th>
                                <th data-i18n="cc-regular-monthly">Regular Monthly Installment</th>
                                <th data-i18n="cc-staff-monthly">Staff Monthly Installment</th>
                                <th data-i18n="cc-regular-total-fees">Regular Total + Fee</th>
                                <th data-i18n="cc-staff-total-fees">Staff Total + Fee</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>

                <div class="info-box" style="margin-top: var(--spacing-md);">
                    <i class="fas fa-circle-info"></i>
                    <p style="margin: 0;">
                        <span data-i18n="cc-rates-note">Regular rates range from 2.56% to 2.81% monthly, staff rate is 2.25% monthly, and admin fees apply once at installment start.</span>
                    </p>
                </div>
            </div>
        `;
        results.style.display = 'block';
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

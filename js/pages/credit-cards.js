// credit-cards.js - Credit Cards Installment Calculator

import { i18n } from '../i18n.js';
import { FinancialCalculator } from '../services/financial-calculator.js';

export class CreditCardsPage {
    static CARD_TYPES = [
        'Classic',
        'Gold',
        'Titanium',
        'Platinum',
        'Signature',
        'World',
        'World Elite',
        'Visa Infinite',
        'Visa Infinite Private'
    ];

    static INSTALLMENT_TYPES = ['Purchase', 'Cash'];

    static PERIOD_RATES = {
        3: 0.0281,
        6: 0.0277,
        9: 0.0276,
        12: 0.0273,
        18: 0.0267,
        24: 0.0263,
        36: 0.0256
    };

    static render() {
        return `
            <div class="container">
                <div style="margin-bottom: var(--spacing-2xl);">
                    <h1><i class="fas fa-credit-card" style="color: var(--secondary);"></i> <span data-i18n="credit-cards-title">Credit Cards</span></h1>
                    <p class="text-muted" data-i18n="credit-cards-desc">Transactions installment calculator for credit cards</p>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title" data-i18n="cc-installment-calculator">Transactions Installment for Credit Cards</h3>
                    </div>
                    <div class="card-body">
                        <form id="credit-card-installment-form">
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label" data-i18n="cc-card-type">Credit Card Type</label>
                                    <select id="cc-card-type" class="form-select" required>
                                        ${this.CARD_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label class="form-label" data-i18n="cc-installment-type">Installment Type</label>
                                    <select id="cc-installment-type" class="form-select" required>
                                        ${this.INSTALLMENT_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                                    </select>
                                    <small class="text-muted" id="cash-min-note" data-i18n="cc-cash-min-note" style="display: none;">Cash transactions must be at least 1,000 EGP.</small>
                                </div>

                                <div class="form-group">
                                    <label class="form-label" data-i18n="transaction-amount">Transaction Amount (EGP)</label>
                                    <input type="number" id="cc-amount" class="form-input" min="0" step="0.01" value="5000" required>
                                </div>

                                <div class="form-group">
                                    <label class="form-label" data-i18n="cc-installment-period">Installment Period</label>
                                    <select id="cc-period" class="form-select" required>
                                        ${Object.keys(this.PERIOD_RATES).map(period => `<option value="${period}">${period} months</option>`).join('')}
                                    </select>
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

                <div class="card" style="margin-top: var(--spacing-lg);">
                    <div class="card-header">
                        <h3 class="card-title" data-i18n="cc-interest-rates-title">Monthly Interest Rates</h3>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th data-i18n="cc-installment-period">Installment Period</th>
                                        <th data-i18n="interest-rate">Interest Rate (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(this.PERIOD_RATES).map(([period, rate]) => `
                                        <tr>
                                            <td>${period} months</td>
                                            <td>${(rate * 100).toFixed(2)}% ${i18n.t('monthly').toLowerCase()}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
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
        }
    }

    static attachEventListeners() {
        const form = document.getElementById('credit-card-installment-form');
        const typeSelect = document.getElementById('cc-installment-type');
        const amountInput = document.getElementById('cc-amount');

        if (!form || !typeSelect || !amountInput) return;

        const updateCashValidationUI = () => {
            const isCash = typeSelect.value === 'Cash';
            document.getElementById('cash-min-note').style.display = isCash ? 'block' : 'none';
            amountInput.min = isCash ? '1000' : '0';
        };

        typeSelect.addEventListener('change', updateCashValidationUI);
        form.addEventListener('submit', (e) => this.handleCalculate(e));
        form.addEventListener('reset', () => {
            setTimeout(() => {
                updateCashValidationUI();
                const results = document.getElementById('cc-results');
                results.style.display = 'none';
                results.innerHTML = '';
            }, 0);
        });

        updateCashValidationUI();
    }

    static handleCalculate(event) {
        event.preventDefault();

        const cardType = document.getElementById('cc-card-type').value;
        const installmentType = document.getElementById('cc-installment-type').value;
        const amount = parseFloat(document.getElementById('cc-amount').value);
        const period = parseInt(document.getElementById('cc-period').value, 10);
        const monthlyRate = this.PERIOD_RATES[period];

        if (Number.isNaN(amount) || amount <= 0) {
            alert(i18n.t('invalid-input'));
            return;
        }

        if (installmentType === 'Cash' && amount < 1000) {
            alert(i18n.t('cc-cash-min-validation'));
            return;
        }

        const monthlyInstallment = FinancialCalculator.PMT(monthlyRate, period, amount);
        const totalPaid = monthlyInstallment * period;
        const totalInterest = totalPaid - amount;

        const results = document.getElementById('cc-results');
        results.innerHTML = `
            <div class="results-card">
                <h3 style="margin-bottom: var(--spacing-md);"><i class="fas fa-receipt"></i> ${i18n.t('results')}</h3>
                <div class="grid grid-2">
                    <div class="result-item">
                        <div class="result-label">${i18n.t('cc-card-type')}</div>
                        <div class="result-value" style="font-size: 1rem;">${cardType}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">${i18n.t('cc-installment-type')}</div>
                        <div class="result-value" style="font-size: 1rem;">${installmentType}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">${i18n.t('transaction-amount')}</div>
                        <div class="result-value">${this.formatCurrency(amount)}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">${i18n.t('cc-installment-period')}</div>
                        <div class="result-value">${period} ${i18n.t('months').toLowerCase()}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">${i18n.t('interest-rate')}</div>
                        <div class="result-value">${(monthlyRate * 100).toFixed(2)}% ${i18n.t('monthly').toLowerCase()}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">${i18n.t('monthly-installment')}</div>
                        <div class="result-value">${this.formatCurrency(monthlyInstallment)}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">${i18n.t('total-interest')}</div>
                        <div class="result-value">${this.formatCurrency(totalInterest)}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">${i18n.t('total-payment')}</div>
                        <div class="result-value">${this.formatCurrency(totalPaid)}</div>
                    </div>
                </div>
            </div>
        `;
        results.style.display = 'block';
    }

    static formatCurrency(value) {
        return new Intl.NumberFormat(i18n.currentLanguage === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency',
            currency: 'EGP',
            maximumFractionDigits: 2
        }).format(value);
    }
}

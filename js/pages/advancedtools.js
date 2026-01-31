// advancedtools.js - advancedtools Page (Advanced Calculators)

import { i18n } from '../i18n.js';
import { FinancialCalculator } from '../services/financial-calculator.js';
import { FirestoreService } from '../services/firestore.js';

export class AdvancedToolsPage {
    static async init() {
        const router = window.app?.router;
        if (router) {
            router.render(this.render());
            i18n.updatePageText();
            await this.loadConstants();
            this.attachEventListeners();
            this.setDefaultDates();
        }
    }

    static async loadConstants() {
        const constants = await FirestoreService.getConstants();
        // Set default stamp duty rate
        document.getElementById('stamp-duty-rate').value = constants.STAMP_DUTY_RATE.toFixed(1);
    }

    static render() {
        return `
            <div class="container">
                <div style="margin-bottom: var(--spacing-2xl);">
                    <h1><i class="fas fa-puzzle-piece" style="color: var(--accent);"></i> <span data-i18n="advancedtools-title">advancedtools</span></h1>
                    <p class="text-muted" data-i18n="advancedtools-desc">Advanced calculators for both secured and unsecured loans</p>
                </div>

                <!-- Calculators Tabs -->
                <div class="card">
                    <div style="border-bottom: 2px solid var(--border-color); padding: var(--spacing-md); display: flex; gap: var(--spacing-sm); overflow-x: auto;">
                        <button class="tab-btn active" data-tab="first-month">
                            <i class="fas fa-calendar-day"></i>
                            <span data-i18n="tab-first-month">First Month Interest</span>
                        </button>
                        <button class="tab-btn" data-tab="amortization">
                            <i class="fas fa-table"></i>
                            <span data-i18n="tab-amortization">Amortization Schedule</span>
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div id="calculator-content">
                        ${this.renderFirstMonthTab()}
                        ${this.renderAmortizationTab()}
                    </div>
                </div>
            </div>
        `;
    }

    static renderFirstMonthTab() {
        return `
            <div class="tab-content active" data-tab-content="first-month">
                <div class="card-body">
                    <h3 data-i18n="first-month-interest">First Month Interest Calculator</h3>
                    <p class="text-muted" data-i18n="first-month-interest-desc">Calculate initial interest payment based on loan start date</p>

                    <div class="info-box" style="margin-top: var(--spacing-lg);">
                        <i class="fas fa-info-circle"></i>
                        <strong data-i18n="first-month-how-it-works">How it works:</strong> <span data-i18n="first-month-explanation">When a loan starts mid-month, the first payment includes extra interest for the days between the start date and the first regular payment date (typically the 5th of the second month following the start date).</span>
                    </div>

                    <form id="first-month-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="principal">Principal Amount</label>
                                <input type="number" id="principal-first" class="form-input" value="100000" min="0" step="1000" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="interest-rate">Annual Interest Rate (%)</label>
                                <input type="number" id="rate-first" class="form-input" value="18" min="0" max="100" step="0.1" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="start-date">Loan Start Date</label>
                                <input type="date" id="start-date-first" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="loan-term">Loan Term</label>
                                <input type="number" id="loan-term-first" class="form-input" value="3" min="1" max="180" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="is-years-first">
                                <span data-i18n="months-vs-years">Months (vs Years)</span>
                            </label>
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

                    <div id="first-month-results" style="display: none; margin-top: var(--spacing-xl);"></div>
                </div>
            </div>
        `;
    }

    static renderAmortizationTab() {
        return `
            <div class="tab-content" data-tab-content="amortization">
                <div class="card-body">
                    <h3 data-i18n="amortization-schedule">Amortization Schedule</h3>
                    <p class="text-muted" data-i18n="amortization-schedule-desc">Detailed payment schedule with stamp duty calculations</p>

                    <div class="info-box" style="margin-top: var(--spacing-lg);">
                        <i class="fas fa-info-circle"></i>
                        <strong data-i18n="stamp-duty-info">Stamp Duty:</strong> <span data-i18n="stamp-duty-explanation">Applied quarterly (March, June, September, December) on the remaining balance at a rate per thousand.</span>
                    </div>

                    <form id="amortization-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="principal">Principal Amount</label>
                                <input type="number" id="principal-amort" class="form-input" value="100000" min="0" step="1000" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="interest-rate">Annual Interest Rate (%)</label>
                                <input type="number" id="rate-amort" class="form-input" value="18" min="0" max="100" step="0.1" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="start-date">Loan Start Date</label>
                                <input type="date" id="start-date-amort" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="loan-term">Loan Term</label>
                                <input type="number" id="loan-term-amort" class="form-input" value="3" min="1" max="180" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="stamp-duty-rate">Stamp Duty Rate (‰)</label>
                                <input type="number" id="stamp-duty-rate" class="form-input" value="0.5" min="0" step="0.1" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="is-years-amort">
                                <span data-i18n="months-vs-years">Months (vs Years)</span>
                            </label>
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

                    <div id="amortization-results" style="display: none; margin-top: var(--spacing-xl);"></div>
                </div>
            </div>
        `;
    }

    static attachEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Form submissions
        document.getElementById('first-month-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateFirstMonth();
        });

        document.getElementById('amortization-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateAmortization();
        });
    }

    static switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector(`[data-tab-content="${tab}"]`).classList.add('active');
    }

    static setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('start-date-first').value = today;
        document.getElementById('start-date-amort').value = today;
    }

    static calculateFirstMonth() {
        const principal = parseFloat(document.getElementById('principal-first').value);
        const annualRate = parseFloat(document.getElementById('rate-first').value);
        const startDate = document.getElementById('start-date-first').value;
        const loanTerm = parseInt(document.getElementById('loan-term-first').value);
        const isYears = !document.getElementById('is-years-first').checked; // Inverted checkbox

        // Update URL parameters
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                calc: 'first-month',
                principal: principal,
                rate: annualRate.toFixed(2),
                startDate: startDate,
                term: loanTerm,
                unit: isYears ? 'years' : 'months'
            });
        }

        const result = FinancialCalculator.calculateFirstMonthInterest({
            principal,
            annualRate,
            startDate,
            loanTerm,
            isYears
        });

        // Create message with translated template
        const firstPaymentMessage = i18n.t('first-payment-message')
            .replace('{payment}', i18n.formatCurrency(result.totalFirstMonthlyPayment))
            .replace('{interest}', i18n.formatCurrency(result.firstMonthInterest))
            .replace('{days}', result.calculationDays);

        const resultsHtml = `
            <div class="highlight-box">
                <h3 data-i18n="first-month-calculation"><i class="fas fa-calendar-check"></i> ${i18n.t('first-month-calculation')}</h3>
                <div class="grid grid-2" style="margin-top: var(--spacing-md);">
                    <div>
                        <p style="margin: 0; opacity: 0.9;">${i18n.t('first-payment-date')}</p>
                        <p style="font-size: 1.25rem; font-weight: 600; margin: 0;">${result.endDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p style="margin: 0; opacity: 0.9;">${i18n.t('days-between')}</p>
                        <p style="font-size: 1.25rem; font-weight: 600; margin: 0;">${result.daysBetween} ${i18n.t('table-number')}</p>
                    </div>
                    <div>
                        <p style="margin: 0; opacity: 0.9;">${i18n.t('calculation-days')}</p>
                        <p style="font-size: 1.25rem; font-weight: 600; margin: 0;">${result.calculationDays} ${i18n.t('table-number')}</p>
                    </div>
                    <div>
                        <p style="margin: 0; opacity: 0.9;">${i18n.t('first-month-interest-amount')}</p>
                        <p style="font-size: 1.25rem; font-weight: 600; margin: 0; color: var(--accent);">${i18n.formatCurrency(result.firstMonthInterest)}</p>
                    </div>
                    <div>
                        <p style="margin: 0; opacity: 0.9;">${i18n.t('regular-monthly-payment')}</p>
                        <p style="font-size: 1.25rem; font-weight: 600; margin: 0;">${i18n.formatCurrency(result.monthlyPayment)}</p>
                    </div>
                </div>
                <div style="margin-top: var(--spacing-lg); padding-top: var(--spacing-lg); border-top: 1px solid rgba(255,255,255,0.3);">
                    <p style="margin: 0; opacity: 0.9; font-size: 1.125rem;">${i18n.t('total-first-payment')}</p>
                    <p style="font-size: 2rem; font-weight: 700; margin: var(--spacing-sm) 0 0 0; color: white;">${i18n.formatCurrency(result.totalFirstMonthlyPayment)}</p>
                </div>
            </div>

            <div class="warning-box" style="margin-top: var(--spacing-lg);">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>${i18n.t('first-payment-note')}</strong> ${firstPaymentMessage}
            </div>
        `;

        document.getElementById('first-month-results').innerHTML = resultsHtml;
        document.getElementById('first-month-results').style.display = 'block';
    }

    static calculateAmortization() {
        const principal = parseFloat(document.getElementById('principal-amort').value);
        const annualRate = parseFloat(document.getElementById('rate-amort').value);
        const startDate = document.getElementById('start-date-amort').value;
        const loanTerm = parseInt(document.getElementById('loan-term-amort').value);
        const stampDutyRate = parseFloat(document.getElementById('stamp-duty-rate').value);
        const isYears = !document.getElementById('is-years-amort').checked; // Inverted checkbox

        // Update URL parameters
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                calc: 'amortization',
                principal: principal,
                rate: annualRate.toFixed(2),
                startDate: startDate,
                term: loanTerm,
                stampDuty: stampDutyRate.toFixed(1),
                unit: isYears ? 'years' : 'months'
            });
        }

        const result = FinancialCalculator.calculateAmortizationSchedule({
            principal,
            annualRate,
            startDate,
            loanTerm,
            stampDutyRate,
            isYears
        });

        // Create message with translated template
        const stampDutyMessage = i18n.t('stamp-duty-message')
            .replace('{rate}', stampDutyRate);

        const resultsHtml = `
            <div class="info-box">
                <h4><i class="fas fa-chart-bar"></i> ${i18n.t('summary')}</h4>
                <div class="grid grid-3" style="margin-top: var(--spacing-md);">
                    <div>
                        <strong>${i18n.t('regular-monthly-payment')}</strong><br>
                        <span style="font-size: 1.25rem; color: var(--primary);">${i18n.formatCurrency(result.monthlyPayment)}</span>
                    </div>
                    <div>
                        <strong>${i18n.t('total-interest')}</strong><br>
                        <span style="font-size: 1.25rem; color: var(--accent);">${i18n.formatCurrency(result.totalInterest)}</span>
                    </div>
                    <div>
                        <strong>${i18n.t('total-stamp-duty')}</strong><br>
                        <span style="font-size: 1.25rem; color: var(--secondary);">${i18n.formatCurrency(result.totalStampDuty)}</span>
                    </div>
                </div>
            </div>

            <h4 style="margin-top: var(--spacing-xl);"><i class="fas fa-table"></i> ${i18n.t('payment-schedule')}</h4>
            <div class="results-table-wrapper" style="overflow-x: auto; max-height: 500px; overflow-y: auto;">
                <table class="results-table">
                    <thead style="position: sticky; top: 0; background: var(--bg-tertiary); z-index: 10;">
                        <tr>
                            <th>${i18n.t('table-number')}</th>
                            <th>${i18n.t('payment-date')}</th>
                            <th>${i18n.t('monthly-payment')}</th>
                            <th>${i18n.t('interest')}</th>
                            <th>${i18n.t('principal')}</th>
                            <th>${i18n.t('stamp-duty')}</th>
                            <th>${i18n.t('remaining-balance')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${result.results.map(row => `
                            <tr ${row.stampDutyAmount > 0 ? 'class="highlight-row"' : ''}>
                                <td>${row.paymentNumber}</td>
                                <td>${row.paymentDate.toLocaleDateString()}</td>
                                <td class="number-display">${i18n.formatCurrency(row.monthlyPayment)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.interestPayment)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.principalPayment)}</td>
                                <td class="number-display ${row.stampDutyAmount > 0 ? 'font-bold' : ''}">${row.stampDutyAmount > 0 ? i18n.formatCurrency(row.stampDutyAmount) : '-'}</td>
                                <td class="number-display">${i18n.formatCurrency(row.remainingBalance)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="warning-box" style="margin-top: var(--spacing-lg);">
                <i class="fas fa-info-circle"></i>
                <strong>${i18n.t('stamp-duty-note')}</strong> ${stampDutyMessage}
            </div>
        `;

        document.getElementById('amortization-results').innerHTML = resultsHtml;
        document.getElementById('amortization-results').style.display = 'block';
    }
}
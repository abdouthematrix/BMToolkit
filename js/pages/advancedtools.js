//  .js - advancedtools Page (Advanced Calculators)

import { i18n } from '../i18n.js';
import { FinancialCalculator } from '../services/financial-calculator.js';
import { FirestoreService } from '../services/firestore.js';

export class AdvancedToolsPage {
    static STORAGE_KEY = 'advancedtools-active-tab';
    static activeTab = 'first-month'; // Track active tab
    static collateralRowId = 0;

    static async init() {
        const router = window.app?.router;
        if (router) {
            // Determine active tab BEFORE rendering
            this.determineActiveTab();
            
            router.render(this.render());
            i18n.updatePageText();
            await this.loadConstants();
            this.attachEventListeners();
            this.setDefaultDates();
            this.autoCalculateIfNeeded();
        }
    }

    static determineActiveTab() {
        const savedTab = sessionStorage.getItem(this.STORAGE_KEY);
        const urlParams = window.app?.router?.getQueryParams() || {};
        
        // URL parameter takes precedence over saved tab
        this.activeTab = urlParams.tab || savedTab || 'first-month';
    }

    static async loadConstants() {
        const constants = await FirestoreService.getConstants();
        // Set default stamp duty rate
        document.getElementById('stamp-duty-rate').value = constants.STAMP_DUTY_RATE;
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
                        <button class="tab-btn ${this.activeTab === 'first-month' ? 'active' : ''}" data-tab="first-month">
                            <i class="fas fa-calendar-day"></i>
                            <span data-i18n="tab-first-month">First Month Interest</span>
                        </button>
                        <button class="tab-btn ${this.activeTab === 'amortization' ? 'active' : ''}" data-tab="amortization">
                            <i class="fas fa-table"></i>
                            <span data-i18n="tab-amortization">Amortization Schedule</span>
                        </button>
                        <button class="tab-btn ${this.activeTab === 'collateral' ? 'active' : ''}" data-tab="collateral">
                            <i class="fas fa-shield-alt"></i>
                            <span data-i18n="tab-collateral">Collateral Utility</span>
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div id="calculator-content">
                        ${this.renderFirstMonthTab()}
                        ${this.renderAmortizationTab()}
                        ${this.renderCollateralTab()}
                    </div>
                </div>
            </div>
        `;
    }

    static renderFirstMonthTab() {
        return `
            <div class="tab-content ${this.activeTab === 'first-month' ? 'active' : ''}" data-tab-content="first-month">
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
                                <input type="number" id="rate-first" class="form-input" value="18" min="0" max="100" step="0.01" required>
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
            <div class="tab-content ${this.activeTab === 'amortization' ? 'active' : ''}" data-tab-content="amortization">
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
                                <input type="number" id="rate-amort" class="form-input" value="18" min="0" max="100" step="0.01" required>
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
                                <input type="number" id="stamp-duty-rate" class="form-input" value="0.0005" min="0" step="0.0001" required>
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

    static renderCollateralTab() {
        return `
            <div class="tab-content ${this.activeTab === 'collateral' ? 'active' : ''}" data-tab-content="collateral">
                <div class="card-body">
                    <h3 data-i18n="collateral-utility-title">Collateral Utility</h3>
                    <p class="text-muted" data-i18n="collateral-utility-desc">Compute new collateral distribution for a target loan balance.</p>

                    <div class="info-box" style="margin-top: var(--spacing-lg);">
                        <i class="fas fa-info-circle"></i>
                        <strong data-i18n="collateral-utility-rules">Rules:</strong>
                        <span data-i18n="collateral-utility-rules-desc">Loan per TD is the lower of 90% of collateral and prorated redemption amount. Collateral is rounded up to 1,000 multiples.</span>
                    </div>

                    <form id="collateral-form" style="margin-top: var(--spacing-lg);">
                        <div class="form-group">
                            <label class="form-label" data-i18n="current-loan-balance">Current Loan Balance</label>
                            <input type="number" id="collateral-loan-balance" class="form-input" value="0" min="0" step="1" required>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; margin: var(--spacing-lg) 0 var(--spacing-sm);">
                            <h4 style="margin: 0;" data-i18n="td-list">TD List</h4>
                            <button type="button" class="btn-secondary" id="add-collateral-row">
                                <i class="fas fa-plus"></i>
                                <span data-i18n="add-td">Add TD</span>
                            </button>
                        </div>

                        <div id="collateral-rows" style="display: grid; gap: var(--spacing-md);"></div>

                        <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-lg);">
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-calculator"></i>
                                <span data-i18n="calculate">Calculate</span>
                            </button>
                            <button type="reset" class="btn-secondary" id="reset-collateral-form">
                                <i class="fas fa-redo"></i>
                                <span data-i18n="reset">Reset</span>
                            </button>
                        </div>
                    </form>

                    <div id="collateral-results" style="display: none; margin-top: var(--spacing-xl);"></div>
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
                // Save tab preference
                this.saveTabState(tab);
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

        document.getElementById('collateral-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateCollateral();
        });

        document.getElementById('add-collateral-row').addEventListener('click', () => {
            this.addCollateralRow();
        });

        document.getElementById('reset-collateral-form').addEventListener('click', () => {
            setTimeout(() => {
                this.initializeCollateralRows();
            }, 0);
        });

        this.initializeCollateralRows();
    }

    static saveTabState(tab) {
        this.activeTab = tab;
        sessionStorage.setItem(this.STORAGE_KEY, tab);
    }

    static switchTab(tab) {
        const tabBtn = document.querySelector(`[data-tab="${tab}"]`);
        const tabContent = document.querySelector(`[data-tab-content="${tab}"]`);

        if (tabBtn && tabContent) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            tabBtn.classList.add('active');
            tabContent.classList.add('active');
        }
    }

    static autoCalculateIfNeeded() {
        const urlParams = window.app?.router?.getQueryParams() || {};
        const tab = urlParams.tab;

        if (!tab) return;

        // Populate form fields and calculate based on tab type
        switch (tab) {
            case 'first-month':
                if (urlParams.principal) document.getElementById('principal-first').value = urlParams.principal;
                if (urlParams.rate) document.getElementById('rate-first').value = urlParams.rate;
                if (urlParams.startDate) document.getElementById('start-date-first').value = urlParams.startDate;
                if (urlParams.term) document.getElementById('loan-term-first').value = urlParams.term;
                if (urlParams.unit) document.getElementById('is-years-first').checked = urlParams.unit === 'months';
                this.calculateFirstMonth();
                break;

            case 'amortization':
                if (urlParams.principal) document.getElementById('principal-amort').value = urlParams.principal;
                if (urlParams.rate) document.getElementById('rate-amort').value = urlParams.rate;
                if (urlParams.startDate) document.getElementById('start-date-amort').value = urlParams.startDate;
                if (urlParams.term) document.getElementById('loan-term-amort').value = urlParams.term;
                if (urlParams.stampDuty) document.getElementById('stamp-duty-rate').value = urlParams.stampDuty;
                if (urlParams.unit) document.getElementById('is-years-amort').checked = urlParams.unit === 'months';
                this.calculateAmortization();
                break;

            case 'collateral':
                if (urlParams.loanBalance) document.getElementById('collateral-loan-balance').value = urlParams.loanBalance;
                this.initializeCollateralRows(this.parseCollateralRowsFromUrl(urlParams.tds));
                this.calculateCollateral();
                break;
        }
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

        // Update URL parameters using tab as single identifier
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                tab: 'first-month',
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

        // Update URL parameters using tab as single identifier
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                tab: 'amortization',
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

    static initializeCollateralRows(initialRows = []) {
        const container = document.getElementById('collateral-rows');
        if (!container) return;

        container.innerHTML = '';
        this.collateralRowId = 0;
        if (Array.isArray(initialRows) && initialRows.length) {
            initialRows.forEach(row => this.addCollateralRow(row));
            return;
        }

        this.addCollateralRow();
    }

    static addCollateralRow(initialData = {}) {
        const container = document.getElementById('collateral-rows');
        if (!container) return;

        const rowId = this.collateralRowId++;
        const totalAmount = Number(initialData.totalAmount) || 0;
        const redemptionAmount = Number(initialData.redemptionAmount) || 0;
        const currentCollateral = Number(initialData.currentCollateral) || 0;
        const row = document.createElement('div');
        row.className = 'card';
        row.dataset.rowId = String(rowId);
        row.style.padding = 'var(--spacing-md)';
        row.innerHTML = `
            <div class="grid grid-3">
                <div class="form-group">
                    <label class="form-label" data-i18n="td-total-amount">Total Amount</label>
                    <input type="number" class="form-input collateral-total-amount" min="0" step="1" value="${totalAmount}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="td-redemption-amount">Total Redemption Amount</label>
                    <input type="number" class="form-input collateral-redemption-amount" min="0" step="1" value="${redemptionAmount}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" data-i18n="current-collateral-amount">Current Collateral Amount</label>
                    <input type="number" class="form-input collateral-current-amount" min="0" step="1000" value="${currentCollateral}" required>
                </div>
            </div>
            <div style="display: flex; justify-content: flex-end;">
                <button type="button" class="btn-secondary remove-collateral-row">
                    <i class="fas fa-trash"></i>
                    <span data-i18n="remove">Remove</span>
                </button>
            </div>
        `;

        row.querySelector('.remove-collateral-row').addEventListener('click', () => {
            row.remove();
            if (!container.children.length) {
                this.addCollateralRow();
            }
        });

        container.appendChild(row);
        i18n.updatePageText();
    }

    static parseCollateralRowsFromUrl(serializedRows) {
        if (!serializedRows) return [];

        try {
            const parsedRows = JSON.parse(serializedRows);
            if (!Array.isArray(parsedRows)) return [];

            return parsedRows.map(row => ({
                totalAmount: Number(row.totalAmount) || 0,
                redemptionAmount: Number(row.redemptionAmount) || 0,
                currentCollateral: Number(row.currentCollateral) || 0
            }));
        } catch {
            return [];
        }
    }

    static calculateCollateral() {
        const currentLoanBalance = parseFloat(document.getElementById('collateral-loan-balance').value) || 0;
        const rows = [...document.querySelectorAll('#collateral-rows [data-row-id]')];
        const tds = rows.map((row, index) => ({
            tdNumber: index + 1,
            totalAmount: parseFloat(row.querySelector('.collateral-total-amount')?.value) || 0,
            redemptionAmount: parseFloat(row.querySelector('.collateral-redemption-amount')?.value) || 0,
            currentCollateral: parseFloat(row.querySelector('.collateral-current-amount')?.value) || 0
        }));

        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                tab: 'collateral',
                loanBalance: currentLoanBalance,
                tds: JSON.stringify(tds.map(td => ({
                    totalAmount: td.totalAmount,
                    redemptionAmount: td.redemptionAmount,
                    currentCollateral: td.currentCollateral
                })))
            });
        }

        const result = FinancialCalculator.calculateCollateralForLoan({
            currentLoanBalance,
            tds
        });

        const resultsHtml = `
            <div class="info-box">
                <h4><i class="fas fa-chart-pie"></i> ${i18n.t('summary')}</h4>
                <div class="grid grid-3" style="margin-top: var(--spacing-md);">
                    <div>
                        <strong data-i18n="current-loan-balance">Current Loan Balance</strong><br>
                        <span style="font-size: 1.25rem; color: var(--primary);">${i18n.formatCurrency(result.currentLoanBalance)}</span>
                    </div>
                    <div>
                        <strong data-i18n="supported-loan-amount">Supported Loan Amount</strong><br>
                        <span style="font-size: 1.25rem; color: var(--secondary);">${i18n.formatCurrency(result.totalSupportedLoan)}</span>
                    </div>
                    <div>
                        <strong data-i18n="loan-shortfall">Loan Shortfall</strong><br>
                        <span style="font-size: 1.25rem; color: ${result.shortfall > 0 ? 'var(--danger)' : 'var(--success)'};">${i18n.formatCurrency(result.shortfall)}</span>
                    </div>
                </div>
            </div>
            <div class="results-table-wrapper" style="overflow-x: auto; margin-top: var(--spacing-lg);">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>TD</th>
                            <th data-i18n="td-total-amount">Total Amount</th>
                            <th data-i18n="td-redemption-amount">Total Redemption Amount</th>
                            <th data-i18n="current-collateral-amount">Current Collateral Amount</th>
                            <th data-i18n="new-collateral-amount">New Collateral Amount</th>
                            <th data-i18n="loan-supported">Loan Supported</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${result.rows.map(row => `
                            <tr>
                                <td>${row.tdNumber}</td>
                                <td class="number-display">${i18n.formatCurrency(row.totalAmount)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.redemptionAmount)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.currentCollateral)}</td>
                                <td class="number-display font-bold">${i18n.formatCurrency(row.newCollateral)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.loanSupported)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('collateral-results').innerHTML = resultsHtml;
        document.getElementById('collateral-results').style.display = 'block';
        i18n.updatePageText();
    }
}

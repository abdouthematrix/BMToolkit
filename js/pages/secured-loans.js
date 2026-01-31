// secured-loans.js - Secured Loans Page with All Calculators

import { i18n } from '../i18n.js';
import { FinancialCalculator } from '../services/financial-calculator.js';
import { FirestoreService } from '../services/firestore.js';

export class SecuredLoansPage {
    static constants = null;

    static async init() {
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

        // Update form defaults
        document.getElementById('cd-rate').value = (this.constants.CD_RATE * 100).toFixed(2);
        document.getElementById('cd-rate-optimizer').value = (this.constants.CD_RATE * 100).toFixed(2);

        // Note: loan-rate-optimizer field removed - calculated automatically from CD rate
    }

    static render() {
        return `
            <div class="container">
                <div style="margin-bottom: var(--spacing-2xl);">
                    <h1><i class="fas fa-shield-alt" style="color: var(--primary);"></i> <span data-i18n="secured-loans-title">Secured Loans</span></h1>
                    <p class="text-muted" data-i18n="secured-loans-desc">Calculate loans backed by certificates of deposit</p>
                </div>

                <!-- Calculators Tabs -->
                <div class="card">
                    <div style="border-bottom: 2px solid var(--border-color); padding: var(--spacing-md); display: flex; gap: var(--spacing-sm); overflow-x: auto;">
                        <button class="tab-btn active" data-tab="smart-investment">
                            <i class="fas fa-chart-line"></i>
                            <span data-i18n="smart-investment">Smart Investment Tool</span>
                        </button>
                        <button class="tab-btn" data-tab="smart-optimizer">
                            <i class="fas fa-sliders-h"></i>
                            <span data-i18n="smart-optimizer">Smart Loan Optimizer</span>
                        </button>
                        <button class="tab-btn" data-tab="loan-calculator">
                            <i class="fas fa-calculator"></i>
                            <span data-i18n="loan-calculator">Loan Calculator</span>
                        </button>
                        <button class="tab-btn" data-tab="max-loan">
                            <i class="fas fa-money-bill-wave"></i>
                            <span data-i18n="max-loan-calc">Max Loan</span>
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div id="calculator-content">
                        ${this.renderSmartInvestmentTab()}
                        ${this.renderSmartOptimizerTab()}
                        ${this.renderLoanCalculatorTab()}
                        ${this.renderMaxLoanTab()}
                    </div>
                </div>

                <!-- Link to advancedtools -->
                <div class="info-box" style="margin-top: var(--spacing-lg);">
                    <i class="fas fa-info-circle"></i>
                    <p style="margin: 0;">
                        <strong data-i18n="advancedtools-info">Need First Month Interest or Amortization Schedule?</strong><br>
                        <span data-i18n="advancedtools-link-secured">Visit the Advanced Tools page for advanced calculators that work with both secured and unsecured loans.</span> <a href="#advancedtools" style="color: var(--primary); font-weight: 600;">Advanced Tools</a>
                    </p>
                </div>
            </div>
        `;
    }

    static renderSmartInvestmentTab() {
        return `
            <div class="tab-content active" data-tab-content="smart-investment">
                <div class="card-body">
                    <h3 data-i18n="smart-investment">Smart Investment Tool</h3>
                    <p class="text-muted" data-i18n="smart-investment-desc">Compare 4 investment scenarios with your certificate</p>

                    <!-- Form -->
                    <form id="smart-investment-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-3">
                            <div class="form-group">
                                <label class="form-label" data-i18n="td-amount">Certificate Amount</label>
                                <input type="number" id="td-amount" class="form-input" value="100000" min="0" step="1000" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="cd-rate">Certificate Rate (%)</label>
                                <input type="number" id="cd-rate" class="form-input" value="16" min="0" max="100" step="0.1" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="loan-term">Loan Term (Years)</label>
                                <input type="number" id="td-years" class="form-input" value="3" min="1" max="10" step="1" required>
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

                    <!-- Results -->
                    <div id="smart-investment-results" style="display: none; margin-top: var(--spacing-xl);"></div>
                </div>
            </div>
        `;
    }

    static renderSmartOptimizerTab() {
        return `
            <div class="tab-content" data-tab-content="smart-optimizer">
                <div class="card-body">
                    <h3 data-i18n="smart-optimizer">Smart Loan Optimizer</h3>
                    <p class="text-muted" data-i18n="smart-optimizer-desc">Find the optimal loan amount (0-90%)</p>

                    <!-- Form -->
                    <form id="smart-optimizer-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="principal">Certificate Amount</label>
                                <input type="number" id="principal-optimizer" class="form-input" value="100000" min="0" step="1000" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="cd-rate">CD Rate (%)</label>
                                <input type="number" id="cd-rate-optimizer" class="form-input" value="16" min="0" max="100" step="0.1" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="loan-term">Loan Term (Months)</label>
                                <input type="number" id="loan-term-optimizer" class="form-input" value="36" min="1" max="120" step="1" required>
                            </div>
                        </div>
                        <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md);">
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-search"></i>
                                <span data-i18n="find-optimal">Find Optimal Loan</span>
                            </button>
                            <button type="reset" class="btn-secondary">
                                <i class="fas fa-redo"></i>
                                <span data-i18n="reset">Reset</span>
                            </button>
                        </div>
                    </form>

                    <!-- Results -->
                    <div id="smart-optimizer-results" style="display: none; margin-top: var(--spacing-xl);"></div>
                </div>
            </div>
        `;
    }

    static renderLoanCalculatorTab() {
        return `
            <div class="tab-content" data-tab-content="loan-calculator">
                <div class="card-body">
                    <h3 data-i18n="loan-calculator">Loan Calculator</h3>
                    <p class="text-muted" data-i18n="loan-calculator-desc">Calculate monthly payments for different tenors</p>

                    <!-- Form -->
                    <form id="loan-calculator-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="principal">Loan Amount</label>
                                <input type="number" id="principal-loan" class="form-input" value="100000" min="0" step="1000" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="interest-rate">Annual Interest Rate (%)</label>
                                <input type="number" id="rate-loan" class="form-input" value="18" min="0" max="100" step="0.1" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="tenor-range">Tenor Range</label>
                                <div style="display: flex; gap: var(--spacing-sm);">
                                    <input type="number" id="min-tenor-loan" class="form-input" value="1" min="1" max="10" data-i18n-placeholder="min-tenor" placeholder="Min" required>
                                    <input type="number" id="max-tenor-loan" class="form-input" value="5" min="1" max="10" data-i18n-placeholder="max-tenor" placeholder="Max" required>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="is-years-loan" checked>
                                <span data-i18n="years">Years (vs Months)</span>
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

                    <!-- Results -->
                    <div id="loan-calculator-results" style="display: none; margin-top: var(--spacing-xl);"></div>
                </div>
            </div>
        `;
    }

    static renderMaxLoanTab() {
        return `
            <div class="tab-content" data-tab-content="max-loan">
                <div class="card-body">
                    <h3 data-i18n="max-loan-calc">Maximum Loan Calculator</h3>
                    <p class="text-muted" data-i18n="max-loan-calc-desc">Calculate maximum loan based on monthly payment</p>

                    <!-- Form -->
                    <form id="max-loan-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="monthly-payment">Monthly Payment Capacity</label>
                                <input type="number" id="monthly-payment-max" class="form-input" value="5000" min="0" step="100" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="interest-rate">Annual Interest Rate (%)</label>
                                <input type="number" id="rate-max" class="form-input" value="18" min="0" max="100" step="0.1" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="tenor-range">Tenor Range</label>
                                <div style="display: flex; gap: var(--spacing-sm);">
                                    <input type="number" id="min-tenor-max" class="form-input" value="1" min="1" max="10" data-i18n-placeholder="min-tenor" placeholder="Min" required>
                                    <input type="number" id="max-tenor-max" class="form-input" value="5" min="1" max="10" data-i18n-placeholder="max-tenor" placeholder="Max" required>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="is-years-max" checked>
                                <span data-i18n="years">Years (vs Months)</span>
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

                    <!-- Results -->
                    <div id="max-loan-results" style="display: none; margin-top: var(--spacing-xl);"></div>
                </div>
            </div>
        `;
    }

    static attachEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;

                // Update active states
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                e.currentTarget.classList.add('active');
                document.querySelector(`[data-tab-content="${tab}"]`).classList.add('active');
            });
        });

        // Form submissions
        document.getElementById('smart-investment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateSmartInvestment();
        });

        document.getElementById('smart-optimizer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateSmartOptimizer();
        });

        document.getElementById('loan-calculator-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateLoan();
        });

        document.getElementById('max-loan-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateMaxLoan();
        });
    }

    static calculateSmartInvestment() {
        const tdAmount = parseFloat(document.getElementById('td-amount').value);
        const tdRate = parseFloat(document.getElementById('cd-rate').value) / 100;
        const years = parseInt(document.getElementById('td-years').value);

        // Update URL parameters
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                calc: 'smart-investment',
                amount: tdAmount,
                rate: (tdRate * 100).toFixed(2),
                years: years
            });
        }

        // Pass constants to calculator
        const scenarios = FinancialCalculator.calculateAllScenarios(tdAmount, tdRate, years, this.constants);

        const resultsHtml = `
            <h4 data-i18n="investment-scenarios">Investment Scenarios Comparison</h4>
            <div class="results-table-wrapper" style="overflow-x: auto;">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th data-i18n="scenario">Scenario</th>
                            <th data-i18n="loan-amount">Loan Amount</th>
                            <th data-i18n="monthly-interest">Monthly Interest</th>
                            <th data-i18n="monthly-payment">Monthly Installment</th>
                            <th data-i18n="net-monthly">Net Monthly Payment</th>
                            <th data-i18n="total-interest">Total Interest</th>
                            <th data-i18n="loan-interest">Loan Interest</th>
                            <th data-i18n="final-amount">Final Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${scenarios.map((scenario, index) => `
                            <tr class="${index === scenarios.length - 1 ? 'best-option' : ''}">
                                <td><strong>${i18n.currentLanguage === 'ar' ? scenario.title : scenario.titleEn}</strong></td>
                                <td class="number-display">${i18n.formatCurrency(scenario.loan)}</td>
                                <td class="number-display">${i18n.formatCurrency(scenario.monthlyInterest)}</td>
                                <td class="number-display">${i18n.formatCurrency(scenario.monthlyInstallment)}</td>
                                <td class="number-display">${i18n.formatCurrency(scenario.netMonthlyPay)}</td>
                                <td class="number-display">${i18n.formatCurrency(scenario.totalInterest)}</td>
                                <td class="number-display">${i18n.formatCurrency(scenario.loanInterest)}</td>
                                <td class="number-display font-bold">${i18n.formatCurrency(scenario.finalAmount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('smart-investment-results').innerHTML = resultsHtml;
        document.getElementById('smart-investment-results').style.display = 'block';
        i18n.updatePageText();
    }

    static async calculateSmartOptimizer() {
        const principal = parseFloat(document.getElementById('principal-optimizer').value);
        const cdRate = parseFloat(document.getElementById('cd-rate-optimizer').value) / 100;
        const loanTerm = parseInt(document.getElementById('loan-term-optimizer').value);

        // Update URL parameters
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                calc: 'smart-optimizer',
                principal: principal,
                cdRate: (cdRate * 100).toFixed(2),
                term: loanTerm
            });
        }

        // Pass constants to calculator (loan rate will be calculated inside)
        const result = await FinancialCalculator.calculateSmartLoan({
            principal,
            cdRate,
            loanTerm
        }, this.constants);

        const resultsHtml = `
            <div class="highlight-box">
                <h3><i class="fas fa-trophy"></i> <span data-i18n="optimalLoanConfig">Optimal Loan Configuration<</span></h3>
                <div class="grid grid-2" style="margin-top: var(--spacing-md);">
                    <div>
                        <p style="margin: 0; opacity: 0.9;" data-i18n="optimalLoanAmount">Optimal Loan Amount:</p>
                        <p style="font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--primary);">${i18n.formatCurrency(result.bestResult.loanAmount)}</p>
                    </div>
                    <div>
                       <p style="margin:0; opacity:0.9;" data-i18n="monthlyNetProfit">Monthly Net Profit:</p>
                        <p style="font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--accent);">${i18n.formatCurrency(result.bestResult.netMonthlyProfit)}</p>
                    </div>                  
                    <div>
                        <p style="margin:0; opacity:0.9;" data-i18n="grandTotal">Grand Total:</p>
                        <p style="font-size: 1.25rem; font-weight: 600; margin: 0;">${i18n.formatCurrency(result.bestResult.grandTotal)}</p>
                    </div>
                </div>
            </div>

            <h4 style="margin-top: var(--spacing-xl);" data-i18n="detailed-results">Detailed Results</h4>
            <div class="results-table-wrapper" style="overflow-x: auto;">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th data-i18n="loan-amount">Loan Amount</th>
                            <th data-i18n="monthly-income-amount">Monthly Income</th>
                            <th data-i18n="monthly-payment">Monthly Payment</th>
                            <th data-i18n="net-monthly-profit">Net Monthly Profit</th>
                            <th data-i18n="grand-total">Grand Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${result.results.map(row => `
                            <tr class="${row.loanAmount === result.bestResult.loanAmount ? 'best-option' : ''}">
                                <td class="number-display">${i18n.formatCurrency(row.loanAmount)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.totalMonthlyIncome)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.monthlyPayment)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.netMonthlyProfit)}</td>
                                <td class="number-display font-bold">${i18n.formatCurrency(row.grandTotal)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('smart-optimizer-results').innerHTML = resultsHtml;
        document.getElementById('smart-optimizer-results').style.display = 'block';
        i18n.updatePageText();
    }

    static calculateLoan() {
        const principal = parseFloat(document.getElementById('principal-loan').value);
        const annualRate = parseFloat(document.getElementById('rate-loan').value) / 100;
        const minTenor = parseInt(document.getElementById('min-tenor-loan').value);
        const maxTenor = parseInt(document.getElementById('max-tenor-loan').value);
        const isYears = document.getElementById('is-years-loan').checked;

        // Update URL parameters
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                calc: 'loan-calculator',
                principal: principal,
                rate: (annualRate * 100).toFixed(2),
                minTenor: minTenor,
                maxTenor: maxTenor,
                unit: isYears ? 'years' : 'months'
            });
        }

        const results = FinancialCalculator.calculateLoanSchedule(principal, annualRate, minTenor, maxTenor, isYears);

        const resultsHtml = `
            <h4 data-i18n="payment-schedule">Loan Payment Schedule</h4>
            <div class="results-table-wrapper" style="overflow-x: auto;">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th data-i18n="tenor">Tenor</th>
                            <th data-i18n="monthly-payment">Monthly Payment</th>
                            <th data-i18n="total-payment">Total Payment</th>
                            <th data-i18n="total-interest">Total Interest</th>
                            <th data-i18n="flat-rate">Flat Rate (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(row => `
                            <tr>
                                <td>${row.tenor} ${isYears ? i18n.t('years') : i18n.t('months')}</td>
                                <td class="number-display">${i18n.formatCurrency(row.monthlyPayment)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.totalPayment)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.totalInterest)}</td>
                                <td class="number-display">${i18n.formatPercent(row.flatRate)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('loan-calculator-results').innerHTML = resultsHtml;
        document.getElementById('loan-calculator-results').style.display = 'block';
        i18n.updatePageText();
    }

    static calculateMaxLoan() {
        const monthlyPayment = parseFloat(document.getElementById('monthly-payment-max').value);
        const annualRate = parseFloat(document.getElementById('rate-max').value) / 100;
        const minTenor = parseInt(document.getElementById('min-tenor-max').value);
        const maxTenor = parseInt(document.getElementById('max-tenor-max').value);
        const isYears = document.getElementById('is-years-max').checked;

        // Update URL parameters
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                calc: 'max-loan',
                payment: monthlyPayment,
                rate: (annualRate * 100).toFixed(2),
                minTenor: minTenor,
                maxTenor: maxTenor,
                unit: isYears ? 'years' : 'months'
            });
        }

        const results = FinancialCalculator.generateLoanResults(annualRate, minTenor, maxTenor, monthlyPayment, isYears);

        const resultsHtml = `
            <h4 data-i18n="maximum-loan-amounts">Maximum Loan Amounts</h4>
            <div class="results-table-wrapper" style="overflow-x: auto;">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th data-i18n="tenor">Tenor</th>
                            <th data-i18n="max-loan">Max Loan</th>
                            <th data-i18n="monthly-payment">Monthly Payment</th>
                            <th data-i18n="total-payment">Total Payment</th>
                            <th data-i18n="total-interest">Total Interest</th>
                            <th data-i18n="flat-rate">Flat Rate (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(row => `
                            <tr>
                                <td>${row.tenor} ${isYears ? i18n.t('years') : i18n.t('months')}</td>
                                <td class="number-display font-bold">${i18n.formatCurrency(row.maxLoan)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.monthlyPayment)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.totalPayment)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.totalInterest)}</td>
                                <td class="number-display">${i18n.formatPercent(row.flatRate)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('max-loan-results').innerHTML = resultsHtml;
        document.getElementById('max-loan-results').style.display = 'block';
        i18n.updatePageText();
    }
}
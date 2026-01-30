// unsecured-loans.js - Unsecured Loans Page

import { i18n } from '../i18n.js';
import { FinancialCalculator } from '../services/financial-calculator.js';
import { FirestoreService } from '../services/firestore.js';

export class UnsecuredLoansPage {
    static products = [];
    static selectedProduct = null;

    static async init() {
        const router = window.app?.router;
        if (router) {
            router.render(this.render());
            i18n.updatePageText();
            await this.loadProducts();
            this.attachEventListeners();
        }
    }

    static async loadProducts() {
        this.products = await FirestoreService.getProducts();
        if (this.products.length === 0) {
            // Load from CSV if no products in Firestore
            this.products = this.getDefaultProducts();
        }
        this.populateProductSelect();
    }

    static render() {
        return `
            <div class="container">
                <div style="margin-bottom: var(--spacing-2xl);">
                    <h1><i class="fas fa-handshake" style="color: var(--secondary);"></i> <span data-i18n="unsecured-loans-title">Unsecured Loans</span></h1>
                    <p class="text-muted" data-i18n="unsecured-loans-desc">Personal loans based on income and employment</p>
                </div>

                <!-- Product Selector Card -->
                <div class="card" style="margin-bottom: var(--spacing-lg);">
                    <div class="card-header">
                        <h3 class="card-title" data-i18n="select-product">Select Product</h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-3">
                            <div class="form-group">
                                <label class="form-label" data-i18n="sector">Sector</label>
                                <select id="sector-filter" class="form-select">
                                    <option value="">All</option>
                                    <option value="Government/Public">Government/Public</option>
                                    <option value="Private">Private</option>
                                    <option value="Not Specified">Not Specified</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="payroll">Payroll Type</label>
                                <select id="payroll-filter" class="form-select">
                                    <option value="">All</option>
                                    <option value="Contracted">Contracted</option>
                                    <option value="Non-Contracted">Non-Contracted</option>
                                    <option value="Not Specified">Not Specified</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="company-segment">Company Segment</label>
                                <select id="segment-filter" class="form-select">
                                    <option value="">All</option>
                                    <option value="A+">A+</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="Not Specified">Not Specified</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="product">Product</label>
                            <select id="product-select" class="form-select">
                                <option value="">Select a product</option>
                            </select>
                        </div>
                        <div id="product-info" style="display: none; margin-top: var(--spacing-md);"></div>
                    </div>
                </div>

                <!-- Calculators Tabs -->
                <div class="card">
                    <div style="border-bottom: 2px solid var(--border-color); padding: var(--spacing-md); display: flex; gap: var(--spacing-sm); overflow-x: auto;">
                        <button class="tab-btn active" data-tab="by-income">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>Max Loan by Income</span>
                        </button>
                        <button class="tab-btn" data-tab="loan-schedule">
                            <i class="fas fa-calculator"></i>
                            <span data-i18n="loan-calculator">Loan Calculator</span>
                        </button>
                        <button class="tab-btn" data-tab="first-month">
                            <i class="fas fa-calendar-day"></i>
                            <span>First Month Interest</span>
                        </button>
                        <button class="tab-btn" data-tab="amortization">
                            <i class="fas fa-table"></i>
                            <span>Amortization Schedule</span>
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div id="calculator-content">
                        ${this.renderByIncomeTab()}
                        ${this.renderLoanScheduleTab()}
                        ${this.renderFirstMonthTab()}
                        ${this.renderAmortizationTab()}
                    </div>
                </div>
            </div>
        `;
    }

    static renderByIncomeTab() {
        return `
            <div class="tab-content active" data-tab-content="by-income">
                <div class="card-body">
                    <h3>Max Loan by Income</h3>
                    <p class="text-muted">Calculate maximum loan based on your monthly income</p>

                    <!-- Form -->
                    <form id="by-income-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="monthly-income">Monthly Income</label>
                                <input type="number" id="monthly-income" class="form-input" value="10000" min="0" step="100" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="monthly-installments">Current Monthly Installments</label>
                                <input type="number" id="monthly-installments" class="form-input" value="0" min="0" step="100" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="max-dti">Max Debt-to-Income (%)</label>
                                <input type="number" id="max-dti" class="form-input" value="50" min="0" max="100" step="1" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tenor Range</label>
                                <div style="display: flex; gap: var(--spacing-sm);">
                                    <input type="number" id="min-tenor-income" class="form-input" value="1" min="1" max="10" placeholder="Min" required>
                                    <input type="number" id="max-tenor-income" class="form-input" value="5" min="1" max="10" placeholder="Max" required>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="is-years-income" checked>
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
                    <div id="by-income-results" style="display: none; margin-top: var(--spacing-xl);"></div>
                </div>
            </div>
        `;
    }

    static renderLoanScheduleTab() {
        return `
            <div class="tab-content" data-tab-content="loan-schedule">
                <div class="card-body">
                    <h3 data-i18n="loan-calculator">Loan Calculator</h3>
                    <p class="text-muted">Calculate payments for a specific loan amount</p>

                    <form id="loan-schedule-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="principal">Principal Amount</label>
                                <input type="number" id="principal-schedule" class="form-input" value="100000" min="0" step="1000" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tenor Range</label>
                                <div style="display: flex; gap: var(--spacing-sm);">
                                    <input type="number" id="min-tenor-schedule" class="form-input" value="1" min="1" max="10" placeholder="Min" required>
                                    <input type="number" id="max-tenor-schedule" class="form-input" value="5" min="1" max="10" placeholder="Max" required>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="is-years-schedule" checked>
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

                    <div id="loan-schedule-results" style="display: none; margin-top: var(--spacing-xl);"></div>
                </div>
            </div>
        `;
    }

    static renderFirstMonthTab() {
        return `
            <div class="tab-content" data-tab-content="first-month">
                <div class="card-body">
                    <h3>First Month Interest</h3>
                    <p class="text-muted">Calculate initial interest for loan start date</p>

                    <form id="first-month-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="principal">Principal Amount</label>
                                <input type="number" id="principal-first" class="form-input" value="100000" min="0" step="1000" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="start-date">Start Date</label>
                                <input type="date" id="start-date-first" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="loan-term">Loan Term</label>
                                <input type="number" id="loan-term-first" class="form-input" value="36" min="1" max="120" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="is-years-first">
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

                    <div id="first-month-results" style="display: none; margin-top: var(--spacing-xl);"></div>
                </div>
            </div>
        `;
    }

    static renderAmortizationTab() {
        return `
            <div class="tab-content" data-tab-content="amortization">
                <div class="card-body">
                    <h3>Amortization Schedule</h3>
                    <p class="text-muted">Detailed payment schedule with stamp duty</p>

                    <form id="amortization-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="principal">Principal Amount</label>
                                <input type="number" id="principal-amort" class="form-input" value="100000" min="0" step="1000" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="start-date">Start Date</label>
                                <input type="date" id="start-date-amort" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="loan-term">Loan Term</label>
                                <input type="number" id="loan-term-amort" class="form-input" value="36" min="1" max="120" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="stamp-duty-rate">Stamp Duty Rate (‰)</label>
                                <input type="number" id="stamp-duty-rate" class="form-input" value="4" min="0" step="0.1" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="is-years-amort">
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

        // Product filters
        document.getElementById('sector-filter').addEventListener('change', () => this.filterProducts());
        document.getElementById('payroll-filter').addEventListener('change', () => this.filterProducts());
        document.getElementById('segment-filter').addEventListener('change', () => this.filterProducts());
        document.getElementById('product-select').addEventListener('change', (e) => this.selectProduct(e.target.value));

        // Form submissions
        document.getElementById('by-income-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateByIncome();
        });

        document.getElementById('loan-schedule-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateLoanSchedule();
        });

        document.getElementById('first-month-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateFirstMonth();
        });

        document.getElementById('amortization-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateAmortization();
        });

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('start-date-first').value = today;
        document.getElementById('start-date-amort').value = today;
    }

    static switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector(`[data-tab-content="${tab}"]`).classList.add('active');
    }

    static populateProductSelect() {
        const select = document.getElementById('product-select');
        select.innerHTML = '<option value="">Select a product</option>';
        
        this.products.forEach((product, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = i18n.currentLanguage === 'ar' ? product.nameAr : product.nameEn;
            select.appendChild(option);
        });
    }

    static filterProducts() {
        const sector = document.getElementById('sector-filter').value;
        const payroll = document.getElementById('payroll-filter').value;
        const segment = document.getElementById('segment-filter').value;

        const filtered = this.products.filter(product => {
            let match = true;
            if (sector && product.sector !== sector) match = false;
            if (payroll && product.payrollType !== payroll) match = false;
            if (segment && product.companySegment !== segment) match = false;
            return match;
        });

        const select = document.getElementById('product-select');
        select.innerHTML = '<option value="">Select a product</option>';
        
        filtered.forEach((product, index) => {
            const option = document.createElement('option');
            const originalIndex = this.products.indexOf(product);
            option.value = originalIndex;
            option.textContent = i18n.currentLanguage === 'ar' ? product.nameAr : product.nameEn;
            select.appendChild(option);
        });
    }

    static selectProduct(index) {
        if (!index) {
            this.selectedProduct = null;
            document.getElementById('product-info').style.display = 'none';
            return;
        }

        this.selectedProduct = this.products[index];
        const product = this.selectedProduct;

        const infoHtml = `
            <div class="info-box">
                <h4>${i18n.currentLanguage === 'ar' ? product.nameAr : product.nameEn}</h4>
                <div class="grid grid-3" style="margin-top: var(--spacing-md);">
                    <div>
                        <strong>UBS Code:</strong> ${product.ubsCode || 'N/A'}
                    </div>
                    <div>
                        <strong>Sector:</strong> ${product.sector || 'N/A'}
                    </div>
                    <div>
                        <strong>Payroll:</strong> ${product.payrollType || 'N/A'}
                    </div>
                </div>
                <div style="margin-top: var(--spacing-md);">
                    <strong>Rates:</strong>
                    <ul style="margin: var(--spacing-sm) 0 0 0; padding-left: var(--spacing-lg);">
                        ${product.rate1_5 ? `<li>1-5 years: ${product.rate1_5}</li>` : ''}
                        ${product.rate5_8 ? `<li>5-8 years: ${product.rate5_8}</li>` : ''}
                        ${product.rate8Plus ? `<li>8+ years: ${product.rate8Plus}</li>` : ''}
                    </ul>
                </div>
            </div>
        `;

        document.getElementById('product-info').innerHTML = infoHtml;
        document.getElementById('product-info').style.display = 'block';
    }

    static getProductRate(tenorYears) {
        if (!this.selectedProduct) return 0.18; // Default rate

        if (tenorYears <= 5 && this.selectedProduct.rate1_5) {
            return parseFloat(this.selectedProduct.rate1_5.replace('%', '')) / 100;
        } else if (tenorYears <= 8 && this.selectedProduct.rate5_8) {
            return parseFloat(this.selectedProduct.rate5_8.replace('%', '')) / 100;
        } else if (this.selectedProduct.rate8Plus) {
            return parseFloat(this.selectedProduct.rate8Plus.replace('%', '')) / 100;
        }
        return 0.18;
    }

    static calculateByIncome() {
        if (!this.selectedProduct) {
            window.app.showToast('Please select a product first', 'warning');
            return;
        }

        const monthlyIncome = parseFloat(document.getElementById('monthly-income').value);
        const monthlyInstallments = parseFloat(document.getElementById('monthly-installments').value);
        const maxDTI = parseFloat(document.getElementById('max-dti').value) / 100;
        const minTenor = parseInt(document.getElementById('min-tenor-income').value);
        const maxTenor = parseInt(document.getElementById('max-tenor-income').value);
        const isYears = document.getElementById('is-years-income').checked;

        // Calculate for each tenor using product rate
        const results = [];
        for (let tenor = minTenor; tenor <= maxTenor; tenor++) {
            const annualRate = this.getProductRate(tenor);
            const result = FinancialCalculator.calculateByIncome({
                annualRate,
                minTenor: tenor,
                maxTenor: tenor,
                monthlyIncome,
                monthlyInstallments,
                maxDTI,
                isYears
            });

            if (!result.error && result.length > 0) {
                results.push(...result);
            }
        }

        if (results.length === 0) {
            window.app.showToast('Payment capacity is negative or zero', 'error');
            return;
        }

        const resultsHtml = `
            <h4>Maximum Loan by Income</h4>
            <div class="results-table-wrapper" style="overflow-x: auto;">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th data-i18n="tenor">Tenor</th>
                            <th>Max Loan</th>
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

        document.getElementById('by-income-results').innerHTML = resultsHtml;
        document.getElementById('by-income-results').style.display = 'block';
        i18n.updatePageText();
    }

    static calculateLoanSchedule() {
        if (!this.selectedProduct) {
            window.app.showToast('Please select a product first', 'warning');
            return;
        }

        const principal = parseFloat(document.getElementById('principal-schedule').value);
        const minTenor = parseInt(document.getElementById('min-tenor-schedule').value);
        const maxTenor = parseInt(document.getElementById('max-tenor-schedule').value);
        const isYears = document.getElementById('is-years-schedule').checked;

        const results = [];
        for (let tenor = minTenor; tenor <= maxTenor; tenor++) {
            const annualRate = this.getProductRate(tenor);
            const result = FinancialCalculator.calculateLoanSchedule(principal, annualRate, tenor, tenor, isYears);
            results.push(...result);
        }

        const resultsHtml = `
            <h4>Loan Payment Schedule</h4>
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

        document.getElementById('loan-schedule-results').innerHTML = resultsHtml;
        document.getElementById('loan-schedule-results').style.display = 'block';
        i18n.updatePageText();
    }

    static calculateFirstMonth() {
        if (!this.selectedProduct) {
            window.app.showToast('Please select a product first', 'warning');
            return;
        }

        const principal = parseFloat(document.getElementById('principal-first').value);
        const startDate = document.getElementById('start-date-first').value;
        const loanTerm = parseInt(document.getElementById('loan-term-first').value);
        const isYears = document.getElementById('is-years-first').checked;
        const annualRate = this.getProductRate(isYears ? loanTerm : loanTerm / 12) * 100;

        const result = FinancialCalculator.calculateFirstMonthInterest({
            principal,
            annualRate,
            startDate,
            loanTerm,
            isYears
        });

        const resultsHtml = `
            <div class="highlight-box">
                <h3>First Month Calculation</h3>
                <div class="grid grid-2" style="margin-top: var(--spacing-md);">
                    <div>
                        <p style="margin: 0; opacity: 0.9;">First Payment Date:</p>
                        <p style="font-size: 1.25rem; font-weight: 600; margin: 0;">${result.endDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p style="margin: 0; opacity: 0.9;">Days Between:</p>
                        <p style="font-size: 1.25rem; font-weight: 600; margin: 0;">${result.daysBetween} days</p>
                    </div>
                    <div>
                        <p style="margin: 0; opacity: 0.9;">First Month Interest:</p>
                        <p style="font-size: 1.25rem; font-weight: 600; margin: 0;">${i18n.formatCurrency(result.firstMonthInterest)}</p>
                    </div>
                    <div>
                        <p style="margin: 0; opacity: 0.9;">Regular Monthly Payment:</p>
                        <p style="font-size: 1.25rem; font-weight: 600; margin: 0;">${i18n.formatCurrency(result.monthlyPayment)}</p>
                    </div>
                </div>
                <div style="margin-top: var(--spacing-lg); padding-top: var(--spacing-lg); border-top: 1px solid rgba(255,255,255,0.3);">
                    <p style="margin: 0; opacity: 0.9;">Total First Month Payment:</p>
                    <p style="font-size: 2rem; font-weight: 700; margin: var(--spacing-sm) 0 0 0;">${i18n.formatCurrency(result.totalFirstMonthlyPayment)}</p>
                </div>
            </div>
        `;

        document.getElementById('first-month-results').innerHTML = resultsHtml;
        document.getElementById('first-month-results').style.display = 'block';
    }

    static calculateAmortization() {
        if (!this.selectedProduct) {
            window.app.showToast('Please select a product first', 'warning');
            return;
        }

        const principal = parseFloat(document.getElementById('principal-amort').value);
        const startDate = document.getElementById('start-date-amort').value;
        const loanTerm = parseInt(document.getElementById('loan-term-amort').value);
        const stampDutyRate = parseFloat(document.getElementById('stamp-duty-rate').value);
        const isYears = document.getElementById('is-years-amort').checked;
        const annualRate = this.getProductRate(isYears ? loanTerm : loanTerm / 12) * 100;

        const result = FinancialCalculator.calculateAmortizationSchedule({
            principal,
            annualRate,
            startDate,
            loanTerm,
            stampDutyRate,
            isYears
        });

        const resultsHtml = `
            <div class="info-box">
                <div class="grid grid-3">
                    <div>
                        <strong>Monthly Payment:</strong> ${i18n.formatCurrency(result.monthlyPayment)}
                    </div>
                    <div>
                        <strong>Total Interest:</strong> ${i18n.formatCurrency(result.totalInterest)}
                    </div>
                    <div>
                        <strong>Total Stamp Duty:</strong> ${i18n.formatCurrency(result.totalStampDuty)}
                    </div>
                </div>
            </div>

            <h4 style="margin-top: var(--spacing-lg);">Payment Schedule</h4>
            <div class="results-table-wrapper" style="overflow-x: auto; max-height: 500px;">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Payment Date</th>
                            <th>Monthly Payment</th>
                            <th>Interest</th>
                            <th>Principal</th>
                            <th>Stamp Duty</th>
                            <th>Remaining Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${result.results.map(row => `
                            <tr>
                                <td>${row.paymentNumber}</td>
                                <td>${row.paymentDate.toLocaleDateString()}</td>
                                <td class="number-display">${i18n.formatCurrency(row.monthlyPayment)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.interestPayment)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.principalPayment)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.stampDutyAmount)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.remainingBalance)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('amortization-results').innerHTML = resultsHtml;
        document.getElementById('amortization-results').style.display = 'block';
        i18n.updatePageText();
    }

    static getDefaultProducts() {
        // Sample products - would normally be loaded from CSV
        return [
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الحكومي والقطاع العام تحويل المرتب / القسط والمستحقات الجهات الحكومية المتعاقدة',
                nameEn: 'PL Contracted Salary Transfer',
                ubsCode: '3863',
                sector: 'Government/Public',
                payrollType: 'Contracted',
                companySegment: 'Not Specified',
                rate1_5: '22.75%',
                rate5_8: '22.25%',
                rate8Plus: '21.75%'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص تحويل المرتب / القسط والمستحقات الجهات المتعاقدة',
                nameEn: 'PL Contracted Salary Transfer Private',
                ubsCode: '3863',
                sector: 'Private',
                payrollType: 'Contracted',
                companySegment: 'C',
                rate1_5: '23.00%',
                rate5_8: 'Not Specified',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص تحويل المرتب / القسط والمستحقات الجهات المتعاقدة',
                nameEn: 'PL Contracted Salary Transfer Private',
                ubsCode: '3863',
                sector: 'Private',
                payrollType: 'Contracted',
                companySegment: 'B',
                rate1_5: '22.75%',
                rate5_8: '22.25%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص تحويل المرتب / القسط والمستحقات الجهات المتعاقدة',
                nameEn: 'PL Contracted Salary Transfer Private',
                ubsCode: '3863',
                sector: 'Private',
                payrollType: 'Contracted',
                companySegment: 'A',
                rate1_5: '22.75%',
                rate5_8: '22.25%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص تحويل المرتب / القسط والمستحقات الجهات المتعاقدة',
                nameEn: 'PL Contracted Salary Transfer Private',
                ubsCode: '3863',
                sector: 'Private',
                payrollType: 'Contracted',
                companySegment: 'A+',
                rate1_5: '22.75%',
                rate5_8: '22.25%',
                rate8Plus: '21.75%'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الحكومي والقطاع العام تحويل المرتب / القسط والمستحقات الجهات غير المتعاقدة',
                nameEn: 'PL Non-Contracted Salary Transfer',
                ubsCode: '3864',
                sector: 'Government/Public',
                payrollType: 'Non-Contracted',
                companySegment: 'Not Specified',
                rate1_5: '23.00%',
                rate5_8: '23.00%',
                rate8Plus: '22.50%'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص تحويل المرتب / القسط والمستحقات الجهات غير المتعاقدة',
                nameEn: 'PL Non-Contracted Salary Transfer Private',
                ubsCode: '3864',
                sector: 'Private',
                payrollType: 'Non-Contracted',
                companySegment: 'C',
                rate1_5: '23.25%',
                rate5_8: '23.25%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص تحويل المرتب / القسط والمستحقات الجهات غير المتعاقدة',
                nameEn: 'PL Non-Contracted Salary Transfer Private',
                ubsCode: '3864',
                sector: 'Private',
                payrollType: 'Non-Contracted',
                companySegment: 'B',
                rate1_5: '23.25%',
                rate5_8: '23.25%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص تحويل المرتب / القسط والمستحقات الجهات غير المتعاقدة',
                nameEn: 'PL Non-Contracted Salary Transfer Private',
                ubsCode: '3864',
                sector: 'Private',
                payrollType: 'Non-Contracted',
                companySegment: 'A',
                rate1_5: '23.00%',
                rate5_8: '23.00%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص تحويل المرتب / القسط والمستحقات الجهات غير المتعاقدة',
                nameEn: 'PL Non-Contracted Salary Transfer Private',
                ubsCode: '3864',
                sector: 'Private',
                payrollType: 'Non-Contracted',
                companySegment: 'A+',
                rate1_5: '23.00%',
                rate5_8: '23.00%',
                rate8Plus: '22.50%'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الحكومي والقطاع العام متقاعد تحويل المرتب / القسط دون المستحقات',
                nameEn: 'PL Contracted Salary Transfer Without Dues Governmental',
                ubsCode: '3948',
                sector: 'Government/Public',
                payrollType: 'Contracted',
                companySegment: 'Not Specified',
                rate1_5: '22.75%',
                rate5_8: '22.25%',
                rate8Plus: '21.75%'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الحكومي والقطاع العام غير متعاقد المرتب / القسط دون المستحقات',
                nameEn: 'PL Non-Contracted Salary Transfer Without Dues Governmental',
                ubsCode: '3948',
                sector: 'Government/Public',
                payrollType: 'Non-Contracted',
                companySegment: 'Not Specified',
                rate1_5: '23.00%',
                rate5_8: '23.00%',
                rate8Plus: '22.50%'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص (بدون مستحقات) الجهات المتعاقدة',
                nameEn: 'PL Contracted Salary Transfer Without Dues Private',
                ubsCode: '3948',
                sector: 'Private',
                payrollType: 'Contracted',
                companySegment: 'C',
                rate1_5: '23.00%',
                rate5_8: '23.00%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص (بدون مستحقات) الجهات المتعاقدة',
                nameEn: 'PL Contracted Salary Transfer Without Dues Private',
                ubsCode: '3948',
                sector: 'Private',
                payrollType: 'Contracted',
                companySegment: 'B',
                rate1_5: '22.75%',
                rate5_8: '22.25%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص (بدون مستحقات) الجهات المتعاقدة',
                nameEn: 'PL Contracted Salary Transfer Without Dues Private',
                ubsCode: '3948',
                sector: 'Private',
                payrollType: 'Contracted',
                companySegment: 'A',
                rate1_5: '22.75%',
                rate5_8: '22.25%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص (بدون مستحقات) الجهات المتعاقدة',
                nameEn: 'PL Contracted Salary Transfer Without Dues Private',
                ubsCode: '3948',
                sector: 'Private',
                payrollType: 'Contracted',
                companySegment: 'A+',
                rate1_5: '22.75%',
                rate5_8: '22.25%',
                rate8Plus: '21.75%'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص غير متعاقد لتحويل المرتب / القسط دون المستحقات',
                nameEn: 'PL Non-Contracted Salary Transfer Without Dues Private',
                ubsCode: '3948',
                sector: 'Private',
                payrollType: 'Non-Contracted',
                companySegment: 'C',
                rate1_5: '23.25%',
                rate5_8: '23.25%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص غير متعاقد لتحويل المرتب / القسط دون المستحقات',
                nameEn: 'PL Non-Contracted Salary Transfer Without Dues Private',
                ubsCode: '3948',
                sector: 'Private',
                payrollType: 'Non-Contracted',
                companySegment: 'B',
                rate1_5: '23.25%',
                rate5_8: '23.25%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص غير متعاقد لتحويل المرتب / القسط دون المستحقات',
                nameEn: 'PL Non-Contracted Salary Transfer Without Dues Private',
                ubsCode: '3948',
                sector: 'Private',
                payrollType: 'Non-Contracted',
                companySegment: 'A',
                rate1_5: '23.00%',
                rate5_8: '23.00%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الخاص غير متعاقد لتحويل المرتب / القسط دون المستحقات',
                nameEn: 'PL Non-Contracted Salary Transfer Without Dues Private',
                ubsCode: '3948',
                sector: 'Private',
                payrollType: 'Non-Contracted',
                companySegment: 'A+',
                rate1_5: '23.00%',
                rate5_8: '23.00%',
                rate8Plus: '22.50%'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد لتحويل القسط السنوي جهات متعاقدة',
                nameEn: 'Cash Loan Obligation Annual Installment',
                ubsCode: '3036',
                sector: 'Not Specified',
                payrollType: 'Contracted',
                companySegment: 'Not Specified',
                rate1_5: '22.75%',
                rate5_8: '22.25%',
                rate8Plus: '21.75%'
            },
            {
                nameAr: 'قروض نقدية بضمان تعهد لتحويل القسط السنوي جهات غير متعاقدة',
                nameEn: 'Cash Loan Obligation Annual Installment',
                ubsCode: '3036',
                sector: 'Not Specified',
                payrollType: 'Non-Contracted',
                companySegment: 'Not Specified',
                rate1_5: '23.00%',
                rate5_8: '23.00%',
                rate8Plus: '22.50%'
            },
            {
                nameAr: 'جهات متعاقدة بتعهد أقساط شهرية متزايدة سنويا',
                nameEn: 'PL INCREASED WITH UNDERTAKING',
                ubsCode: '3100',
                sector: 'Not Specified',
                payrollType: 'Contracted',
                companySegment: 'Not Specified',
                rate1_5: '22.75%',
                rate5_8: '22.25%',
                rate8Plus: '21.75%'
            },
            {
                nameAr: 'قروض نقدية بدون تعهد جهة العمل (جهات متعاقدة) قطاع عام',
                nameEn: 'Payroll Cheques Personal Gov and Public',
                ubsCode: '3865',
                sector: 'Government/Public',
                payrollType: 'Contracted',
                companySegment: 'Not Specified',
                rate1_5: '22.75%',
                rate5_8: '22.25%',
                rate8Plus: '21.75%'
            },
            {
                nameAr: 'قروض نقدية بدون تعهد جهة العمل (جهات متعاقدة)',
                nameEn: 'Payroll Cheques Personal Private',
                ubsCode: '3865',
                sector: 'Private',
                payrollType: 'Contracted',
                companySegment: 'C',
                rate1_5: '23.00%',
                rate5_8: '23.00%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بدون تعهد جهة العمل (جهات متعاقدة)',
                nameEn: 'Payroll Cheques Personal Private',
                ubsCode: '3865',
                sector: 'Private',
                payrollType: 'Contracted',
                companySegment: 'B',
                rate1_5: '22.75%',
                rate5_8: '22.25%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بدون تعهد جهة العمل (جهات متعاقدة)',
                nameEn: 'Payroll Cheques Personal Private',
                ubsCode: '3865',
                sector: 'Private',
                payrollType: 'Contracted',
                companySegment: 'A',
                rate1_5: '22.75%',
                rate5_8: '22.25%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بدون تعهد جهة العمل (جهات متعاقدة)',
                nameEn: 'Payroll Cheques Personal Private',
                ubsCode: '3865',
                sector: 'Private',
                payrollType: 'Contracted',
                companySegment: 'A+',
                rate1_5: '22.75%',
                rate5_8: '22.25%',
                rate8Plus: '21.75%'
            },
            {
                nameAr: 'القرض الرقمي للجهات المتعاقدة',
                nameEn: 'Digital Loan',
                ubsCode: '1000',
                sector: 'Not Specified',
                payrollType: 'Contracted',
                companySegment: 'Not Specified',
                rate1_5: '23.00%',
                rate5_8: '23.00%',
                rate8Plus: '23.00%'
            },
            {
                nameAr: 'قروض نقدية ضباط الاحتياط',
                nameEn: 'Cash loan for Reserve Officers',
                ubsCode: '1971',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '22.75%',
                rate5_8: 'Not Specified',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بإثبات دخل موظفين حكومي',
                nameEn: 'Gov & public companies income proof',
                ubsCode: '3800',
                sector: 'Government/Public',
                payrollType: 'Non-Contracted',
                companySegment: 'Not Specified',
                rate1_5: '25.00%',
                rate5_8: '24.00%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بإثبات دخل موظفين خاص ',
                nameEn: 'Private Companies Income Proof',
                ubsCode: '3800',
                sector: 'Private',
                payrollType: 'Non-Contracted',
                companySegment: 'B',
                rate1_5: '25.00%',
                rate5_8: '25.00%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بإثبات دخل موظفين خاص',
                nameEn: 'Private Companies Income Proof',
                ubsCode: '3800',
                sector: 'Private',
                payrollType: 'Non-Contracted',
                companySegment: 'A',
                rate1_5: '25.00%',
                rate5_8: '24.00%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية بإثبات دخل موظفين خاص',
                nameEn: 'Private Companies Income Proof',
                ubsCode: '3800',
                sector: 'Private',
                payrollType: 'Non-Contracted',
                companySegment: 'A+',
                rate1_5: '25.00%',
                rate5_8: '24.00%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض نقدية موظفي البنوك والشركات ذات الأنشطة المميزة بإثبات الدخل',
                nameEn: 'Bankers & elite activities income proof',
                ubsCode: '3921',
                sector: 'Not Specified',
                payrollType: 'Non-Contracted',
                companySegment: 'Not Specified',
                rate1_5: '22.50%',
                rate5_8: '21.75%',
                rate8Plus: '21.50%'
            },
            {
                nameAr: 'قروض نقدية بضمان القيمة الإيجارية بإثبات دخل',
                nameEn: 'PL Income proof Against Rent Value',
                ubsCode: '3939',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '26.00%',
                rate5_8: '25.50%',
                rate8Plus: '25.00%'
            },
            {
                nameAr: 'قروض نقدية بضمان القيمة الإيجارية للشركات المملوكة للبنك',
                nameEn: 'PL Against Rental Value for BM Companies',
                ubsCode: '1113',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '26.00%',
                rate5_8: '25.50%',
                rate8Plus: '25.00%'
            },
            {
                nameAr: 'قروض أصحاب المهن الحرة بإثبات دخل',
                nameEn: 'Freelancer activities income proof less than 3 years',
                ubsCode: '3922',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '27.00%',
                rate5_8: '25.50%',
                rate8Plus: '25.25%'
            },
            {
                nameAr: 'قروض أصحاب المهن الحرة بإثبات دخل',
                nameEn: 'Freelancer activities income proof more than 3 years',
                ubsCode: '3922',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '27.00%',
                rate5_8: '25.50%',
                rate8Plus: '25.25%'
            },
            {
                nameAr: 'قروض أصحاب الأعمال بإثبات الدخل',
                nameEn: 'Business Owner Income Proof',
                ubsCode: '3923',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '27.00%',
                rate5_8: '25.50%',
                rate8Plus: '25.00%'
            },
            {
                nameAr: 'قروض نقدية الأطباء بموجب إثبات دخل',
                nameEn: 'PL Income proof professionals Doctors',
                ubsCode: '3044',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '27.00%',
                rate5_8: '25.50%',
                rate8Plus: '25.00%'
            },
            {
                nameAr: 'دخل افتراضي للأطباء - سنوات الخبرة',
                nameEn: 'PL Years in Business professionals',
                ubsCode: '3938',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '25.50%',
                rate5_8: '25.50%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'دخل افتراضي أصحاب اوعية ادخارية',
                nameEn: 'PL - Surrogate Income to deposits customers',
                ubsCode: '1047',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '24.00%',
                rate5_8: '22.75%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'دخل افتراضي أصحاب اوعية ادخارية',
                nameEn: 'PL - Surrogate Income to deposits customers less than 2M',
                ubsCode: '1047',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '25.00%',
                rate5_8: '23.75%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'دخل افتراضي أصحاب الحسابات',
                nameEn: 'PL – Income Estimation',
                ubsCode: '1150',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '25.00%',
                rate5_8: '23.75%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'دخل افتراضي أساتذة الجامعات',
                nameEn: 'PL Surrogate Income for Egyptian universities professors',
                ubsCode: '1048',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '25.50%',
                rate5_8: '25.50%',
                rate8Plus: '25.50%'
            },
            {
                nameAr: 'دخل افتراضي هيئات القضائية بدل العلاج',
                nameEn: 'PL - Surrogate Income for judicial members',
                ubsCode: '1045',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '25.50%',
                rate5_8: '25.50%',
                rate8Plus: '25.50%'
            },
            {
                nameAr: 'قروض معاشات عملاء',
                nameEn: 'Pension customer Personal',
                ubsCode: '3872',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '22.50%',
                rate5_8: '22.00%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض معاشات عملاء',
                nameEn: 'Pension Armed Forces Personal',
                ubsCode: '3872',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '22.50%',
                rate5_8: '22.00%',
                rate8Plus: '21.50%'
            },
            {
                nameAr: 'قروض معاشات عاملين سابقين بالبنك',
                nameEn: 'Pension staff Personal',
                ubsCode: '3873',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '22.50%',
                rate5_8: '22.00%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض مستفيدين من المعاش',
                nameEn: 'Pension Customer Beneficiary',
                ubsCode: '3920',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '24.00%',
                rate5_8: '22.50%',
                rate8Plus: 'Not Specified'
            },
            {
                nameAr: 'قروض مستفيدين من المعاش',
                nameEn: 'Pension Armed Forces Beneficiary',
                ubsCode: '3920',
                sector: 'Not Specified',
                payrollType: 'Not Specified',
                companySegment: 'Not Specified',
                rate1_5: '24.00%',
                rate5_8: '22.50%',
                rate8Plus: '22.00%'
            }
        ];
    }
}

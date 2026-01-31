// unsecured-loans.js - Unsecured Loans Page

import { i18n } from '../i18n.js';
import { FinancialCalculator } from '../services/financial-calculator.js';
import { FirestoreService } from '../services/firestore.js';

export class UnsecuredLoansPage {
    static products = [];
    static selectedProduct = null;
    static constants = null;

    static async init() {
        const router = window.app?.router;
        if (router) {
            router.render(this.render());
            i18n.updatePageText();
            await this.loadProducts();
            await this.loadConstants();
            this.attachEventListeners();
        }
    }

    static async loadConstants() {
        this.constants = await FirestoreService.getConstants();

        // Update form default for max DTI
        const maxDtiInput = document.getElementById('max-dti');
        if (maxDtiInput && this.constants.MAX_DBR_RATIO) {
            maxDtiInput.value = (this.constants.MAX_DBR_RATIO * 100).toFixed(0);
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
                                    <option value="" data-i18n="all">All</option>
                                    <option value="Government/Public" data-i18n="government-public">Government/Public</option>
                                    <option value="Private" data-i18n="private">Private</option>
                                    <option value="Not Specified" data-i18n="not-specified">Not Specified</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="payroll">Payroll Type</label>
                                <select id="payroll-filter" class="form-select">
                                    <option value="" data-i18n="all">All</option>
                                    <option value="Contracted" data-i18n="contracted">Contracted</option>
                                    <option value="Non-Contracted" data-i18n="non-contracted">Non-Contracted</option>
                                    <option value="Not Specified" data-i18n="not-specified">Not Specified</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="company-segment">Company Segment</label>
                                <select id="segment-filter" class="form-select">
                                    <option value="" data-i18n="all">All</option>
                                    <option value="A+">A+</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="Not Specified" data-i18n="not-specified">Not Specified</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="product">Product</label>
                            <select id="product-select" class="form-select">
                                <option value="" data-i18n="select-product-placeholder">Select a product</option>
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
                            <span data-i18n="tab-by-income">Max Loan by Income</span>
                        </button>
                        <button class="tab-btn" data-tab="by-installment">
                            <i class="fas fa-receipt"></i>
                            <span data-i18n="tab-by-installment">Max Loan by Installment</span>
                        </button>
                        <button class="tab-btn" data-tab="loan-schedule">
                            <i class="fas fa-calculator"></i>
                            <span data-i18n="loan-calculator">Loan Calculator</span>
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div id="calculator-content">
                        ${this.renderByIncomeTab()}
                        ${this.renderByInstallmentTab()}
                        ${this.renderLoanScheduleTab()}
                    </div>
                </div>

                <!-- Link to Extensions -->
                <div class="info-box" style="margin-top: var(--spacing-lg);">
                    <i class="fas fa-info-circle"></i>
                    <p style="margin: 0;">
                        <strong data-i18n="extensions-info">Need First Month Interest or Amortization Schedule?</strong><br>
                        <span data-i18n="extensions-link">Visit the Extensions page for advanced calculators.</span> <a href="#extensions" style="color: var(--primary); font-weight: 600;">Extensions</a>
                    </p>
                </div>
            </div>
        `;
    }

    static renderByIncomeTab() {
        return `
            <div class="tab-content active" data-tab-content="by-income">
                <div class="card-body">
                    <h3 data-i18n="max-loan-by-income">Max Loan by Income</h3>
                    <p class="text-muted" data-i18n="max-loan-by-income-desc">Calculate maximum loan based on your monthly income</p>

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
                                <label class="form-label" data-i18n="tenor-range">Tenor Range</label>
                                <div style="display: flex; gap: var(--spacing-sm);">
                                    <input type="number" id="min-tenor-income" class="form-input" value="1" min="1" max="10" data-i18n-placeholder="min-tenor" placeholder="Min" required>
                                    <input type="number" id="max-tenor-income" class="form-input" value="5" min="1" max="10" data-i18n-placeholder="max-tenor" placeholder="Max" required>
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

    static renderByInstallmentTab() {
        return `
            <div class="tab-content" data-tab-content="by-installment">
                <div class="card-body">
                    <h3 data-i18n="max-loan-by-installment">Max Loan by Monthly Installment</h3>
                    <p class="text-muted" data-i18n="max-loan-by-installment-desc">Calculate maximum loan based on your monthly payment capacity</p>

                    <!-- Form -->
                    <form id="by-installment-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="monthly-payment">Monthly Payment Capacity</label>
                                <input type="number" id="monthly-payment-installment" class="form-input" value="5000" min="0" step="100" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="tenor-range">Tenor Range</label>
                                <div style="display: flex; gap: var(--spacing-sm);">
                                    <input type="number" id="min-tenor-installment" class="form-input" value="1" min="1" max="10" data-i18n-placeholder="min-tenor" placeholder="Min" required>
                                    <input type="number" id="max-tenor-installment" class="form-input" value="5" min="1" max="10" data-i18n-placeholder="max-tenor" placeholder="Max" required>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="is-years-installment" checked>
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
                    <div id="by-installment-results" style="display: none; margin-top: var(--spacing-xl);"></div>
                </div>
            </div>
        `;
    }

    static renderLoanScheduleTab() {
        return `
            <div class="tab-content" data-tab-content="loan-schedule">
                <div class="card-body">
                    <h3 data-i18n="loan-calculator">Loan Calculator</h3>
                    <p class="text-muted" data-i18n="loan-calculator-desc">Calculate payments for a specific loan amount</p>

                    <form id="loan-schedule-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="principal">Principal Amount</label>
                                <input type="number" id="principal-schedule" class="form-input" value="100000" min="0" step="1000" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="tenor-range">Tenor Range</label>
                                <div style="display: flex; gap: var(--spacing-sm);">
                                    <input type="number" id="min-tenor-schedule" class="form-input" value="1" min="1" max="10" data-i18n-placeholder="min-tenor" placeholder="Min" required>
                                    <input type="number" id="max-tenor-schedule" class="form-input" value="5" min="1" max="10" data-i18n-placeholder="max-tenor" placeholder="Max" required>
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

        document.getElementById('by-installment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateByInstallment();
        });

        document.getElementById('loan-schedule-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateLoanSchedule();
        });
    }

    static switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector(`[data-tab-content="${tab}"]`).classList.add('active');
    }

    static populateProductSelect() {
        const select = document.getElementById('product-select');
        select.innerHTML = '<option value="" data-i18n="select-product-placeholder">Select a product</option>';

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
        select.innerHTML = '<option value="" data-i18n="select-product-placeholder">Select a product</option>';

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

        // Helper function to get translation key for sector
        const getSectorKey = (sector) => {
            const sectorMap = {
                'Government/Public': 'government-public',
                'Private': 'private',
                'Not Specified': 'not-specified'
            };
            return sectorMap[sector] || sector;
        };

        // Helper function to get translation key for payroll type
        const getPayrollKey = (payrollType) => {
            const payrollMap = {
                'Contracted': 'contracted',
                'Non-Contracted': 'non-contracted',
                'Not Specified': 'not-specified'
            };
            return payrollMap[payrollType] || payrollType;
        };

        const infoHtml = `
            <div class="info-box">
                <h4>${i18n.currentLanguage === 'ar' ? product.nameAr : product.nameEn}</h4>
                <div class="grid grid-3" style="margin-top: var(--spacing-md);">
                    <div>
                        <strong data-i18n="ubs-code">${i18n.t('ubs-code')}:</strong> ${product.ubsCode || 'N/A'}
                    </div>
                    <div>
                        <strong data-i18n="sector">${i18n.t('sector')}:</strong> <span data-i18n="${product.sector ? getSectorKey(product.sector) : 'not-specified'}">${product.sector || 'N/A'}</span>
                    </div>
                    <div>
                        <strong data-i18n="payroll">${i18n.t('payroll')}:</strong> <span data-i18n="${product.payrollType ? getPayrollKey(product.payrollType) : 'not-specified'}">${product.payrollType || 'N/A'}</span>
                    </div>
                </div>
                <div style="margin-top: var(--spacing-md);">
                    <strong data-i18n="rates">${i18n.t('rates')}:</strong>
                    <ul style="margin: var(--spacing-sm) 0 0 0; padding-left: var(--spacing-lg);">
                        ${product.rate1_5 ? `<li><span data-i18n="rate-1-5">${i18n.t('rate-1-5')}</span> ${product.rate1_5}</li>` : ''}
                        ${product.rate5_8 ? `<li><span data-i18n="rate-5-8">${i18n.t('rate-5-8')}</span> ${product.rate5_8}</li>` : ''}
                        ${product.rate8Plus ? `<li><span data-i18n="rate-8-plus">${i18n.t('rate-8-plus')}</span> ${product.rate8Plus}</li>` : ''}
                    </ul>
                </div>
            </div>
        `;

        document.getElementById('product-info').innerHTML = infoHtml;
        document.getElementById('product-info').style.display = 'block';
        i18n.updatePageText();
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

        // Update URL parameters
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                calc: 'by-income',
                income: monthlyIncome,
                installments: monthlyInstallments,
                dti: (maxDTI * 100).toFixed(0),
                minTenor: minTenor,
                maxTenor: maxTenor,
                unit: isYears ? 'years' : 'months',
                product: this.selectedProduct.ubsCode
            });
        }

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
            }, this.constants); // Pass constants

            if (!result.error && result.length > 0) {
                results.push(...result);
            }
        }

        if (results.length === 0) {
            window.app.showToast('Payment capacity is negative or zero', 'error');
            return;
        }

        const resultsHtml = `
            <h4 data-i18n="max-loan-by-income">Maximum Loan by Income</h4>
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

        document.getElementById('by-income-results').innerHTML = resultsHtml;
        document.getElementById('by-income-results').style.display = 'block';
        i18n.updatePageText();
    }

    static calculateByInstallment() {
        if (!this.selectedProduct) {
            window.app.showToast('Please select a product first', 'warning');
            return;
        }

        const monthlyPayment = parseFloat(document.getElementById('monthly-payment-installment').value);
        const minTenor = parseInt(document.getElementById('min-tenor-installment').value);
        const maxTenor = parseInt(document.getElementById('max-tenor-installment').value);
        const isYears = document.getElementById('is-years-installment').checked;

        // Update URL parameters
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                calc: 'by-installment',
                payment: monthlyPayment,
                minTenor: minTenor,
                maxTenor: maxTenor,
                unit: isYears ? 'years' : 'months',
                product: this.selectedProduct.ubsCode
            });
        }

        // Calculate for each tenor using product rate
        const results = [];
        for (let tenor = minTenor; tenor <= maxTenor; tenor++) {
            const annualRate = this.getProductRate(tenor);
            const result = FinancialCalculator.generateLoanResults(annualRate, tenor, tenor, monthlyPayment, isYears);
            results.push(...result);
        }

        const resultsHtml = `
            <h4 data-i18n="max-loan-by-installment">Maximum Loan by Installment</h4>
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

        document.getElementById('by-installment-results').innerHTML = resultsHtml;
        document.getElementById('by-installment-results').style.display = 'block';
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

        // Update URL parameters
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                calc: 'loan-schedule',
                principal: principal,
                minTenor: minTenor,
                maxTenor: maxTenor,
                unit: isYears ? 'years' : 'months',
                product: this.selectedProduct.ubsCode
            });
        }

        const results = [];
        for (let tenor = minTenor; tenor <= maxTenor; tenor++) {
            const annualRate = this.getProductRate(tenor);
            const result = FinancialCalculator.calculateLoanSchedule(principal, annualRate, tenor, tenor, isYears);
            results.push(...result);
        }

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

        document.getElementById('loan-schedule-results').innerHTML = resultsHtml;
        document.getElementById('loan-schedule-results').style.display = 'block';
        i18n.updatePageText();
    }

    static getDefaultProducts() {
        // Sample products - would normally be loaded from CSV
        return [
            {
                nameAr: 'قروض نقدية بضمان تعهد للعاملين بالقطاع الحكومي',
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
                nameAr: 'قروض نقدية بإثبات دخل موظفين حكومي',
                nameEn: 'Gov & public companies income proof',
                ubsCode: '3800',
                sector: 'Government/Public',
                payrollType: 'Non-Contracted',
                companySegment: 'Not Specified',
                rate1_5: '25.00%',
                rate5_8: '24.00%',
                rate8Plus: ''
            }
        ];
    }
}
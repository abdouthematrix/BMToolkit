// secured-loans.js - Secured Loans Page with All Calculators

import { i18n } from '../i18n.js';
import { FinancialCalculator } from '../services/financial-calculator.js';
import { FirestoreService } from '../services/firestore.js';

export class SecuredLoansPage {
    static constants = null;
    static STORAGE_KEY = 'secured-loans-active-tab';
    static activeTab = 'smart-investment'; // Track active tab
    static tdRowCounter = 0;

    static async init() {
        const router = window.app?.router;
        if (router) {
            // Determine active tab BEFORE rendering
            this.determineActiveTab();

            router.render(this.render());
            i18n.updatePageText();
            await this.loadConstants();
            this.attachEventListeners();
            this.attachTenorValidation();
            this.autoCalculateIfNeeded();
        }
    }

    static determineActiveTab() {
        const savedTab = sessionStorage.getItem(this.STORAGE_KEY);
        const urlParams = window.app?.router?.getQueryParams() || {};

        // URL parameter takes precedence over saved tab
        this.activeTab = urlParams.tab || savedTab || 'smart-investment';
    }

    static async loadConstants() {
        this.constants = await FirestoreService.getConstants();

        // Update form defaults
        document.getElementById('cd-rate').value = (this.constants.CD_RATE * 100).toFixed(2);
        document.getElementById('cd-rate-optimizer').value = (this.constants.CD_RATE * 100).toFixed(2);

        // Update tenor input limits based on constants
        this.updateTenorLimits();

        // Note: loan-rate-optimizer field removed - calculated automatically from CD rate
    }

    static updateTenorLimits() {
        const minMonths = this.constants.SECURED_MIN_TENOR_MONTHS || 6;
        const maxYears = this.constants.SECURED_MAX_TENOR_YEARS || 10;
        const maxMonths = maxYears * 12;

        // Smart Investment Tool - years input
        const tdYearsInput = document.getElementById('td-years');
        if (tdYearsInput) {
            tdYearsInput.min = Math.ceil(minMonths / 12);
            tdYearsInput.max = maxYears;
        }

        // Smart Optimizer - months input
        const loanTermInput = document.getElementById('loan-term-optimizer');
        if (loanTermInput) {
            loanTermInput.min = minMonths;
            loanTermInput.max = maxMonths;
        }

        // Loan Calculator - tenor range inputs (years by default)
        const minTenorLoan = document.getElementById('min-tenor-loan');
        const maxTenorLoan = document.getElementById('max-tenor-loan');
        if (minTenorLoan) {
            minTenorLoan.min = Math.ceil(minMonths / 12);
            minTenorLoan.max = maxYears;
        }
        if (maxTenorLoan) {
            maxTenorLoan.min = Math.ceil(minMonths / 12);
            maxTenorLoan.max = maxYears;
        }

        // Max Loan Calculator - tenor range inputs (years by default)
        const minTenorMax = document.getElementById('min-tenor-max');
        const maxTenorMax = document.getElementById('max-tenor-max');
        if (minTenorMax) {
            minTenorMax.min = Math.ceil(minMonths / 12);
            minTenorMax.max = maxYears;
        }
        if (maxTenorMax) {
            maxTenorMax.min = Math.ceil(minMonths / 12);
            maxTenorMax.max = maxYears;
        }

        // TD Secured Loan Calculator - tenor range inputs (years by default)
        const minTenorTd = document.getElementById('td-min-tenor');
        const maxTenorTd = document.getElementById('td-max-tenor');
        if (minTenorTd) {
            minTenorTd.min = Math.ceil(minMonths / 12);
            minTenorTd.max = maxYears;
        }
        if (maxTenorTd) {
            maxTenorTd.min = Math.ceil(minMonths / 12);
            maxTenorTd.max = maxYears;
        }
    }

    static attachTenorValidation() {
        // Smart Optimizer - validate loan term in months
        const loanTermInput = document.getElementById('loan-term-optimizer');
        if (loanTermInput) {
            loanTermInput.addEventListener('input', () => {
                const minMonths = this.constants.SECURED_MIN_TENOR_MONTHS || 6;
                const maxMonths = (this.constants.SECURED_MAX_TENOR_YEARS || 10) * 12;
                const value = parseInt(loanTermInput.value);

                if (value < minMonths) {
                    loanTermInput.setCustomValidity(`Minimum tenor is ${minMonths} months`);
                } else if (value > maxMonths) {
                    loanTermInput.setCustomValidity(`Maximum tenor is ${maxMonths} months`);
                } else {
                    loanTermInput.setCustomValidity('');
                }
            });
        }

        // Loan Calculator - validate tenor range with unit switching
        const isYearsLoan = document.getElementById('is-years-loan');
        const minTenorLoan = document.getElementById('min-tenor-loan');
        const maxTenorLoan = document.getElementById('max-tenor-loan');

        const validateLoanCalculatorTenor = () => {
            const isYears = isYearsLoan.checked;
            const minMonths = this.constants.SECURED_MIN_TENOR_MONTHS || 6;
            const maxYears = this.constants.SECURED_MAX_TENOR_YEARS || 10;
            const maxMonths = maxYears * 12;

            if (isYears) {
                const minYears = Math.ceil(minMonths / 12);
                minTenorLoan.min = minYears;
                minTenorLoan.max = maxYears;
                maxTenorLoan.min = minYears;
                maxTenorLoan.max = maxYears;
            } else {
                minTenorLoan.min = minMonths;
                minTenorLoan.max = maxMonths;
                maxTenorLoan.min = minMonths;
                maxTenorLoan.max = maxMonths;
            }
        };

        if (isYearsLoan) {
            isYearsLoan.addEventListener('change', validateLoanCalculatorTenor);
        }

        // Max Loan Calculator - validate tenor range with unit switching
        const isYearsMax = document.getElementById('is-years-max');
        const minTenorMax = document.getElementById('min-tenor-max');
        const maxTenorMax = document.getElementById('max-tenor-max');

        const validateMaxLoanTenor = () => {
            const isYears = isYearsMax.checked;
            const minMonths = this.constants.SECURED_MIN_TENOR_MONTHS || 6;
            const maxYears = this.constants.SECURED_MAX_TENOR_YEARS || 10;
            const maxMonths = maxYears * 12;

            if (isYears) {
                const minYears = Math.ceil(minMonths / 12);
                minTenorMax.min = minYears;
                minTenorMax.max = maxYears;
                maxTenorMax.min = minYears;
                maxTenorMax.max = maxYears;
            } else {
                minTenorMax.min = minMonths;
                minTenorMax.max = maxMonths;
                maxTenorMax.min = minMonths;
                maxTenorMax.max = maxMonths;
            }
        };

        if (isYearsMax) {
            isYearsMax.addEventListener('change', validateMaxLoanTenor);
        }
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
                        <button class="tab-btn ${this.activeTab === 'smart-investment' ? 'active' : ''}" data-tab="smart-investment">
                            <i class="fas fa-chart-line"></i>
                            <span data-i18n="smart-investment">Smart Investment Tool</span>
                        </button>
                        <button class="tab-btn ${this.activeTab === 'smart-optimizer' ? 'active' : ''}" data-tab="smart-optimizer">
                            <i class="fas fa-sliders-h"></i>
                            <span data-i18n="smart-optimizer">Smart Loan Optimizer</span>
                        </button>
                        <button class="tab-btn ${this.activeTab === 'td-secured-loan' ? 'active' : ''}" data-tab="td-secured-loan">
                            <i class="fas fa-piggy-bank"></i>
                            <span data-i18n="tab-td-secured-loan">TD Secured Loan</span>
                        </button>
                        <button class="tab-btn ${this.activeTab === 'loan-calculator' ? 'active' : ''}" data-tab="loan-calculator">
                            <i class="fas fa-calculator"></i>
                            <span data-i18n="loan-calculator">Loan Calculator</span>
                        </button>
                        <button class="tab-btn ${this.activeTab === 'max-loan' ? 'active' : ''}" data-tab="max-loan">
                            <i class="fas fa-money-bill-wave"></i>
                            <span data-i18n="max-loan-calc">Max Loan</span>
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div id="calculator-content">
                        ${this.renderSmartInvestmentTab()}
                        ${this.renderSmartOptimizerTab()}
                        ${this.renderTdSecuredLoanTab()}
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
            <div class="tab-content ${this.activeTab === 'smart-investment' ? 'active' : ''}" data-tab-content="smart-investment">
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
            <div class="tab-content ${this.activeTab === 'smart-optimizer' ? 'active' : ''}" data-tab-content="smart-optimizer">
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
            <div class="tab-content ${this.activeTab === 'loan-calculator' ? 'active' : ''}" data-tab-content="loan-calculator">
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
                            <div class="form-group">
                                <label class="form-label" data-i18n="installment-frequency">Installment Frequency</label>
                                <select id="installment-frequency-loan" class="form-input">
                                    <option value="monthly" data-i18n="monthly">Monthly</option>
                                    <option value="quarterly" data-i18n="quarterly">Quarterly</option>
                                </select>
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
            <div class="tab-content ${this.activeTab === 'max-loan' ? 'active' : ''}" data-tab-content="max-loan">
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
                            <div class="form-group">
                                <label class="form-label" data-i18n="installment-frequency">Installment Frequency</label>
                                <select id="installment-frequency-max" class="form-input">
                                    <option value="monthly" data-i18n="monthly">Monthly</option>
                                    <option value="quarterly" data-i18n="quarterly">Quarterly</option>
                                </select>
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

    static renderTdSecuredLoanTab() {
        return `
            <div class="tab-content ${this.activeTab === 'td-secured-loan' ? 'active' : ''}" data-tab-content="td-secured-loan">
                <div class="card-body">
                    <h3 data-i18n="td-secured-loan-calculator">TD Secured Loan Calculator</h3>
                    <p class="text-muted" data-i18n="td-secured-loan-desc">Calculate loan results using the highest TD rate from all your term deposits.</p>

                    <form id="td-secured-loan-form" style="margin-top: var(--spacing-lg);">
                        <div class="form-group">
                            <label class="form-label" data-i18n="td-list-label">Term Deposits (Amount &amp; Rate)</label>
                            <div id="td-deposits-container" style="display: grid; gap: var(--spacing-sm);"></div>
                            <button type="button" id="add-td-row-btn" class="btn-secondary" style="margin-top: var(--spacing-sm);">
                                <i class="fas fa-plus"></i>
                                <span data-i18n="add-td">Add TD</span>
                            </button>
                        </div>

                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="loan-amount">Loan Amount</label>
                                <input type="number" id="td-loan-amount" class="form-input" value="90000" min="0" step="1000" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="installment-frequency">Installment Frequency</label>
                                <select id="td-installment-frequency" class="form-input">
                                    <option value="monthly" data-i18n="monthly">Monthly</option>
                                    <option value="quarterly" data-i18n="quarterly">Quarterly</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="tenor-range">Tenor Range</label>
                                <div style="display: flex; gap: var(--spacing-sm);">
                                    <input type="number" id="td-min-tenor" class="form-input" value="1" min="1" max="10" data-i18n-placeholder="min-tenor" placeholder="Min" required>
                                    <input type="number" id="td-max-tenor" class="form-input" value="10" min="1" max="10" data-i18n-placeholder="max-tenor" placeholder="Max" required>
                                </div>
                            </div>
                            <div class="form-group" style="display:flex; align-items:end;">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="is-years-td" checked>
                                    <span data-i18n="years">Years (vs Months)</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="toggle-switch">
                                <input type="checkbox" id="td-reinvest-loan">
                                <span>Reinvest loan amount in a new term deposit</span>
                            </label>
                        </div>

                        <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md);">
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-calculator"></i>
                                <span data-i18n="calculate">Calculate</span>
                            </button>
                            <button type="reset" class="btn-secondary" id="td-secured-loan-reset">
                                <i class="fas fa-redo"></i>
                                <span data-i18n="reset">Reset</span>
                            </button>
                        </div>
                    </form>

                    <div id="td-secured-loan-results" style="display: none; margin-top: var(--spacing-xl);"></div>
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

        document.getElementById('td-secured-loan-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateTdSecuredLoan();
        });

        document.getElementById('add-td-row-btn').addEventListener('click', () => {
            this.addTdDepositRow();
        });

        document.getElementById('is-years-td').addEventListener('change', () => {
            this.updateTdTenorLimits();
        });

        document.getElementById('td-secured-loan-reset').addEventListener('click', () => {
            setTimeout(() => {
                this.initializeTdDepositRows();
                document.getElementById('td-secured-loan-results').style.display = 'none';
            }, 0);
        });

        this.initializeTdDepositRows();
        this.updateTdTenorLimits();
    }

    static updateTdTenorLimits() {
        const minMonths = this.constants.SECURED_MIN_TENOR_MONTHS || 6;
        const maxYears = this.constants.SECURED_MAX_TENOR_YEARS || 10;
        const maxMonths = maxYears * 12;
        const isYears = document.getElementById('is-years-td')?.checked;
        const minInput = document.getElementById('td-min-tenor');
        const maxInput = document.getElementById('td-max-tenor');

        if (!minInput || !maxInput) return;

        if (isYears) {
            const minYears = Math.ceil(minMonths / 12);
            minInput.min = minYears;
            minInput.max = maxYears;
            maxInput.min = minYears;
            maxInput.max = maxYears;
            if (parseInt(minInput.value) < minYears) minInput.value = minYears;
            if (parseInt(maxInput.value) < minYears) maxInput.value = Math.max(minYears, parseInt(maxInput.value) || minYears);
            if (parseInt(maxInput.value) > maxYears) maxInput.value = maxYears;
        } else {
            minInput.min = minMonths;
            minInput.max = maxMonths;
            maxInput.min = minMonths;
            maxInput.max = maxMonths;
            if (parseInt(minInput.value) < minMonths) minInput.value = minMonths;
            if (parseInt(maxInput.value) < minMonths) maxInput.value = Math.max(minMonths, parseInt(maxInput.value) || minMonths);
            if (parseInt(maxInput.value) > maxMonths) maxInput.value = maxMonths;
        }
    }

    static initializeTdDepositRows() {
        this.tdRowCounter = 0;
        const container = document.getElementById('td-deposits-container');
        container.innerHTML = '';
        this.addTdDepositRow(60000, 16);
        this.addTdDepositRow(40000, 16);
    }

    static addTdDepositRow(amount = '', rate = '') {
        const container = document.getElementById('td-deposits-container');
        this.tdRowCounter += 1;

        const row = document.createElement('div');
        row.className = 'td-row';
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '1fr 1fr auto';
        row.style.gap = 'var(--spacing-sm)';
        row.innerHTML = `
            <input type="number" class="form-input td-amount-input" placeholder="Amount" min="0" step="1000" value="${amount}">
            <input type="number" class="form-input td-rate-input" placeholder="Rate %" min="0" max="100" step="0.01" value="${rate}">
            <select class="form-input td-interest-frequency">
                <option value="monthly" data-i18n="monthly">Monthly</option>
                <option value="quarterly" data-i18n="quarterly">Quarterly</option>
            </select>
            <button type="button" class="btn-secondary td-remove-btn" title="Remove TD">
                <i class="fas fa-trash"></i>
            </button>
        `;

        row.style.gridTemplateColumns = '1fr 1fr 1fr auto';

        row.querySelector('.td-remove-btn').addEventListener('click', () => {
            if (container.children.length === 1) {
                window.app.showToast('At least one term deposit is required.', 'error');
                return;
            }
            row.remove();
        });

        container.appendChild(row);
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
            case 'smart-investment':
                if (urlParams.amount) document.getElementById('td-amount').value = urlParams.amount;
                if (urlParams.rate) document.getElementById('cd-rate').value = urlParams.rate;
                if (urlParams.years) document.getElementById('td-years').value = urlParams.years;
                this.calculateSmartInvestment();
                break;

            case 'smart-optimizer':
                if (urlParams.principal) document.getElementById('principal-optimizer').value = urlParams.principal;
                if (urlParams.cdRate) document.getElementById('cd-rate-optimizer').value = urlParams.cdRate;
                if (urlParams.term) document.getElementById('loan-term-optimizer').value = urlParams.term;
                this.calculateSmartOptimizer();
                break;

            case 'loan-calculator':
                if (urlParams.principal) document.getElementById('principal-loan').value = urlParams.principal;
                if (urlParams.rate) document.getElementById('rate-loan').value = urlParams.rate;
                if (urlParams.minTenor) document.getElementById('min-tenor-loan').value = urlParams.minTenor;
                if (urlParams.maxTenor) document.getElementById('max-tenor-loan').value = urlParams.maxTenor;
                if (urlParams.unit) document.getElementById('is-years-loan').checked = (urlParams.unit === 'years');
                if (urlParams.frequency) document.getElementById('installment-frequency-loan').value = urlParams.frequency;
                this.calculateLoan();
                break;

            case 'max-loan':
                if (urlParams.payment) document.getElementById('monthly-payment-max').value = urlParams.payment;
                if (urlParams.rate) document.getElementById('rate-max').value = urlParams.rate;
                if (urlParams.minTenor) document.getElementById('min-tenor-max').value = urlParams.minTenor;
                if (urlParams.maxTenor) document.getElementById('max-tenor-max').value = urlParams.maxTenor;
                if (urlParams.unit) document.getElementById('is-years-max').checked = (urlParams.unit === 'years');
                if (urlParams.frequency) document.getElementById('installment-frequency-max').value = urlParams.frequency;
                this.calculateMaxLoan();
                break;

            case 'td-secured-loan':
                if (urlParams.loanAmount) document.getElementById('td-loan-amount').value = urlParams.loanAmount;
                if (urlParams.minTenor) document.getElementById('td-min-tenor').value = urlParams.minTenor;
                if (urlParams.maxTenor) document.getElementById('td-max-tenor').value = urlParams.maxTenor;
                if (urlParams.frequency) document.getElementById('td-installment-frequency').value = urlParams.frequency;
                if (urlParams.unit) document.getElementById('is-years-td').checked = (urlParams.unit === 'years');
                if (urlParams.reinvest) document.getElementById('td-reinvest-loan').checked = (urlParams.reinvest === '1');
                this.updateTdTenorLimits();
                this.calculateTdSecuredLoan();
                break;
        }
    }

    static calculateSmartInvestment() {
        const tdAmount = parseFloat(document.getElementById('td-amount').value);
        const tdRate = parseFloat(document.getElementById('cd-rate').value) / 100;
        const years = parseInt(document.getElementById('td-years').value);

        // Validate tenor using constants (NEW - validation only)
        const minMonths = this.constants.SECURED_MIN_TENOR_MONTHS || 6;
        const maxYears = this.constants.SECURED_MAX_TENOR_YEARS || 10;
        const tenorMonths = years * 12;

        if (tenorMonths < minMonths) {
            window.app.showToast(`Minimum tenor is ${minMonths} months (${Math.ceil(minMonths / 12)} years)`, 'error');
            return;
        }
        if (years > maxYears) {
            window.app.showToast(`Maximum tenor is ${maxYears} years`, 'error');
            return;
        }

        // Update URL parameters using tab as single identifier
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                tab: 'smart-investment',
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

    static displaySmartInvestmentResults(result, tdAmount, cdRate, loanRate, tenorYears) {
        const resultsHtml = `
            <h4 data-i18n="investment-scenarios">Investment Scenarios Comparison</h4>
            <div class="results-grid">
                ${result.scenarios.map((scenario, index) => `
                    <div class="result-card ${index === result.bestScenarioIndex ? 'best-option' : ''}">
                        <div class="result-header">
                            <h5>${scenario.name}</h5>
                            ${index === result.bestScenarioIndex ? '<span class="badge badge-success" data-i18n="best-option">Best Option</span>' : ''}
                        </div>
                        <div class="result-details">
                            <div class="detail-row">
                                <span data-i18n="loan-amount">Loan Amount:</span>
                                <strong>${i18n.formatCurrency(scenario.loanAmount)}</strong>
                            </div>
                            <div class="detail-row">
                                <span data-i18n="monthly-income">Monthly Income:</span>
                                <strong>${i18n.formatCurrency(scenario.monthlyIncome)}</strong>
                            </div>
                            <div class="detail-row">
                                <span data-i18n="monthly-payment">Monthly Payment:</span>
                                <strong>${i18n.formatCurrency(scenario.monthlyPayment)}</strong>
                            </div>
                            <div class="detail-row">
                                <span data-i18n="net-monthly-profit">Net Monthly:</span>
                                <strong class="${scenario.netMonthly >= 0 ? 'text-success' : 'text-danger'}">
                                    ${i18n.formatCurrency(scenario.netMonthly)}
                                </strong>
                            </div>
                            <div class="detail-row grand-total">
                                <span data-i18n="grand-total">Grand Total:</span>
                                <strong class="text-primary">${i18n.formatCurrency(scenario.grandTotal)}</strong>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="summary-box" style="margin-top: var(--spacing-lg);">
                <h5 data-i18n="assumptions">Calculation Assumptions</h5>
                <div class="grid grid-3" style="margin-top: var(--spacing-md);">
                    <div>
                        <span class="text-muted" data-i18n="cd-rate">CD Rate:</span>
                        <strong>${i18n.formatPercent(cdRate)}</strong>
                    </div>
                    <div>
                        <span class="text-muted" data-i18n="loan-rate">Loan Rate:</span>
                        <strong>${i18n.formatPercent(loanRate)}</strong>
                    </div>
                    <div>
                        <span class="text-muted" data-i18n="tenor">Tenor:</span>
                        <strong>${tenorYears} ${i18n.t('years')}</strong>
                    </div>
                </div>
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

        // Validate tenor using constants (NEW - validation only)
        const minMonths = this.constants.SECURED_MIN_TENOR_MONTHS || 6;
        const maxMonths = (this.constants.SECURED_MAX_TENOR_YEARS || 10) * 12;

        if (loanTerm < minMonths) {
            window.app.showToast(`Minimum tenor is ${minMonths} months`, 'error');
            return;
        }
        if (loanTerm > maxMonths) {
            window.app.showToast(`Maximum tenor is ${maxMonths} months`, 'error');
            return;
        }

        // Update URL parameters using tab as single identifier
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                tab: 'smart-optimizer',
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
                <h3><i class="fas fa-trophy"></i> <span data-i18n="optimalLoanConfig">Optimal Loan Configuration</span></h3>
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

    static displaySmartOptimizerResults(result, principal, cdRate, loanRate, tenorMonths) {
        const resultsHtml = `
            <div class="best-result-card">
                <h4 data-i18n="optimal-loan">Optimal Loan Configuration</h4>
                <div class="result-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); margin-top: var(--spacing-md);">
                    <div class="metric">
                        <span class="text-muted" data-i18n="loan-amount">Loan Amount</span>
                        <div class="metric-value">${i18n.formatCurrency(result.bestResult.loanAmount)}</div>
                        <small class="text-muted">${i18n.formatPercent(result.bestResult.loanAmount / principal)} of CD</small>
                    </div>
                    <div class="metric">
                        <span class="text-muted" data-i18n="monthly-income">Monthly Income</span>
                        <div class="metric-value">${i18n.formatCurrency(result.bestResult.totalMonthlyIncome)}</div>
                    </div>
                    <div class="metric">
                        <span class="text-muted" data-i18n="monthly-payment">Monthly Payment</span>
                        <div class="metric-value">${i18n.formatCurrency(result.bestResult.monthlyPayment)}</div>
                    </div>
                    <div class="metric">
                        <span class="text-muted" data-i18n="net-monthly-profit">Net Monthly Profit</span>
                        <div class="metric-value text-success">${i18n.formatCurrency(result.bestResult.netMonthlyProfit)}</div>
                    </div>
                    <div class="metric highlight">
                        <span class="text-muted" data-i18n="grand-total">Grand Total Profit</span>
                        <div class="metric-value text-primary" style="font-size: 1.5em;">${i18n.formatCurrency(result.bestResult.grandTotal)}</div>
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
        const installmentFrequency = document.getElementById('installment-frequency-loan').value;

        // Validate tenor using constants
        const minMonths = this.constants.SECURED_MIN_TENOR_MONTHS || 6;
        const maxYears = this.constants.SECURED_MAX_TENOR_YEARS || 10;
        const maxMonths = maxYears * 12;

        if (isYears) {
            const minYears = Math.ceil(minMonths / 12);
            if (minTenor < minYears) {
                window.app.showToast(`Minimum tenor is ${minYears} years`, 'error');
                return;
            }
            if (maxTenor > maxYears) {
                window.app.showToast(`Maximum tenor is ${maxYears} years`, 'error');
                return;
            }
        } else {
            if (minTenor < minMonths) {
                window.app.showToast(`Minimum tenor is ${minMonths} months`, 'error');
                return;
            }
            if (maxTenor > maxMonths) {
                window.app.showToast(`Maximum tenor is ${maxMonths} months`, 'error');
                return;
            }
        }

        // Update URL parameters using tab as single identifier
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                tab: 'loan-calculator',
                principal: principal,
                rate: (annualRate * 100).toFixed(2),
                minTenor: minTenor,
                maxTenor: maxTenor,
                unit: isYears ? 'years' : 'months',
                frequency: installmentFrequency
            });
        }

        const results = FinancialCalculator.calculateLoanSchedule(principal, annualRate, minTenor, maxTenor, isYears, installmentFrequency);

        const resultsHtml = `
            <h4 data-i18n="payment-schedule">Loan Payment Schedule</h4>
            <div class="results-table-wrapper" style="overflow-x: auto;">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th data-i18n="tenor">Tenor</th>
                            <th>${installmentFrequency === 'quarterly' ? i18n.t('quarterly-installment') : i18n.t('monthly-payment')}</th>
                            <th data-i18n="total-payment">Total Payment</th>
                            <th data-i18n="total-interest">Total Interest</th>
                            <th data-i18n="flat-rate">Flat Rate (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(row => `
                            <tr>
                                <td>${row.tenor} ${isYears ? i18n.t('years') : i18n.t('months')}</td>
                                <td class="number-display">${i18n.formatCurrency(row.installmentAmount)}</td>
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
        const installmentFrequency = document.getElementById('installment-frequency-max').value;

        // Validate tenor using constants
        const minMonths = this.constants.SECURED_MIN_TENOR_MONTHS || 6;
        const maxYears = this.constants.SECURED_MAX_TENOR_YEARS || 10;
        const maxMonths = maxYears * 12;

        if (isYears) {
            const minYears = Math.ceil(minMonths / 12);
            if (minTenor < minYears) {
                window.app.showToast(`Minimum tenor is ${minYears} years`, 'error');
                return;
            }
            if (maxTenor > maxYears) {
                window.app.showToast(`Maximum tenor is ${maxYears} years`, 'error');
                return;
            }
        } else {
            if (minTenor < minMonths) {
                window.app.showToast(`Minimum tenor is ${minMonths} months`, 'error');
                return;
            }
            if (maxTenor > maxMonths) {
                window.app.showToast(`Maximum tenor is ${maxMonths} months`, 'error');
                return;
            }
        }

        // Update URL parameters using tab as single identifier
        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                tab: 'max-loan',
                payment: monthlyPayment,
                rate: (annualRate * 100).toFixed(2),
                minTenor: minTenor,
                maxTenor: maxTenor,
                unit: isYears ? 'years' : 'months',
                frequency: installmentFrequency
            });
        }

        const results = FinancialCalculator.generateLoanResults(annualRate, minTenor, maxTenor, monthlyPayment, isYears, installmentFrequency);

        const resultsHtml = `
            <h4 data-i18n="maximum-loan-amounts">Maximum Loan Amounts</h4>
            <div class="results-table-wrapper" style="overflow-x: auto;">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th data-i18n="tenor">Tenor</th>
                            <th data-i18n="max-loan">Max Loan</th>
                            <th>${installmentFrequency === 'quarterly' ? i18n.t('quarterly-installment') : i18n.t('monthly-payment')}</th>
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
                                <td class="number-display">${i18n.formatCurrency(row.installmentAmount)}</td>
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

    static calculateTdSecuredLoan() {
        const tdRows = Array.from(document.querySelectorAll('#td-deposits-container .td-row'));
        const deposits = tdRows
            .map(row => ({
                amount: parseFloat(row.querySelector('.td-amount-input').value),
                rate: parseFloat(row.querySelector('.td-rate-input').value) / 100,
                interestFrequency: row.querySelector('.td-interest-frequency').value
            }))
            .filter(d => Number.isFinite(d.amount) && d.amount > 0 && Number.isFinite(d.rate) && d.rate >= 0);

        if (!deposits.length) {
            window.app.showToast('Please enter at least one valid term deposit (amount and rate).', 'error');
            return;
        }

        const loanAmount = parseFloat(document.getElementById('td-loan-amount').value);
        const minTenor = parseInt(document.getElementById('td-min-tenor').value);
        const maxTenor = parseInt(document.getElementById('td-max-tenor').value);
        const installmentFrequency = document.getElementById('td-installment-frequency').value;
        const isYears = document.getElementById('is-years-td').checked;
        const reinvestLoan = document.getElementById('td-reinvest-loan').checked;

        if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
            window.app.showToast('Please enter a valid loan amount.', 'error');
            return;
        }

        if (!Number.isFinite(minTenor) || !Number.isFinite(maxTenor) || minTenor > maxTenor) {
            window.app.showToast('Min tenor must be less than or equal to max tenor.', 'error');
            return;
        }

        const minMonthsLimit = this.constants.SECURED_MIN_TENOR_MONTHS || 6;
        const maxYearsLimit = this.constants.SECURED_MAX_TENOR_YEARS || 10;
        const maxMonthsLimit = maxYearsLimit * 12;

        if (isYears) {
            const minYearsLimit = Math.ceil(minMonthsLimit / 12);
            if (minTenor < minYearsLimit || maxTenor > maxYearsLimit) {
                window.app.showToast(`Tenor must be between ${minYearsLimit} and ${maxYearsLimit} years.`, 'error');
                return;
            }
        } else if (minTenor < minMonthsLimit || maxTenor > maxMonthsLimit) {
            window.app.showToast(`Tenor must be between ${minMonthsLimit} and ${maxMonthsLimit} months.`, 'error');
            return;
        }

        const calculation = FinancialCalculator.calculateTdSecuredLoanResults({
            deposits,
            loanAmount,
            minTenor,
            maxTenor,
            isYears,
            installmentFrequency,
            reinvestLoan
        }, this.constants);

        const { highestTdRate, loanRate, tdDetails, totalTdInterestPerPeriod, results } = calculation;

        const router = window.app?.router;
        if (router) {
            router.updateQueryParams({
                tab: 'td-secured-loan',
                loanAmount,
                minTenor,
                maxTenor,
                frequency: installmentFrequency,
                unit: isYears ? 'years' : 'months',
                reinvest: reinvestLoan ? '1' : '0'
            });
        }

        const resultsHtml = `
            <div class="highlight-box">
                <h3><i class="fas fa-chart-bar"></i> ${i18n.t('td-loan-rate-summary')}</h3>
                <div class="grid grid-2" style="margin-top: var(--spacing-md);">
                    <div>
                        <p style="margin:0; opacity:0.9;">${i18n.t('highest-td-rate')}</p>
                        <p style="font-size: 1.3rem; font-weight: 700; margin: 0;">${i18n.formatPercent(highestTdRate)}</p>
                    </div>
                    <div>
                        <p style="margin:0; opacity:0.9;">${i18n.t('calculated-loan-rate')}</p>
                        <p style="font-size: 1.3rem; font-weight: 700; margin: 0; color: var(--primary);">${i18n.formatPercent(loanRate)}</p>
                    </div>
                    <div>
                        <p style="margin:0; opacity:0.9;">${i18n.t('reinvest-loan-into-td')}</p>
                        <p style="font-size: 1.1rem; font-weight: 700; margin: 0;">${reinvestLoan ? i18n.t('yes') : i18n.t('no')}</p>
                    </div>
                </div>
            </div>

            <h4 style="margin-top: var(--spacing-xl);">${i18n.t('td-interest-details')}</h4>
            <div class="results-table-wrapper" style="overflow-x: auto;">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>${i18n.t('td-amount')}</th>
                            <th>${i18n.t('cd-rate')}</th>
                            <th>${i18n.t('interest-type')}</th>
                            <th>${i18n.t('periodic-interest-amount')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tdDetails.map(td => {
                            return `
                                <tr>
                                    <td class="number-display">${i18n.formatCurrency(td.amount)}</td>
                                    <td class="number-display">${i18n.formatPercent(td.rate)}</td>
                                    <td>${td.interestFrequency === 'quarterly' ? i18n.t('quarterly') : i18n.t('monthly')}</td>
                                    <td class="number-display">${i18n.formatCurrency(td.periodicInterest)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <div class="highlight-box" style="margin-top: var(--spacing-xl);">
                <p style="margin:0; opacity:0.9;">${i18n.t('total-td-interest-period')}</p>
                <p style="font-size: 1.1rem; font-weight: 700; margin: 0; color: var(--accent);">${i18n.formatCurrency(totalTdInterestPerPeriod)}</p>
            </div>

            <h4 style="margin-top: var(--spacing-xl);">${i18n.t('all-loan-results')}</h4>
            <div class="results-table-wrapper" style="overflow-x: auto;">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>${i18n.t('tenor')} (${isYears ? i18n.t('years') : i18n.t('months')})</th>
                            <th>${installmentFrequency === 'quarterly' ? i18n.t('quarterly-installment') : i18n.t('monthly-payment')}</th>
                            <th>${i18n.t('paid-amount')}</th>
                            <th>${i18n.t('total-payment')}</th>
                            <th>${i18n.t('total-interest')}</th>
                            <th>${i18n.t('flat-rate')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(row => `
                            <tr>
                                <td>${row.tenor}</td>
                                <td class="number-display">${i18n.formatCurrency(row.installmentAmount)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.paidAmount)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.totalPayment)}</td>
                                <td class="number-display">${i18n.formatCurrency(row.totalInterest)}</td>
                                <td class="number-display">${i18n.formatPercent(row.flatRate)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('td-secured-loan-results').innerHTML = resultsHtml;
        document.getElementById('td-secured-loan-results').style.display = 'block';
        i18n.updatePageText();
    }
}


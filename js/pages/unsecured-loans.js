// unsecured-loans.js - Unsecured Loans Page

import { i18n } from '../i18n.js';
import { FinancialCalculator } from '../services/financial-calculator.js';
import { FirestoreService } from '../services/firestore.js';

export class UnsecuredLoansPage {
    static products = [];
    static selectedProduct = null;
    static constants = null;
    static STORAGE_KEY = 'unsecured-loans-active-tab';
    static activeTab = 'by-income';
    static PRODUCT_SEARCH_STORAGE_KEY = 'unsecured-loans-recent-searches';
    static MAX_RECENT_SEARCHES = 5;
    static currentSearchQuery = '';

    // Holds the subset of products filtered by a UBS code coming from the URL.
    // When populated, the product dropdown is restricted to these entries.
    static ubsFilteredProducts = [];

    // Product filter criteria for sharing in URLs
    static productFilterCriteria = {
        sector: '',
        payroll: '',
        segment: ''
    };

    static async init() {
        const router = window.app?.router;
        if (router) {
            this.determineActiveTab();
            router.render(this.render());
            i18n.updatePageText();
            await this.loadProducts();
            await this.loadConstants();
            this.attachEventListeners();
            this.autoCalculateIfNeeded();
        }
    }

    static determineActiveTab() {
        const savedTab = sessionStorage.getItem(this.STORAGE_KEY);
        const urlParams = window.app?.router?.getQueryParams() || {};
        this.activeTab = urlParams.tab || savedTab || 'by-income';
    }

    static async loadConstants() {
        this.constants = await FirestoreService.getConstants();
        const maxDtiInput = document.getElementById('max-dti');
        if (maxDtiInput && this.constants.MAX_DBR_RATIO) {
            maxDtiInput.value = (this.constants.MAX_DBR_RATIO * 100).toFixed(0);
        }
    }

    static async loadProducts() {
        this.products = await FirestoreService.getProducts();
        if (this.products.length === 0) {
            this.products = this.getDefaultProducts();
        }

        // Check if the URL carries a `ubs` param that pre-filters the dropdown
        const urlParams = window.app?.router?.getQueryParams() || {};
        if (urlParams.ubs) {
            this.ubsFilteredProducts = this.products.filter(
                p => String(p.ubsCode).trim() === String(urlParams.ubs).trim()
            );
        } else {
            this.ubsFilteredProducts = [];
        }

        // Render the dropdown with the (possibly restricted) list
        this.populateProductSelect(
            this.ubsFilteredProducts.length > 0 ? this.ubsFilteredProducts : null
        );
    }

    // Find product by filter criteria
    static findProductByFilter(sector, payroll, segment) {
        return this.products.find(product => {
            if (sector && product.sector !== sector) return false;
            if (payroll && product.payrollType !== payroll) return false;
            if (segment && product.companySegment !== segment) return false;
            return true;
        });
    }

    // Find a product by its unique ID (Firestore doc id or generated fallback)
    static findProductById(id) {
        if (!id) return null;
        return this.products.find(p => {
            const pId = p.id ?? FirestoreService.generateProductId(p);
            return pId === id;
        }) || null;
    }

    // Get filter criteria from selected product
    static getProductFilterCriteria(product) {
        return {
            sector: product.sector || '',
            payroll: product.payrollType || '',
            segment: product.companySegment || ''
        };
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
                        <div class="form-group">
                            <label class="form-label" data-i18n="quick-search">Quick Search</label>
                            <div class="search-input-row">
                                <input
                                    type="search"
                                    id="product-search"
                                    class="form-input"
                                    data-i18n-placeholder="quick-search-placeholder"
                                    placeholder="Search by product name or UBS code"
                                >
                                <button type="button" id="clear-search-btn" class="btn-secondary btn-sm" data-i18n="clear-search">Clear</button>
                            </div>
                            <div id="recent-searches" class="recent-searches" style="display: none;"></div>
                        </div>
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
                        <button class="tab-btn ${this.activeTab === 'by-income' ? 'active' : ''}" data-tab="by-income">
                            <i class="fas fa-money-bill-wave"></i>
                            <span data-i18n="tab-by-income">Max Loan by Income</span>
                        </button>
                        <button class="tab-btn ${this.activeTab === 'by-installment' ? 'active' : ''}" data-tab="by-installment">
                            <i class="fas fa-receipt"></i>
                            <span data-i18n="tab-by-installment">Max Loan by Installment</span>
                        </button>
                        <button class="tab-btn ${this.activeTab === 'loan-schedule' ? 'active' : ''}" data-tab="loan-schedule">
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

                <!-- Link to advancedtools -->
                <div class="info-box" style="margin-top: var(--spacing-lg);">
                    <i class="fas fa-info-circle"></i>
                    <p style="margin: 0;">
                        <strong data-i18n="advancedtools-info">Need First Month Interest or Amortization Schedule?</strong><br>
                        <span data-i18n="advancedtools-link">Visit the Advanced Tools page for advanced calculators.</span> <a href="#advancedtools" style="color: var(--primary); font-weight: 600;">Advanced Tools</a>
                    </p>
                </div>
            </div>
        `;
    }

    static renderByIncomeTab() {
        return `
            <div class="tab-content ${this.activeTab === 'by-income' ? 'active' : ''}" data-tab-content="by-income">
                <div class="card-body">
                    <h3 data-i18n="max-loan-by-income">Max Loan by Income</h3>
                    <p class="text-muted" data-i18n="max-loan-by-income-desc">Calculate maximum loan based on your monthly income</p>

                    <!-- Form -->
                    <form id="by-income-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="monthly-income">Monthly Income</label>
                                <input type="number" id="monthly-income" class="form-input" value="10000" min="0" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="monthly-installments">Current Monthly Installments</label>
                                <input type="number" id="monthly-installments" class="form-input" value="0" min="0" required>
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
            <div class="tab-content ${this.activeTab === 'by-installment' ? 'active' : ''}" data-tab-content="by-installment">
                <div class="card-body">
                    <h3 data-i18n="max-loan-by-installment">Max Loan by Monthly Installment</h3>
                    <p class="text-muted" data-i18n="max-loan-by-installment-desc">Calculate maximum loan based on your monthly payment capacity</p>

                    <!-- Form -->
                    <form id="by-installment-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="monthly-payment">Monthly Payment Capacity</label>
                                <input type="number" id="monthly-payment-installment" class="form-input" value="5000" min="0" required>
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
            <div class="tab-content ${this.activeTab === 'loan-schedule' ? 'active' : ''}" data-tab-content="loan-schedule">
                <div class="card-body">
                    <h3 data-i18n="loan-calculator">Loan Calculator</h3>
                    <p class="text-muted" data-i18n="loan-calculator-desc">Calculate payments for a specific loan amount</p>

                    <form id="loan-schedule-form" style="margin-top: var(--spacing-lg);">
                        <div class="grid grid-2">
                            <div class="form-group">
                                <label class="form-label" data-i18n="principal">Principal Amount</label>
                                <input type="number" id="principal-schedule" class="form-input" value="100000" min="0" required>
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
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
                this.saveTabState(tab);
            });
        });

        document.getElementById('sector-filter').addEventListener('change', () => this.filterProducts());
        document.getElementById('payroll-filter').addEventListener('change', () => this.filterProducts());
        document.getElementById('segment-filter').addEventListener('change', () => this.filterProducts());

        const searchInput = document.getElementById('product-search');
        searchInput.addEventListener('input', (e) => {
            this.currentSearchQuery = e.target.value.trim();
            this.filterProducts();
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveRecentSearch(e.target.value.trim());
            }
        });

        document.getElementById('clear-search-btn').addEventListener('click', () => {
            this.clearCurrentSearch();
        });

        // Change handler now passes the selected option's *value* (a product ID)
        document.getElementById('product-select').addEventListener('change', (e) => {
            this.selectProduct(e.target.value);
            this.saveRecentSearch(document.getElementById('product-search')?.value || '');
        });

        // Rescale tenor inputs whenever the years/months toggle changes
        ['is-years-income', 'is-years-installment', 'is-years-schedule'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateTenorInputLimits(id);
            });
        });

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

        this.renderRecentSearches();
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

    // -------------------------------------------------------------------------
    // autoCalculateIfNeeded
    //
    // Reads URL params and:
    //   1. If `ubs` is present  → restrict dropdown to products with that UBS
    //      code, then optionally narrow further by sector/payroll/segment.
    //   2. If `ubs` is absent   → find by sector/payroll/segment as before.
    //   3. Pre-fills form fields and triggers the matching calculator.
    // -------------------------------------------------------------------------
    static autoCalculateIfNeeded() {
        const urlParams = window.app?.router?.getQueryParams() || {};
        const tab = urlParams.tab;

        if (!tab) return;

        let productToSelect = null;

        if (urlParams.ubs) {
            // --- UBS-code-based selection ---
            // ubsFilteredProducts was already populated in loadProducts(); if
            // sector/payroll/segment params are also present we can narrow to
            // an exact match, otherwise just pick the first available product.
            const candidates = this.ubsFilteredProducts.length > 0
                ? this.ubsFilteredProducts
                : this.products.filter(p => String(p.ubsCode).trim() === String(urlParams.ubs).trim());

            if (candidates.length > 0) {
                // Try exact match on criteria first
                productToSelect =
                    this.findProductByFilter(urlParams.sector, urlParams.payroll, urlParams.segment) ||
                    candidates[0];

                // Sync the filter dropdowns to the chosen product's attributes
                // so the dropdown is not unexpectedly empty.
                document.getElementById('sector-filter').value = productToSelect.sector || '';
                document.getElementById('payroll-filter').value = productToSelect.payrollType || '';
                document.getElementById('segment-filter').value = productToSelect.companySegment || '';

                this.filterProducts();

                const productId = productToSelect.id ?? FirestoreService.generateProductId(productToSelect);
                document.getElementById('product-select').value = productId;
                this.selectProduct(productId);
            }
        } else if (urlParams.sector || urlParams.payroll || urlParams.segment) {
            // --- Legacy criteria-based selection (no UBS in URL) ---
            productToSelect = this.findProductByFilter(urlParams.sector, urlParams.payroll, urlParams.segment);
            if (productToSelect) {
                if (urlParams.sector) document.getElementById('sector-filter').value = urlParams.sector;
                if (urlParams.payroll) document.getElementById('payroll-filter').value = urlParams.payroll;
                if (urlParams.segment) document.getElementById('segment-filter').value = urlParams.segment;

                this.filterProducts();

                const productId = productToSelect.id ?? FirestoreService.generateProductId(productToSelect);
                document.getElementById('product-select').value = productId;
                this.selectProduct(productId);
            }
        }

        // Pre-fill form fields for the active tab and fire the calculation
        switch (tab) {
            case 'by-income':
                if (urlParams.income) document.getElementById('monthly-income').value = urlParams.income;
                if (urlParams.installments) document.getElementById('monthly-installments').value = urlParams.installments;
                if (urlParams.dti) document.getElementById('max-dti').value = urlParams.dti;
                if (urlParams.minTenor) document.getElementById('min-tenor-income').value = urlParams.minTenor;
                if (urlParams.maxTenor) document.getElementById('max-tenor-income').value = urlParams.maxTenor;
                if (urlParams.unit) document.getElementById('is-years-income').checked = urlParams.unit === 'years';
                this.calculateByIncome();
                break;

            case 'by-installment':
                if (urlParams.payment) document.getElementById('monthly-payment-installment').value = urlParams.payment;
                if (urlParams.minTenor) document.getElementById('min-tenor-installment').value = urlParams.minTenor;
                if (urlParams.maxTenor) document.getElementById('max-tenor-installment').value = urlParams.maxTenor;
                if (urlParams.unit) document.getElementById('is-years-installment').checked = urlParams.unit === 'years';
                this.calculateByInstallment();
                break;

            case 'loan-schedule':
                if (urlParams.principal) document.getElementById('principal-schedule').value = urlParams.principal;
                if (urlParams.minTenor) document.getElementById('min-tenor-schedule').value = urlParams.minTenor;
                if (urlParams.maxTenor) document.getElementById('max-tenor-schedule').value = urlParams.maxTenor;
                if (urlParams.unit) document.getElementById('is-years-schedule').checked = urlParams.unit === 'years';
                this.calculateLoanSchedule();
                break;
        }
    }

    // -------------------------------------------------------------------------
    // populateProductSelect
    //
    // Renders the product <select> dropdown.
    // If `productList` is supplied (e.g. the UBS-restricted subset) only those
    // products appear; otherwise all products are shown.
    // Option *values* are product IDs – never display names – so selection
    // survives language switches and duplicate-name scenarios.
    // -------------------------------------------------------------------------
    static populateProductSelect(productList = null) {
        const list = productList ?? this.products;
        const select = document.getElementById('product-select');
        select.innerHTML = '<option value="" data-i18n="select-product-placeholder">Select a product</option>';

        list.forEach((product) => {
            if (product.active === false) return; // skip inactive
            const option = document.createElement('option');
            option.value = product.id ?? FirestoreService.generateProductId(product);
            option.textContent = this.getProductOptionLabel(product);
            select.appendChild(option);
        });
    }


    static getProductOptionLabel(product) {
        const productName = i18n.currentLanguage === 'ar' ? product.nameAr : product.nameEn;
        const ubsCode = String(product.ubsCode || '').trim();
        const segment = String(product.companySegment || '').trim();

        const baseLabel = ubsCode
            ? `${ubsCode} - ${productName}`
            : productName;

        if (segment && segment.toLowerCase() !== 'not specified') {
            return `${baseLabel} (Segment: ${segment})`;
        }

        return baseLabel;
    }

    // -------------------------------------------------------------------------
    // filterProducts
    //
    // Re-renders the product dropdown according to the current sector / payroll
    // / segment filter dropdowns.
    // When `ubsFilteredProducts` is non-empty the search space is restricted to
    // that subset so multiple products sharing the same UBS code work correctly.
    // The previously selected product is preserved if it survives the filter.
    // -------------------------------------------------------------------------
    static filterProducts() {
        const sector = document.getElementById('sector-filter').value;
        const payroll = document.getElementById('payroll-filter').value;
        const segment = document.getElementById('segment-filter').value;
        const searchQuery = this.currentSearchQuery.toLowerCase();

        // Start from the UBS-restricted list when present, otherwise all products
        const baseList = this.ubsFilteredProducts.length > 0
            ? this.ubsFilteredProducts
            : this.products;

        const filtered = baseList.filter(product => {
            if (product.active === false) return false;
            if (sector && product.sector !== sector) return false;
            if (payroll && product.payrollType !== payroll) return false;
            if (segment && product.companySegment !== segment) return false;

            if (searchQuery) {
                const searchFields = [
                    product.nameEn,
                    product.nameAr,
                    product.ubsCode,
                    product.sector,
                    product.payrollType,
                    product.companySegment
                ]
                    .filter(Boolean)
                    .map(value => String(value).toLowerCase());

                if (!searchFields.some(value => value.includes(searchQuery))) {
                    return false;
                }
            }

            return true;
        });

        const select = document.getElementById('product-select');
        // Remember the currently selected ID so we can restore it if it
        // survives the filter change.
        const previousId = select.value;

        select.innerHTML = '<option value="" data-i18n="select-product-placeholder">Select a product</option>';

        filtered.forEach((product) => {
            const option = document.createElement('option');
            option.value = product.id ?? FirestoreService.generateProductId(product);
            option.textContent = this.getProductOptionLabel(product);
            select.appendChild(option);
        });

        // Restore the previously selected product if it is still in the list
        if (previousId && select.querySelector(`option[value="${CSS.escape(previousId)}"]`)) {
            select.value = previousId;
        } else if (previousId) {
            // Previously selected product was filtered out – clear it
            this.selectedProduct = null;
            document.getElementById('product-info').style.display = 'none';
        }

        i18n.updatePageText();
    }

    static clearCurrentSearch() {
        this.currentSearchQuery = '';
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.value = '';
        }
        this.filterProducts();
    }

    static clearRecentSearches() {
        localStorage.removeItem(this.PRODUCT_SEARCH_STORAGE_KEY);
        this.renderRecentSearches();
    }

    static getRecentSearches() {
        try {
            const raw = localStorage.getItem(this.PRODUCT_SEARCH_STORAGE_KEY);
            const parsed = JSON.parse(raw || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    static saveRecentSearch(query) {
        if (!query) return;

        const cleanedQuery = query.trim();
        if (!cleanedQuery) return;

        const recentSearches = this.getRecentSearches().filter(
            search => search.toLowerCase() !== cleanedQuery.toLowerCase()
        );
        recentSearches.unshift(cleanedQuery);

        localStorage.setItem(
            this.PRODUCT_SEARCH_STORAGE_KEY,
            JSON.stringify(recentSearches.slice(0, this.MAX_RECENT_SEARCHES))
        );
        this.renderRecentSearches();
    }

    static renderRecentSearches() {
        const container = document.getElementById('recent-searches');
        if (!container) return;

        const recentSearches = this.getRecentSearches();
        if (recentSearches.length === 0) {
            container.style.display = 'none';
            container.innerHTML = '';
            return;
        }

        const chips = recentSearches
            .map(search => `<button type="button" class="recent-search-chip" data-search="${search.replace(/"/g, '&quot;')}">${search}</button>`)
            .join('');

        container.style.display = 'flex';
        container.innerHTML = `<span class="recent-searches-label" data-i18n="recent-searches">Recent searches:</span>${chips}<button type="button" class="recent-search-clear" data-action="clear-recent" data-i18n="clear-recent-searches">Clear recent</button>`;

        container.querySelectorAll('.recent-search-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const searchValue = e.currentTarget.dataset.search || '';
                this.currentSearchQuery = searchValue;
                const searchInput = document.getElementById('product-search');
                if (searchInput) searchInput.value = searchValue;
                this.filterProducts();
            });
        });

        const clearRecentBtn = container.querySelector('[data-action="clear-recent"]');
        if (clearRecentBtn) {
            clearRecentBtn.addEventListener('click', () => {
                this.clearRecentSearches();
            });
        }

        i18n.updatePageText();
    }

    // -------------------------------------------------------------------------
    // selectProduct
    //
    // Accepts a product **ID** (Firestore doc id or generated fallback).
    // Updates `selectedProduct`, renders the info card (including segment),
    // and keeps tenor input limits in sync.
    // -------------------------------------------------------------------------
    static selectProduct(productId) {
        if (!productId) {
            this.selectedProduct = null;
            document.getElementById('product-info').style.display = 'none';
            return;
        }

        // Find product by ID
        const product = this.findProductById(productId);
        if (!product) {
            this.selectedProduct = null;
            document.getElementById('product-info').style.display = 'none';
            return;
        }

        this.selectedProduct = product;

        // ---- i18n helper maps ----
        const getSectorKey = (sector) => {
            const sectorMap = {
                'Government/Public': 'government-public',
                'Private': 'private',
                'Not Specified': 'not-specified'
            };
            return sectorMap[sector] || sector;
        };

        const getPayrollKey = (payrollType) => {
            const payrollMap = {
                'Contracted': 'contracted',
                'Non-Contracted': 'non-contracted',
                'Not Specified': 'not-specified'
            };
            return payrollMap[payrollType] || payrollType;
        };

        const getSegmentKey = (segment) => {
            const segmentMap = {
                'Not Specified': 'not-specified'
            };
            return segmentMap[segment] || null; // A/A+/B/C have no i18n key – use raw value
        };

        // Build segment display (raw value for A/A+/B/C, i18n key for "Not Specified")
        const segmentKey = getSegmentKey(product.companySegment);
        const segmentDisplay = segmentKey
            ? `<span data-i18n="${segmentKey}">${product.companySegment || 'N/A'}</span>`
            : `<span>${product.companySegment || 'N/A'}</span>`;

        const infoHtml = `
            <div class="info-box">
                <h4>${i18n.currentLanguage === 'ar' ? product.nameAr : product.nameEn}</h4>
                <div class="grid grid-3" style="margin-top: var(--spacing-md);">
                    <div>
                        <strong data-i18n="ubs-code">${i18n.t('ubs-code')}:</strong> ${product.ubsCode || 'N/A'}
                    </div>
                    <div>
                        <strong data-i18n="sector">${i18n.t('sector')}:</strong>
                        <span data-i18n="${product.sector ? getSectorKey(product.sector) : 'not-specified'}">${product.sector || 'N/A'}</span>
                    </div>
                    <div>
                        <strong data-i18n="payroll">${i18n.t('payroll')}:</strong>
                        <span data-i18n="${product.payrollType ? getPayrollKey(product.payrollType) : 'not-specified'}">${product.payrollType || 'N/A'}</span>
                    </div>
                </div>
                <div class="grid grid-3" style="margin-top: var(--spacing-sm);">
                    <div>
                        <strong data-i18n="company-segment">${i18n.t('company-segment')}:</strong>
                        ${segmentDisplay}
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

        // Keep tenor input max attributes in sync with the product's effective limit
        this.updateTenorInputLimits();
    }

    // Synchronise min/max attributes on all tenor inputs for a given tab when
    // the unit toggles, and rescale the current values so they stay meaningful.
    // Also called on product selection to apply the product's tenor ceiling.
    static updateTenorInputLimits(changedTabId = null) {
        const maxYears = this.getProductMaxTenorYears();

        const tabs = [
            {
                toggleId: 'is-years-income',
                minId: 'min-tenor-income',
                maxId: 'max-tenor-income'
            },
            {
                toggleId: 'is-years-installment',
                minId: 'min-tenor-installment',
                maxId: 'max-tenor-installment'
            },
            {
                toggleId: 'is-years-schedule',
                minId: 'min-tenor-schedule',
                maxId: 'max-tenor-schedule'
            }
        ];

        tabs.forEach(({ toggleId, minId, maxId }) => {
            const toggleEl = document.getElementById(toggleId);
            const minEl = document.getElementById(minId);
            const maxEl = document.getElementById(maxId);
            if (!toggleEl || !minEl || !maxEl) return;

            const isYears = toggleEl.checked;
            const factor = isYears ? 1 : 12;
            const absMax = maxYears * factor;
            const absMin = 1; // 1 year or 1 month

            // When this is a unit-change event, rescale the current values
            if (changedTabId === toggleId) {
                const prevFactor = isYears ? 12 : 1; // factor BEFORE the toggle
                const rescale = v => Math.min(Math.max(Math.round(v / prevFactor * factor), absMin), absMax);
                minEl.value = rescale(parseFloat(minEl.value) || absMin);
                maxEl.value = rescale(parseFloat(maxEl.value) || absMax);
            }

            minEl.min = absMin;
            minEl.max = absMax;
            maxEl.min = absMin;
            maxEl.max = absMax;
        });
    }

    static getProductRate(tenorYears) {
        if (!this.selectedProduct) return 0.18;

        if (tenorYears <= 5 && this.selectedProduct.rate1_5) {
            return parseFloat(this.selectedProduct.rate1_5.replace('%', '')) / 100;
        } else if (tenorYears <= 8 && this.selectedProduct.rate5_8) {
            return parseFloat(this.selectedProduct.rate5_8.replace('%', '')) / 100;
        } else if (this.selectedProduct.rate8Plus) {
            return parseFloat(this.selectedProduct.rate8Plus.replace('%', '')) / 100;
        }
        return 0.18;
    }

    // Returns the effective maximum tenor in years for the currently selected
    // product by inspecting which rate tiers are populated and honouring the
    // global UNSECURED_MAX_TENOR_8_PLUS_YEARS cap stored in constants.
    static getProductMaxTenorYears() {
        if (!this.selectedProduct) return 10;
        const globalMax = this.constants?.UNSECURED_MAX_TENOR_8_PLUS_YEARS ?? 10;

        const r8 = this.selectedProduct.rate8Plus;
        const r5 = this.selectedProduct.rate5_8;
        const r1 = this.selectedProduct.rate1_5;

        if (r8 && parseFloat(r8) > 0) return globalMax;
        if (r5 && parseFloat(r5) > 0) return 8;
        if (r1 && parseFloat(r1) > 0) return 5;
        return 0;
    }

    static calculateByIncome() {
        if (!this.selectedProduct) {
            window.app.showToast(i18n.t('select-product-first'), 'warning');
            return;
        }

        const monthlyIncome = parseFloat(document.getElementById('monthly-income').value);
        const monthlyInstallments = parseFloat(document.getElementById('monthly-installments').value);
        const maxDTI = parseFloat(document.getElementById('max-dti').value) / 100;
        const minTenor = parseInt(document.getElementById('min-tenor-income').value);
        const isYears = document.getElementById('is-years-income').checked;

        const productMaxTenorYears = this.getProductMaxTenorYears();
        const productMaxTenor = isYears ? productMaxTenorYears : productMaxTenorYears * 12;
        let maxTenor = parseInt(document.getElementById('max-tenor-income').value);
        if (maxTenor > productMaxTenor) {
            window.app.showToast(
                i18n.t('max-tenor-capped', { years: productMaxTenorYears }),
                'warning'
            );
            maxTenor = productMaxTenor;
            document.getElementById('max-tenor-income').value = maxTenor;
        }
        if (minTenor > maxTenor) {
            window.app.showToast(i18n.t('min-tenor-exceeds-max'), 'error');
            return;
        }

        const router = window.app?.router;
        if (router) {
            const criteria = this.getProductFilterCriteria(this.selectedProduct);
            const productId = this.selectedProduct.id ?? FirestoreService.generateProductId(this.selectedProduct);
            router.updateQueryParams({
                tab: 'by-income',
                ubs: this.selectedProduct.ubsCode || '',
                productId,
                income: monthlyIncome,
                installments: monthlyInstallments,
                dti: (maxDTI * 100).toFixed(0),
                minTenor,
                maxTenor,
                unit: isYears ? 'years' : 'months',
                sector: criteria.sector,
                payroll: criteria.payroll,
                segment: criteria.segment
            });
        }

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
            }, this.constants);

            if (!result.error && result.length > 0) {
                results.push(...result);
            }
        }

        if (results.length === 0) {
            window.app.showToast(i18n.t('payment-capacity-zero'), 'error');
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
            window.app.showToast(i18n.t('select-product-first'), 'warning');
            return;
        }

        const monthlyPayment = parseFloat(document.getElementById('monthly-payment-installment').value);
        const minTenor = parseInt(document.getElementById('min-tenor-installment').value);
        const isYears = document.getElementById('is-years-installment').checked;

        const productMaxTenorYears = this.getProductMaxTenorYears();
        const productMaxTenor = isYears ? productMaxTenorYears : productMaxTenorYears * 12;
        let maxTenor = parseInt(document.getElementById('max-tenor-installment').value);
        if (maxTenor > productMaxTenor) {
            window.app.showToast(
                i18n.t('max-tenor-capped', { years: productMaxTenorYears }),
                'warning'
            );
            maxTenor = productMaxTenor;
            document.getElementById('max-tenor-installment').value = maxTenor;
        }
        if (minTenor > maxTenor) {
            window.app.showToast(i18n.t('min-tenor-exceeds-max'), 'error');
            return;
        }

        const router = window.app?.router;
        if (router) {
            const criteria = this.getProductFilterCriteria(this.selectedProduct);
            const productId = this.selectedProduct.id ?? FirestoreService.generateProductId(this.selectedProduct);
            router.updateQueryParams({
                tab: 'by-installment',
                ubs: this.selectedProduct.ubsCode || '',
                productId,
                payment: monthlyPayment,
                minTenor,
                maxTenor,
                unit: isYears ? 'years' : 'months',
                sector: criteria.sector,
                payroll: criteria.payroll,
                segment: criteria.segment
            });
        }

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
            window.app.showToast(i18n.t('select-product-first'), 'warning');
            return;
        }

        const principal = parseFloat(document.getElementById('principal-schedule').value);
        const minTenor = parseInt(document.getElementById('min-tenor-schedule').value);
        const isYears = document.getElementById('is-years-schedule').checked;

        const productMaxTenorYears = this.getProductMaxTenorYears();
        const productMaxTenor = isYears ? productMaxTenorYears : productMaxTenorYears * 12;
        let maxTenor = parseInt(document.getElementById('max-tenor-schedule').value);
        if (maxTenor > productMaxTenor) {
            window.app.showToast(
                i18n.t('max-tenor-capped', { years: productMaxTenorYears }),
                'warning'
            );
            maxTenor = productMaxTenor;
            document.getElementById('max-tenor-schedule').value = maxTenor;
        }
        if (minTenor > maxTenor) {
            window.app.showToast(i18n.t('min-tenor-exceeds-max'), 'error');
            return;
        }

        const router = window.app?.router;
        if (router) {
            const criteria = this.getProductFilterCriteria(this.selectedProduct);
            const productId = this.selectedProduct.id ?? FirestoreService.generateProductId(this.selectedProduct);
            router.updateQueryParams({
                tab: 'loan-schedule',
                ubs: this.selectedProduct.ubsCode || '',
                productId,
                principal,
                minTenor,
                maxTenor,
                unit: isYears ? 'years' : 'months',
                sector: criteria.sector,
                payroll: criteria.payroll,
                segment: criteria.segment
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

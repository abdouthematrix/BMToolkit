// admin.js - Admin Page

import { i18n } from '../i18n.js';
import { FirestoreService } from '../services/firestore.js';
import { AuthService } from '../services/auth.js';

export class AdminPage {
    static constants = {};
    static products = [];

    static async init() {
        // Check if user is authenticated
        if (!AuthService.isAuthenticated()) {
            window.location.hash = 'login';
            return;
        }

        const router = window.app?.router;
        if (router) {
            router.render(this.render());
            i18n.updatePageText();
            await this.loadConstants();
            await this.loadProducts();
            this.attachEventListeners();

            // Expose to window for onclick handlers
            window.adminPage = this;
        }
    }

    static async loadConstants() {
        this.constants = await FirestoreService.getConstants();
        this.populateForm();
    }

    static async loadProducts() {
        this.products = await FirestoreService.getProducts();
        this.renderProductsList();
    }

    static render() {
        return `
            <div class="container">
                <div style="margin-bottom: var(--spacing-2xl);">
                    <h1><i class="fas fa-cog" style="color: var(--primary);"></i> <span data-i18n="admin-panel">Admin Panel</span></h1>
                    <p class="text-muted" data-i18n="admin-desc">Manage rates, margins, and constants for all calculators</p>
                </div>

                <!-- Constants Management -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title" data-i18n="rates-margins">Rates & Margins</h3>
                    </div>
                    <div class="card-body">
                        <div class="warning-box">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong data-i18n="important-note">Important:</strong> <span data-i18n="admin-warning">Changes made here will affect all users and all calculations globally.</span>
                        </div>

                        <form id="constants-form" style="margin-top: var(--spacing-lg);">
                            <!-- Secured Loans Constants -->
                            <h4 data-i18n="secured-loans-constants">Secured Loans</h4>
                            <div class="grid grid-3">
                                <div class="form-group">
                                    <label class="form-label" data-i18n="cd-rate-label">CD Rate (%)</label>
                                    <input type="number" id="cd-rate-admin" class="form-input" min="0" max="100" step="0.01" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="td-margin-label">TD Margin (%)</label>
                                    <input type="number" id="td-margin-admin" class="form-input" min="0" max="100" step="0.01" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="min-rate-label">Minimum Rate (%)</label>
                                    <input type="number" id="min-rate-admin" class="form-input" min="0" max="100" step="0.01" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="max-loan-percent">Max Loan Percent (%)</label>
                                    <input type="number" id="max-loan-percent-admin" class="form-input" min="0" max="100" step="1" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="secured-min-tenor-months">Min Tenor (Months)</label>
                                    <input type="number" id="secured-min-tenor-months-admin" class="form-input" min="1" max="120" step="1" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="secured-max-tenor-years">Max Tenor (Years)</label>
                                    <input type="number" id="secured-max-tenor-years-admin" class="form-input" min="1" max="30" step="1" required>
                                </div>
                            </div>

                            <!-- Unsecured Loans Constants -->
                            <h4 style="margin-top: var(--spacing-xl);" data-i18n="unsecured-loans-constants">Unsecured Loans</h4>
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label" data-i18n="max-dti-label">Max DTI Ratio (%)</label>
                                    <input type="number" id="max-dti-admin" class="form-input" min="0" max="100" step="1" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="stamp-duty-rate">Stamp Duty Rate (‰)</label>
                                    <input type="number" id="stamp-duty-admin" class="form-input" min="0" max="100" step="0.1" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="unsecured-max-tenor-8plus">Max Tenor for Rate8+ (Years)</label>
                                    <input type="number" id="unsecured-max-tenor-8plus-admin" class="form-input" min="1" max="30" step="1" required>
                                </div>
                            </div>

                            <!-- Scenario Constants -->
                            <h4 style="margin-top: var(--spacing-xl);" data-i18n="scenario-constants">Smart Investment Tool</h4>
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label" data-i18n="interest-upfront-label">Interest Upfront Distribution (%)</label>
                                    <input type="number" id="interest-upfront-percent-admin" class="form-input" min="0" max="100" step="1" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="loan-certificate-label">Loan Certificate Distribution (%)</label>
                                    <input type="number" id="loan-certificate-percent-admin" class="form-input" min="0" max="100" step="1" required>
                                </div>
                            </div>

                            <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-xl);">
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-save"></i>
                                    <span data-i18n="save-changes">Save Changes</span>
                                </button>
                                <button type="button" id="reset-constants" class="btn-secondary">
                                    <i class="fas fa-undo"></i>
                                    <span data-i18n="reset-defaults">Reset to Defaults</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Products Management Preview -->
                <div class="card" style="margin-top: var(--spacing-lg);">
                    <div class="card-header">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--spacing-sm);">
                            <h3 class="card-title" data-i18n="unsecured-products">Unsecured Loan Products</h3>
                            <div style="display: flex; gap: var(--spacing-sm);">
                                <button id="import-csv-btn" class="btn-secondary">
                                    <i class="fas fa-file-import"></i>
                                    <span data-i18n="import-csv">Import CSV</span>
                                </button>
                                <button id="add-product-btn" class="btn-primary">
                                    <i class="fas fa-plus"></i>
                                    <span data-i18n="add-product">Add Product</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="products-list" style="margin-top: var(--spacing-md);">
                            <!-- Products will be loaded here -->
                        </div>
                    </div>
                </div>

                <!-- CSV Import Input (Hidden) -->
                <input type="file" id="csv-file-input" accept=".csv" style="display: none;">

                <!-- Add/Edit Product Modal -->
                <div id="product-modal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="modal-title">Add Product</h3>
                            <button class="btn-icon" id="close-modal">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="product-form">
                                <input type="hidden" id="product-id">
                                <div class="grid grid-2">
                                    <div class="form-group">
                                        <label class="form-label" data-i18n="product-name-ar">Product Name (Arabic)</label>
                                        <input type="text" id="product-name-ar" class="form-input" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label" data-i18n="product-name-en">Product Name (English)</label>
                                        <input type="text" id="product-name-en" class="form-input" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label" data-i18n="ubs-code">UBS Code</label>
                                        <input type="text" id="product-ubs" class="form-input" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label" data-i18n="sector">Sector</label>
                                        <select id="product-sector" class="form-select" required>
                                            <option value="" data-i18n="select-product-placeholder">Select...</option>
                                            <option value="Government/Public">Government/Public</option>
                                            <option value="Private">Private</option>
                                            <option value="Not Specified">Not Specified</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label" data-i18n="payroll">Payroll Type</label>
                                        <select id="product-payroll" class="form-select" required>
                                            <option value="" data-i18n="select-product-placeholder">Select...</option>
                                            <option value="Contracted">Contracted</option>
                                            <option value="Non-Contracted">Non-Contracted</option>
                                            <option value="Not Specified">Not Specified</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label" data-i18n="company-segment">Company Segment</label>
                                        <select id="product-segment" class="form-select" required>
                                            <option value="" data-i18n="select-product-placeholder">Select...</option>
                                            <option value="A+">A+</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="Not Specified">Not Specified</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Rate 1-5 Years (%)</label>
                                        <input type="text" id="product-rate1" class="form-input" placeholder="e.g., 22.75%">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Rate 5-8 Years (%)</label>
                                        <input type="text" id="product-rate2" class="form-input" placeholder="e.g., 22.25%">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Rate 8+ Years (%)</label>
                                        <input type="text" id="product-rate3" class="form-input" placeholder="e.g., 21.75%">
                                    </div>
                                </div>
                                <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-lg); justify-content: flex-end;">
                                    <button type="button" class="btn-secondary" id="cancel-product">Cancel</button>
                                    <button type="submit" class="btn-primary">
                                        <i class="fas fa-save"></i>
                                        <span data-i18n="save-product">Save Product</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static populateForm() {
        document.getElementById('cd-rate-admin').value = (this.constants.CD_RATE * 100).toFixed(2);
        document.getElementById('td-margin-admin').value = (this.constants.TD_MARGIN * 100).toFixed(2);
        document.getElementById('min-rate-admin').value = (this.constants.MIN_RATE * 100).toFixed(2);
        document.getElementById('max-loan-percent-admin').value = (this.constants.MAX_LOAN_PERCENT * 100).toFixed(0);
        document.getElementById('max-dti-admin').value = (this.constants.MAX_DBR_RATIO * 100).toFixed(0);
        document.getElementById('stamp-duty-admin').value = this.constants.STAMP_DUTY_RATE.toFixed(1);

        // Populate tenor limit constants
        document.getElementById('secured-min-tenor-months-admin').value = this.constants.SECURED_MIN_TENOR_MONTHS || 6;
        document.getElementById('secured-max-tenor-years-admin').value = this.constants.SECURED_MAX_TENOR_YEARS || 10;
        document.getElementById('unsecured-max-tenor-8plus-admin').value = this.constants.UNSECURED_MAX_TENOR_8_PLUS_YEARS || 10;

        // Populate scenario constants
        document.getElementById('interest-upfront-percent-admin').value = (this.constants.SCENARIOS?.INTEREST_UPFRONT_PERCENT || 0);
        document.getElementById('loan-certificate-percent-admin').value = (this.constants.SCENARIOS?.LOAN_CERTIFICATE_PERCENT || 0);
    }

    static attachEventListeners() {
        const constantsForm = document.getElementById('constants-form');
        if (constantsForm) {
            constantsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveConstants();
            });
        }

        const resetBtn = document.getElementById('reset-constants');
        if (resetBtn) {
            resetBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to reset all constants to defaults?')) {
                    await this.resetConstants();
                }
            });
        }

        // Product management
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.openProductModal());
        }

        const importCsvBtn = document.getElementById('import-csv-btn');
        if (importCsvBtn) {
            importCsvBtn.addEventListener('click', () => {
                document.getElementById('csv-file-input').click();
            });
        }

        const csvFileInput = document.getElementById('csv-file-input');
        if (csvFileInput) {
            csvFileInput.addEventListener('change', (e) => this.handleCsvImport(e));
        }

        const closeModal = document.getElementById('close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeProductModal());
        }

        const cancelProduct = document.getElementById('cancel-product');
        if (cancelProduct) {
            cancelProduct.addEventListener('click', () => this.closeProductModal());
        }

        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveProduct();
            });
        }

        // Close modal on outside click
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeProductModal();
                }
            });
        }
    }

    static renderProductsList() {
        const container = document.getElementById('products-list');
        if (!container) return;

        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="info-box">
                    <i class="fas fa-info-circle"></i>
                    ${i18n.t('no-products')}. ${i18n.t('add-product')} to create your first product.
                </div>
            `;
            return;
        }

        const productsHtml = `
            <div class="results-table-wrapper" style="overflow-x: auto;">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>${i18n.t('ubs-code')}</th>
                            <th>${i18n.t('product')}</th>
                            <th>${i18n.t('sector')}</th>
                            <th>${i18n.t('payroll')}</th>
                            <th>${i18n.t('company-segment')}</th>
                            <th>${i18n.t('rate-1-5')}</th>
                            <th>${i18n.t('rate-5-8')}</th>
                            <th>${i18n.t('rate-8-plus')}</th>
                            <th>${i18n.t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.products.map(product => `
                            <tr>
                                <td>${product.ubsCode || ''}</td>
                                <td>${product.nameEn || ''}</td>
                                <td>${product.sector || ''}</td>
                                <td>${product.payrollType || ''}</td>
                                <td>${product.companySegment || ''}</td>
                                <td>${product.rate1_5 || '-'}</td>
                                <td>${product.rate5_8 || '-'}</td>
                                <td>${product.rate8Plus || '-'}</td>
                                <td>
                                    <button class="btn-icon" onclick="window.adminPage.editProduct('${product.id}')" title="${i18n.t('edit-product')}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="window.adminPage.deleteProduct('${product.id}')" title="${i18n.t('delete-product')}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = productsHtml;
    }

    static openProductModal(productId = null) {
        const modal = document.getElementById('product-modal');
        const title = document.getElementById('modal-title');

        if (productId) {
            title.textContent = i18n.t('edit-product');
            const product = this.products.find(p => p.id === productId);
            if (product) {
                document.getElementById('product-id').value = product.id;
                document.getElementById('product-name-ar').value = product.nameAr || '';
                document.getElementById('product-name-en').value = product.nameEn || '';
                document.getElementById('product-ubs').value = product.ubsCode || '';
                document.getElementById('product-sector').value = product.sector || '';
                document.getElementById('product-payroll').value = product.payrollType || '';
                document.getElementById('product-segment').value = product.companySegment || '';
                document.getElementById('product-rate1').value = product.rate1_5 || '';
                document.getElementById('product-rate2').value = product.rate5_8 || '';
                document.getElementById('product-rate3').value = product.rate8Plus || '';
            }
        } else {
            title.textContent = i18n.t('add-product');
            document.getElementById('product-form').reset();
            document.getElementById('product-id').value = '';
        }

        modal.style.display = 'flex';
    }

    static closeProductModal() {
        document.getElementById('product-modal').style.display = 'none';
        document.getElementById('product-form').reset();
    }

    static async saveProduct() {
        const productId = document.getElementById('product-id').value;
        const productData = {
            nameAr: document.getElementById('product-name-ar').value,
            nameEn: document.getElementById('product-name-en').value,
            ubsCode: document.getElementById('product-ubs').value,
            sector: document.getElementById('product-sector').value,
            payrollType: document.getElementById('product-payroll').value,
            companySegment: document.getElementById('product-segment').value,
            rate1_5: document.getElementById('product-rate1').value,
            rate5_8: document.getElementById('product-rate2').value,
            rate8Plus: document.getElementById('product-rate3').value
        };

        const result = await FirestoreService.saveProduct(productData, productId || null);

        if (result.success) {
            const message = productId ? i18n.t('product-updated') : i18n.t('product-added');
            window.app.showToast(message, 'success');
            this.closeProductModal();
            await this.loadProducts();
        } else {
            window.app.showToast(result.error || i18n.t('save-failed'), 'error');
        }
    }

    static editProduct(productId) {
        this.openProductModal(productId);
    }

    static async deleteProduct(productId) {
        if (!confirm(i18n.t('delete-confirm'))) {
            return;
        }

        const result = await FirestoreService.deleteProduct(productId);

        if (result.success) {
            window.app.showToast(i18n.t('product-deleted'), 'success');
            await this.loadProducts();
        } else {
            window.app.showToast(result.error || i18n.t('delete-failed'), 'error');
        }
    }

    static async handleCsvImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Reset file input
        event.target.value = '';

        if (!file.name.endsWith('.csv')) {
            window.app.showToast(i18n.t('invalid-csv'), 'error');
            return;
        }

        try {
            const text = await file.text();
            const products = this.parseCsv(text);

            if (products.length === 0) {
                window.app.showToast(i18n.t('no-products-found'), 'warning');
                return;
            }

            if (!confirm(`${i18n.t('import-confirm').replace('products?', `${products.length} products?`)}`)) {
                return;
            }

            let successCount = 0;
            let errorCount = 0;

            for (const product of products) {
                const result = await FirestoreService.saveProduct(product);
                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            }

            await this.loadProducts();

            if (errorCount === 0) {
                window.app.showToast(i18n.t('import-success').replace('products', `${successCount} products`), 'success');
            } else {
                window.app.showToast(`${i18n.t('import-success').split(' ')[0]} ${successCount} ${i18n.t('product')}, ${errorCount} failed`, 'warning');
            }

        } catch (error) {
            console.error('CSV import error:', error);
            window.app.showToast(i18n.t('import-failed') + ': ' + error.message, 'error');
        }
    }

    static async resetConstants() {
        const defaults = FirestoreService.getDefaultConstants();
        const result = await FirestoreService.updateConstants(defaults);

        if (result.success) {
            window.app.showToast(i18n.t('constants-reset'), 'success');
            this.constants = defaults;
            this.populateForm();
        } else {
            window.app.showToast(result.error || i18n.t('reset-failed'), 'error');
        }
    }

    static parseCsv(text) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const products = [];

        // Expected headers mapping
        const headerMap = {
            'Product_Name_AR': 'nameAr',
            'UBS_Code': 'ubsCode',
            'Product_Name_EN': 'nameEn',
            'Sector': 'sector',
            'Payroll_Type': 'payrollType',
            'Company_Segment': 'companySegment',
            'Interest_Rate_1_5_Years': 'rate1_5',
            'Interest_Rate_5_8_Years': 'rate5_8',
            'Interest_Rate_8_Plus_Years': 'rate8Plus'
        };

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCsvLine(lines[i]);
            if (values.length !== headers.length) continue;

            const product = {};
            headers.forEach((header, index) => {
                const mappedField = headerMap[header];
                if (mappedField && values[index]) {
                    product[mappedField] = values[index].trim();
                }
            });

            // Only add if we have minimum required fields
            if (product.nameEn && product.ubsCode) {
                products.push(product);
            }
        }

        return products;
    }

    static parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current);
        return result;
    }

    static async saveConstants() {
        const constants = {
            CD_RATE: parseFloat(document.getElementById('cd-rate-admin').value) / 100,
            TD_MARGIN: parseFloat(document.getElementById('td-margin-admin').value) / 100,
            MIN_RATE: parseFloat(document.getElementById('min-rate-admin').value) / 100,
            MAX_LOAN_PERCENT: parseFloat(document.getElementById('max-loan-percent-admin').value) / 100,
            MAX_DBR_RATIO: parseFloat(document.getElementById('max-dti-admin').value) / 100,
            STAMP_DUTY_RATE: parseFloat(document.getElementById('stamp-duty-admin').value),
            SECURED_MIN_TENOR_MONTHS: parseInt(document.getElementById('secured-min-tenor-months-admin').value),
            SECURED_MAX_TENOR_YEARS: parseInt(document.getElementById('secured-max-tenor-years-admin').value),
            UNSECURED_MAX_TENOR_8_PLUS_YEARS: parseInt(document.getElementById('unsecured-max-tenor-8plus-admin').value),
            SCENARIOS: {
                INTEREST_UPFRONT_PERCENT: parseInt(document.getElementById('interest-upfront-percent-admin').value),
                LOAN_CERTIFICATE_PERCENT: parseInt(document.getElementById('loan-certificate-percent-admin').value)
            }
        };

        const result = await FirestoreService.updateConstants(constants);

        if (result.success) {
            window.app.showToast(i18n.t('save-success'), 'success');
            this.constants = constants;
        } else {
            window.app.showToast(result.error || 'Failed to save', 'error');
        }
    }
}
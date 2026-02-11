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
                                    <small class="text-muted" data-i18n="stamp-duty-help">Display in per mille (‰). 0.5 = 0.5‰ = 0.0005 ratio</small>
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
                            <h3 id="modal-title" data-i18n="add-product">Add Product</h3>
                            <button class="modal-close" onclick="adminPage.closeProductModal()">&times;</button>
                        </div>
                        <form id="product-form">
                            <div class="modal-body">
                                <div class="form-group">
                                    <label class="form-label"><span data-i18n="ubs-code">UBS Code</span> *</label>
                                    <input type="text" id="product-ubs-code" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label"><span data-i18n="product-name-en">Product Name (English)</span> *</label>
                                    <input type="text" id="product-name-en" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="product-name-ar">Product Name (Arabic)</label>
                                    <input type="text" id="product-name-ar" class="form-input" dir="rtl">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="sector">Sector</label>
                                    <select id="product-sector" class="form-input">
                                        <option value="Not Specified" data-i18n="not-specified">Not Specified</option>
                                        <option value="Government/Public" data-i18n="government-public">Government/Public</option>
                                        <option value="Private" data-i18n="private">Private</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="payroll">Payroll Type</label>
                                    <select id="product-payroll" class="form-input">
                                        <option value="Not Specified" data-i18n="not-specified">Not Specified</option>
                                        <option value="Contracted" data-i18n="contracted">Contracted</option>
                                        <option value="Non-Contracted" data-i18n="non-contracted">Non-Contracted</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="company-segment">Company Segment</label>
                                    <select id="product-segment" class="form-input">
                                        <option value="Not Specified" data-i18n="not-specified">Not Specified</option>
                                        <option value="A+">A+</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                    </select>
                                </div>
                                <h4 style="margin-top: var(--spacing-lg); margin-bottom: var(--spacing-sm);" data-i18n="interest-rate">Interest Rates</h4>
                                <div class="info-box" style="margin-bottom: var(--spacing-md);">
                                    <i class="fas fa-info-circle"></i>
                                    <div>
                                        <strong data-i18n="rate-rules-title">Rate Rules:</strong>
                                        <ul style="margin: 0.5rem 0 0 1.5rem;">
                                            <li data-i18n="rate-rule-1">If Rate 8+ exists, Rate 5-8 must exist</li>
                                            <li data-i18n="rate-rule-2">If Rate 5-8 exists, Rate 1-5 must exist</li>
                                            <li data-i18n="rate-rule-3">Rates can be entered as "22.75" or "22.75%"</li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="rate-1-5">Interest Rate 1-5 Years</label>
                                    <input type="text" id="product-rate-1-5" class="form-input" placeholder="e.g., 22.75 or 22.75%">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="rate-5-8">Interest Rate 5-8 Years</label>
                                    <input type="text" id="product-rate-5-8" class="form-input" placeholder="e.g., 23.50 or 23.50%">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" data-i18n="rate-8-plus">Interest Rate 8+ Years</label>
                                    <input type="text" id="product-rate-8-plus" class="form-input" placeholder="e.g., 24.25 or 24.25%">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">
                                        <input type="checkbox" id="product-active" checked>
                                        <span data-i18n="active">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn-secondary" onclick="adminPage.closeProductModal()"><span data-i18n="cancel">Cancel</span></button>
                                <button type="submit" class="btn-primary"><span data-i18n="save-product">Save Product</span></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    static populateForm() {
        // Convert from real ratio to percentage for display
        document.getElementById('cd-rate-admin').value = (this.constants.CD_RATE * 100).toFixed(2);
        document.getElementById('td-margin-admin').value = (this.constants.TD_MARGIN * 100).toFixed(2);
        document.getElementById('min-rate-admin').value = (this.constants.MIN_RATE * 100).toFixed(2);
        document.getElementById('max-loan-percent-admin').value = (this.constants.MAX_LOAN_PERCENT * 100).toFixed(0);
        document.getElementById('max-dti-admin').value = (this.constants.MAX_DBR_RATIO * 100).toFixed(0);

        // Convert stamp duty from real ratio (0.0005) to per mille (0.5)
        document.getElementById('stamp-duty-admin').value = (this.constants.STAMP_DUTY_RATE * 1000).toFixed(1);

        document.getElementById('secured-min-tenor-months-admin').value = this.constants.SECURED_MIN_TENOR_MONTHS;
        document.getElementById('secured-max-tenor-years-admin').value = this.constants.SECURED_MAX_TENOR_YEARS;
        document.getElementById('unsecured-max-tenor-8plus-admin').value = this.constants.UNSECURED_MAX_TENOR_8_PLUS_YEARS;
        document.getElementById('interest-upfront-percent-admin').value = this.constants.SCENARIOS.INTEREST_UPFRONT_PERCENT;
        document.getElementById('loan-certificate-percent-admin').value = this.constants.SCENARIOS.LOAN_CERTIFICATE_PERCENT;
    }

    static renderProductsList() {
        const container = document.getElementById('products-list');

        if (this.products.length === 0) {
            container.innerHTML = `<p class="text-muted" data-i18n="no-products">No products found. Add one or import from CSV.</p>`;
            return;
        }

        // Sort products by UBS code and ID
        const sorted = [...this.products].sort((a, b) => {
            const codeA = a.ubsCode || '';
            const codeB = b.ubsCode || '';
            return codeA.localeCompare(codeB);
        });

        let html = '<div style="overflow-x: auto;"><table class="data-table"><thead><tr>';
        html += '<th><span data-i18n="product-id">Product ID</span></th>';
        html += '<th><span data-i18n="ubs-code">UBS Code</span></th>';
        html += '<th><span data-i18n="product-name-en">Product Name</span></th>';
        html += '<th><span data-i18n="sector">Sector</span></th>';
        html += '<th><span data-i18n="payroll">Payroll</span></th>';
        html += '<th><span data-i18n="company-segment">Segment</span></th>';
        html += '<th><span data-i18n="rate-1-5">Rate 1-5</span></th>';
        html += '<th><span data-i18n="rate-5-8">Rate 5-8</span></th>';
        html += '<th><span data-i18n="rate-8-plus">Rate 8+</span></th>';
        html += '<th><span data-i18n="status">Status</span></th>';
        html += '<th><span data-i18n="actions">Actions</span></th>';
        html += '</tr></thead><tbody>';

        sorted.forEach(product => {
            const isActive = product.active !== false;
            const rowClass = isActive ? '' : 'style="opacity: 0.5;"';

            html += `<tr ${rowClass}>`;
            html += `<td><code style="font-size: 0.85em;">${product.id}</code></td>`;
            html += `<td>${product.ubsCode || '-'}</td>`;
            html += `<td>${product.nameEn || '-'}</td>`;
            html += `<td>${product.sector || '-'}</td>`;
            html += `<td>${product.payrollType || '-'}</td>`;
            html += `<td>${product.companySegment || '-'}</td>`;
            html += `<td>${product.rate1_5 || '-'}</td>`;
            html += `<td>${product.rate5_8 || '-'}</td>`;
            html += `<td>${product.rate8Plus || '-'}</td>`;
            html += `<td>${isActive ? '<span style="color: var(--success);">●</span> <span data-i18n="active">Active</span>' : '<span style="color: var(--error);">●</span> <span data-i18n="inactive">Inactive</span>'}</td>`;
            html += `<td>`;
            html += `<button class="btn-icon" onclick="adminPage.editProduct('${product.id}')" title="Edit"><i class="fas fa-edit"></i></button>`;
            html += `<button class="btn-icon" onclick="adminPage.deleteProduct('${product.id}')" title="Delete"><i class="fas fa-trash"></i></button>`;
            html += `</td>`;
            html += `</tr>`;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;

        // Update i18n for dynamically generated content
        i18n.updatePageText();
    }

    static attachEventListeners() {
        // Constants form
        document.getElementById('constants-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveConstants();
        });

        // Reset button
        document.getElementById('reset-constants').addEventListener('click', () => {
            if (confirm(i18n.t('reset-constants-confirm'))) {
                this.resetConstants();
            }
        });

        // CSV Import
        document.getElementById('import-csv-btn').addEventListener('click', () => {
            document.getElementById('csv-file-input').click();
        });

        document.getElementById('csv-file-input').addEventListener('change', (e) => {
            this.handleCsvImport(e);
        });

        // Add Product
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.openProductModal();
        });

        // Product Form
        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });
    }

    static openProductModal(productId = null) {
        const modal = document.getElementById('product-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('product-form');

        if (productId) {
            title.textContent = i18n.t('edit-product');
            title.removeAttribute('data-i18n');
            form.dataset.editId = productId;
            this.populateProductForm(productId);
        } else {
            title.textContent = i18n.t('add-product');
            title.setAttribute('data-i18n', 'add-product');
            delete form.dataset.editId;
            form.reset();
            document.getElementById('product-active').checked = true;
        }

        modal.style.display = 'flex';
    }

    static closeProductModal() {
        document.getElementById('product-modal').style.display = 'none';
        document.getElementById('product-form').reset();
    }

    static async populateProductForm(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        document.getElementById('product-ubs-code').value = product.ubsCode || '';
        document.getElementById('product-name-en').value = product.nameEn || '';
        document.getElementById('product-name-ar').value = product.nameAr || '';
        document.getElementById('product-sector').value = product.sector || 'Not Specified';
        document.getElementById('product-payroll').value = product.payrollType || 'Not Specified';
        document.getElementById('product-segment').value = product.companySegment || 'Not Specified';
        document.getElementById('product-rate-1-5').value = product.rate1_5 ? product.rate1_5.replace('%', '') : '';
        document.getElementById('product-rate-5-8').value = product.rate5_8 ? product.rate5_8.replace('%', '') : '';
        document.getElementById('product-rate-8-plus').value = product.rate8Plus ? product.rate8Plus.replace('%', '') : '';
        document.getElementById('product-active').checked = product.active !== false;
    }

    static async saveProduct() {
        const form = document.getElementById('product-form');
        const editId = form.dataset.editId;

        const productData = {
            ubsCode: document.getElementById('product-ubs-code').value.trim(),
            nameEn: document.getElementById('product-name-en').value.trim(),
            nameAr: document.getElementById('product-name-ar').value.trim(),
            sector: document.getElementById('product-sector').value,
            payrollType: document.getElementById('product-payroll').value,
            companySegment: document.getElementById('product-segment').value,
            rate1_5: document.getElementById('product-rate-1-5').value.trim(),
            rate5_8: document.getElementById('product-rate-5-8').value.trim(),
            rate8Plus: document.getElementById('product-rate-8-plus').value.trim(),
            active: document.getElementById('product-active').checked
        };

        const result = await FirestoreService.saveProduct(productData, editId);

        if (result.success) {
            window.app.showToast(editId ? i18n.t('product-updated') : i18n.t('product-added'), 'success');
            this.closeProductModal();
            await this.loadProducts();
        } else {
            window.app.showToast(result.error || i18n.t('save-failed'), 'error');
        }
    }

    static async editProduct(productId) {
        this.openProductModal(productId);
    }

    static async deleteProduct(productId) {
        if (!confirm(i18n.t('delete-product-confirm'))) {
            return;
        }

        // Option: use soft delete instead
        // const result = await FirestoreService.deleteProduct(productId, true); // soft delete

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

            if (!confirm(i18n.t('csv-import-confirm', { count: products.length }))) {
                return;
            }

            // Show loading indicator
            window.app.showToast(i18n.t('importing-products'), 'info');

            // Use batch import for better performance
            const results = await FirestoreService.batchImportProducts(products);

            // Reload products once after batch is complete
            await this.loadProducts();

            if (results.failed === 0) {
                window.app.showToast(i18n.t('csv-import-success', { count: results.success }), 'success');
            } else {
                let errorMsg = i18n.t('csv-import-partial', { success: results.success, failed: results.failed });
                if (results.errors.length > 0) {
                    console.error('Import errors:', results.errors);
                    errorMsg += ` ${i18n.t('check-console')}`;
                }
                window.app.showToast(errorMsg, 'warning');
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
        // Split by both \r\n and \n, filter empty lines
        const lines = text.split(/\r?\n/).filter(line => line.trim());

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
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines

            const values = this.parseCsvLine(line);
            if (values.length !== headers.length) continue;

            const product = {};
            headers.forEach((header, index) => {
                const mappedField = headerMap[header];
                if (mappedField && values[index]) {
                    let value = values[index].trim();

                    // Ensure interest rates always have % suffix
                    if (mappedField.startsWith('rate') && value && !value.endsWith('%')) {
                        value = value + '%';
                    }

                    product[mappedField] = value;
                }
            });

            // Validate required fields
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

            // Convert stamp duty from per mille (0.5) to real ratio (0.0005)
            STAMP_DUTY_RATE: parseFloat(document.getElementById('stamp-duty-admin').value) / 1000,

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
export class UIManager {
    constructor(appState, urlParamsManager) {
        this.appState = appState;
        this.urlParamsManager = urlParamsManager;
        this.setupEventListeners();
        // Subscribe to state changes
        appState.subscribe(this.handleStateChange.bind(this));
    }

    handleStateChange(event, state) {
        switch (event) {
            case 'languageChanged':
                this.updateLanguageUI();
                break;
            case 'modeChanged':
                this.updateModeUI();
                break;
            case 'calculationComplete':
                this.handleCalculationResult(state);
                break;
            case 'validationError':
                this.showValidationFeedback(state);
                break;
        }
    }

    setupEventListeners() {
        // Centralized event listener setup
        this.addCalculateListener();
        this.addTermToggleListener();
        this.addModeToggleListener();
        this.addKeyboardShortcuts();
        this.addFormValidationListeners();
    }

    addCalculateListener() {
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.triggerCalculation();
            }
        });
        // Add click listeners for calculate buttons
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-calculate') || e.target.classList.contains('calculate-btn')) {
                e.preventDefault();
                this.triggerCalculation();
            }
        });
    }   

    addTermToggleListener() {       
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-tenor-toggle') ||
                e.target.closest('[data-tenor-toggle]')) {
                e.preventDefault();

                // Toggle the state
                this.appState.toggleTerm();

                // Update UI
                this.urlParamsManager.updateToggleUI(this.appState.isYears);

                // Update URL
                this.urlParamsManager.updateURL();
            }
        });
    }

    addModeToggleListener() {
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-mode-toggle')) {
                e.preventDefault();
                this.appState.toggleMode();
            }
        });
        const bodyId = document.body.id;
        if (bodyId == 'first-month-interest') {
            const startDateInput = document.getElementById('startDate');
            if (startDateInput) {
                const today = new Date();
                const dateString = today.toISOString().split('T')[0];
                startDateInput.value = dateString;


                const tempDate = new Date(today);
                tempDate.setMonth(tempDate.getMonth() + 2);
                const endDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), 6);
                const endDateEl = document.getElementById('endDate');
                if (endDateEl) {
                    const dateString2 = endDate.toISOString().split('T')[0];
                    endDateEl.textContent = dateString2;
                }

                // Add date validation
                startDateInput.addEventListener('change', function () {
                    const startDateObj = new Date(this.value); const tempDate = new Date(startDateObj);

                    tempDate.setMonth(tempDate.getMonth() + 2);
                    const endDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), 5);
                    const endDateEl = document.getElementById('endDate');
                    if (endDateEl) {
                        const locale = app.appState.currentLanguage === 'ar' ? 'ar-EG' : 'en-EG';
                        endDateEl.textContent = endDate.toLocaleDateString(locale);
                    }
                });
            }
        }
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter for calculate
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.triggerCalculation();
            }

            // Ctrl+M for mode toggle
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                this.appState.toggleMode();
            }
            // Ctrl+Y for mode toggle
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                this.appState.toggleTerm();
            }
        });
    }

    addFormValidationListeners() {
        // Real-time form validation feedback
        document.addEventListener('input', (e) => {
            if (e.target.type === 'number') {
                this.validateField(e.target);
            }
        });

        document.addEventListener('blur', (e) => {
            if (e.target.type === 'number') {
                this.validateField(e.target);
            }
        });
    }

    triggerCalculation() {
        // Validate all inputs before calculation
        const inputs = document.querySelectorAll('input[type="number"]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            alert(this.appState.currentLanguage === 'ar'
                ? 'يرجى تصحيح الأخطاء قبل المتابعة'
                : 'Please correct the errors before proceeding');
            return;
        }

        const bodyId = document.body.id;
        const calculators = {
            'first-month-interest': () => import('./calculators/first-month-interest-calculator.js'),
            'loan-calculator': () => import('./calculators/loan-calculator.js'),
            'max-loan-calculators': () => import('./calculators/max-loan-calculator.js'),
            'smart-loan': () => import('./calculators/smart-loan-calculator.js')
        };

        const calculatorLoader = calculators[bodyId];
        if (calculatorLoader) {
            // Show loading indicator
            this.showLoadingIndicator();

            calculatorLoader().then(module => {
                this.hideLoadingIndicator();
                module.calculate(this.appState);
            }).catch(error => {
                this.hideLoadingIndicator();
                console.error('Calculator loading error:', error);
                alert(this.appState.currentLanguage === 'ar'
                    ? 'حدث خطأ أثناء تحميل الحاسبة'
                    : 'An error occurred while loading the calculator');
            });
        }
    }

    updateLanguageUI() {
        // Update elements with data-en and data-ar attributes
        const elements = document.querySelectorAll('[data-en][data-ar]');
        elements.forEach(element => {
            const text = element.getAttribute(`data-${this.appState.currentLanguage}`);
            if (text) element.textContent = text;
        });

        // Update placeholders
        const placeholderElements = document.querySelectorAll('[data-placeholder-en][data-placeholder-ar]');
        placeholderElements.forEach(element => {
            const placeholder = element.getAttribute(`data-placeholder-${this.appState.currentLanguage}`);
            if (placeholder) element.placeholder = placeholder;
        });

        // Update titles and alt text
        const titleElements = document.querySelectorAll('[data-title-en][data-title-ar]');
        titleElements.forEach(element => {
            const title = element.getAttribute(`data-title-${this.appState.currentLanguage}`);
            if (title) element.title = title;
        });

        // Update aria-label for accessibility
        const ariaElements = document.querySelectorAll('[data-aria-en][data-aria-ar]');
        ariaElements.forEach(element => {
            const ariaLabel = element.getAttribute(`data-aria-${this.appState.currentLanguage}`);
            if (ariaLabel) element.setAttribute('aria-label', ariaLabel);
        });

        // Update document title if it has language attributes
        const titleElement = document.querySelector('title[data-en][data-ar]');
        if (titleElement) {
            const title = titleElement.getAttribute(`data-${this.appState.currentLanguage}`);
            if (title) document.title = title;
        }
    }

    updateModeUI() {
        const incomeModeInputs = document.getElementById('incomeModeInputs');
        const paymentModeInputs = document.getElementById('paymentModeInputs');

        if (incomeModeInputs && paymentModeInputs) {
            incomeModeInputs.style.display = this.appState.isIncomeMode ? 'block' : 'none';
            paymentModeInputs.style.display = this.appState.isIncomeMode ? 'none' : 'block';
        }

        // Update mode toggle button text
        const modeToggle = document.querySelector('[data-mode-toggle]');
        if (modeToggle) {           
            const text = this.appState.isIncomeMode
                ? this.appState.translate('switchToPayment')
                : this.appState.translate('switchToIncome');
            modeToggle.textContent = text;
        }
        const modeTitle = document.querySelector('[data-mode-title]');
        if (modeTitle) {
            const text = this.appState.isIncomeMode
                ? this.appState.translate('incomeMode')
                : this.appState.translate('paymentMode');
            modeTitle.textContent = text;
        }
        const modeRatio = document.querySelector('[data-mode-ratio]');
        if (modeRatio) {
            const text = `${this.appState.translate('maxDBR')}: ${this.appState.maxDBRRatio}%`;
            modeRatio.textContent = text;
        }
        const modeRate = document.querySelector('[data-mode-rate]');
        if (modeRate) {
            const text = `${this.appState.translate('minRate')}: ${this.appState.minInterestRate}%`;
            modeRate.textContent = text;
        }
    }

    updateLanguage(newLanguage) {
        // This method is called from main.js when language changes
        this.updateLanguageUI();

        const bodyId = document.body.id;
        if (bodyId == 'max-loan-calculators') {
            this.updateModeUI();
        }
    }

    validateField(field) {
        const value = parseFloat(field.value);
        const min = parseFloat(field.min);
        const max = parseFloat(field.max);
        const required = field.hasAttribute('required');

        // Clear previous validation states
        field.classList.remove('valid', 'invalid', 'warning');
        this.hideFieldMessage(field);

        if (required && !field.value.trim()) {
            field.classList.add('invalid');
            this.showFieldMessage(field, this.getValidationMessage('required'), 'error');
            return false;
        }

        if (field.value && isNaN(value)) {
            field.classList.add('invalid');
            this.showFieldMessage(field, this.getValidationMessage('invalid_number'), 'error');
            return false;
        }

        if (!isNaN(value)) {
            if (min !== undefined && value < min) {
                field.classList.add('invalid');
                this.showFieldMessage(field, this.getValidationMessage('min_value', { min }), 'error');
                return false;
            }

            if (max !== undefined && value > max) {
                field.classList.add('invalid');
                this.showFieldMessage(field, this.getValidationMessage('max_value', { max }), 'error');
                return false;
            }
            else {
                field.classList.add('valid');
            }
        }

        return true;
    }

    getValidationMessage(type, params = {}) {
        const lang = this.appState.currentLanguage;
        const messages = {
            required: {
                ar: 'هذا الحقل مطلوب',
                en: 'This field is required'
            },
            invalid_number: {
                ar: 'يرجى إدخال رقم صحيح',
                en: 'Please enter a valid number'
            },
            min_value: {
                ar: `القيمة يجب أن تكون ${params.min} أو أكثر`,
                en: `Value must be ${params.min} or greater`
            },
            max_value: {
                ar: `القيمة يجب أن تكون ${params.max} أو أقل`,
                en: `Value must be ${params.max} or less`
            },
            min_warning: {
                ar: 'قيمة منخفضة - تحقق من صحة البيانات',
                en: 'Low value - please verify data'
            }
        };

        return messages[type] ? messages[type][lang] : '';
    }

    showFieldMessage(field, message, type = 'info') {
        const messageId = `${field.id || field.name}-message`;
        let messageElement = document.getElementById(messageId);

        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = messageId;
            messageElement.className = `field-message ${type}`;
            field.parentNode.insertBefore(messageElement, field.nextSibling);
        }

        messageElement.textContent = message;
        messageElement.className = `field-message ${type}`;
        messageElement.style.display = 'block';
    }

    hideFieldMessage(field) {
        const messageId = `${field.id || field.name}-message`;
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
            messageElement.style.display = 'none';
        }
    }  

    handleCalculationResult(result) {
        // Handle calculation results - could display in modal or update UI
        if (result.error) {
            alert(result.error);
        } else {
            // Update results display
            this.updateResultsDisplay(result);
        }
    }

    updateResultsDisplay(result) {
        const resultsContainer = document.getElementById('results');
        if (resultsContainer) {
            // Update results container with new data
            resultsContainer.innerHTML = this.formatResults(result);
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    formatResults(result) {
        // Format calculation results for display
        const lang = this.appState.currentLanguage;
        // Implementation depends on result structure
        return `<div class="results-content">${JSON.stringify(result, null, 2)}</div>`;
    }

    showLoadingIndicator() {
        const loadingHTML = `
            <div class="loading-indicator">
                <div class="spinner"></div>
                <p>${this.appState.currentLanguage === 'ar' ? 'جارٍ الحساب...' : 'Calculating...'}</p>
            </div>
        `;

        const loadingContainer = document.createElement('div');
        loadingContainer.id = 'loading-overlay';
        loadingContainer.className = 'loading-overlay';
        loadingContainer.innerHTML = loadingHTML;
        document.body.appendChild(loadingContainer);
    }

    hideLoadingIndicator() {
        const loadingContainer = document.getElementById('loading-overlay');
        if (loadingContainer) {
            loadingContainer.remove();
        }
    }

    showValidationFeedback(validationState) {
        // Handle validation feedback from the app state
        if (validationState.hasErrors) {
            // Highlight problematic fields
            validationState.errors.forEach(error => {
                const field = document.getElementById(error.fieldId);
                if (field) {
                    field.classList.add('invalid');
                    this.showFieldMessage(field, error.message, 'error');
                }
            });
        }
    }
}
// url-params.js - Complete standalone module
export class URLParamsManager {
    constructor(appState) {
        this.appState = appState;
        this.paramMappings = {
            // Input field IDs mapped to URL parameter names
            'principal': 'amount',
            'cdRate': 'cdRate',
            'interestRate': 'rate',
            'loanTerm': 'term',
            'minTenor': 'minTerm',
            'maxTenor': 'maxTerm',
            'startDate': 'startDate',
            'monthlyIncome': 'income',
            'monthlyInstallments': 'installment',
            'maxDTI': 'maxDTI',
            'fixedPayment': "payment",            
        };
        this.updateTimeout = null;
    }

    // Read URL parameters and populate form fields
    loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);

        // Set input field values from URL parameters
        Object.entries(this.paramMappings).forEach(([fieldId, paramName]) => {
            const paramValue = urlParams.get(paramName);
            if (paramValue !== null && paramValue !== '') {
                const element = document.getElementById(fieldId);
                if (element && element.type === 'number') {
                    const numValue = parseFloat(paramValue);
                    if (!isNaN(numValue) && numValue >= 0) {
                        element.value = numValue;
                        // Trigger validation
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
                if (element && element.type === 'date') {
                    const date = new Date(paramValue);
                    if (!isNaN(date.getTime())) {
                        element.value = paramValue;
                        // Trigger validation
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            }
        });

        // Handle tenor toggle state
        const yearsParam = urlParams.get('years');
        if (yearsParam !== null) {
            const isYears = yearsParam === 'true' || yearsParam === '1';
            this.appState.isYears = isYears;
            this.updateToggleUI(isYears);
        }

        // Handle mode toggle state
        const modeParam = urlParams.get('mode');
        if (modeParam !== null) {
            const isIncomeMode = modeParam === 'true' || modeParam === '1';
            this.appState.isIncomeMode = isIncomeMode;           
        }

        // Handle language parameter
        const langParam = urlParams.get('lang');
        if (langParam && (langParam === 'en' || langParam === 'ar')) {
            this.appState.updateLanguage(langParam);
        }

        const calculateParam = urlParams.get('calculate');
        if (calculateParam !== null) {           
            const calculateElement = document.querySelector('.calculate-btn, [data-calculate]');
            if (calculateElement) {               
                    calculateElement.click();                
            }
        }
    }

    // Update URL with current form values
    updateURL() {
        // Clear existing timeout
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        // Debounce URL updates
        this.updateTimeout = setTimeout(() => {
            const params = new URLSearchParams();
            let hasParams = false;

            // Add form field values to URL
            Object.entries(this.paramMappings).forEach(([fieldId, paramName]) => {
                const element = document.getElementById(fieldId);
                if (element && element.value) {
                    if (element.type === 'number') {
                        const value = parseFloat(element.value);
                        if (!isNaN(value) && value > 0) {
                            params.set(paramName, value.toString());
                            hasParams = true;
                        }
                    }
                    if (element.type === 'date') {
                        const date = new Date(element.value);
                        if (!isNaN(date.getTime())) {
                            params.set(paramName, element.value); // use value or date.toISOString() if needed
                            hasParams = true;
                        }                        
                    }
                }
            });

            // Add toggle state
            if (this.appState.isYears !== undefined) {
                params.set('years', this.appState.isYears ? '1' : '0');
                hasParams = true;
            }

            if (this.appState.isIncomeMode !== undefined) {
                params.set('mode', this.appState.isIncomeMode ? '1' : '0');
                hasParams = true;
                if (this.appState.isIncomeMode) {
                    params.delete('payment');
                } else {
                    params.delete('income');
                    params.delete('installment');
                    params.delete('maxDTI');                   
                }
            }

            // Add language if not default
            if (this.appState.currentLanguage && this.appState.currentLanguage !== 'en') {
                params.set('lang', this.appState.currentLanguage);
                hasParams = true;
            }

            // Update URL without page reload
            const newURL = hasParams
                ? `${window.location.pathname}?${params.toString()}`
                : window.location.pathname;

            // Only update if URL actually changed
            if (newURL !== window.location.href) {
                window.history.replaceState({}, '', newURL);
            }
        }, 300); // 300ms debounce
    }

    // Update toggle UI based on state
    updateToggleUI(isYears) {
        const toggleElement = document.querySelector('[data-tenor-toggle]');
        if (toggleElement) {
            if (isYears) {
                toggleElement.classList.add('active');
            } else {
                toggleElement.classList.remove('active');
            }
        }
    }

    // Setup event listeners for automatic URL updates
    setupEventListeners() {
        // Listen for input field changes
        Object.keys(this.paramMappings).forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                // Update URL on input change (debounced)
                element.addEventListener('input', () => {
                    this.updateURL();
                });

                // Also update on blur for immediate sync
                element.addEventListener('blur', () => {
                    this.updateURL();
                });
            }
        });

        // Listen for app state changes
        if (this.appState.subscribe) {
            this.appState.subscribe((event) => {
                if (event === 'modeChanged' || event === 'termChanged' || event === 'languageChanged') {
                    this.updateURL();
                }
            });
        }
    }

    // Generate a shareable URL with current values
    getShareableURL() {
        // Force immediate URL update
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        const params = new URLSearchParams();

        // Get current form values
        Object.entries(this.paramMappings).forEach(([fieldId, paramName]) => {
            const element = document.getElementById(fieldId);
            if (element && element.value) {
                if (element.type === 'number') {
                    const value = parseFloat(element.value);
                    if (!isNaN(value) && value > 0) {
                        params.set(paramName, value.toString());                       
                    }
                }
                if (element.type === 'date') {
                    const date = new Date(element.value);
                    if (!isNaN(date.getTime())) {
                        params.set(paramName, element.value);                       
                    }
                }
            }
        });

        // Add current state
        params.set('years', this.appState.isYears ? '1' : '0');
        if (this.appState.isIncomeMode !== undefined) {
            params.set('mode', this.appState.isIncomeMode ? '1' : '0');           
            if (this.appState.isIncomeMode) {
                params.delete('payment');
            } else {
                params.delete('income');
                params.delete('installment');
                params.delete('maxDTI');
            }
        }
        if (this.appState.currentLanguage !== 'en') {
            params.set('lang', this.appState.currentLanguage);
        }
        params.set('calculate', '1');

        return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    }

    // Parse current URL and return parameters object
    getCurrentParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};

        Object.entries(this.paramMappings).forEach(([fieldId, paramName]) => {
            const value = urlParams.get(paramName);
            if (value !== null) {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    params[fieldId] = numValue;
                }
            }
        });

        const yearsParam = urlParams.get('years');
        if (yearsParam !== null) {
            params.isYears = yearsParam === 'true' || yearsParam === '1';
        }

        const modeParam = urlParams.get('mode');
        if (modeParam !== null) {
            params.isIncomeMode = modeParam === 'true' || modeParam === '1';
        }

        const langParam = urlParams.get('lang');
        if (langParam) {
            params.language = langParam;
        }

        const calculateParam = urlParams.get('calculate');
        if (calculateParam !== null) {
            const calculateElement = document.querySelector('.calculate-btn, [data-calculate]');
            if (calculateElement) {
                calculateElement.click();
            }
        }

        return params;
    }

    // Clear all URL parameters
    clearURL() {
        window.history.replaceState({}, '', window.location.pathname);
    }

    // Check if URL has parameters
    hasParameters() {
        return window.location.search.length > 0;
    }
}

// Utility function to create shareable links
export function createShareableLink(appState) {
    const urlManager = new URLParamsManager(appState);
    return urlManager.getShareableURL();
}

// Utility function to load calculator from URL
export function loadCalculatorFromURL(appState) {
    const urlManager = new URLParamsManager(appState);
    urlManager.loadFromURL();
    return urlManager;
}
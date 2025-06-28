import { InputValidator } from '../input-validator.js';

export class BaseCalculator {
    constructor(appState) {
        this.appState = appState;
        this.validator = new InputValidator();
    }

    showLoading() {
        const loading = document.getElementById('loading');
        const results = document.getElementById('results');
        if (loading) loading.style.display = 'block';
        if (results) results.style.display = 'none';
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        const results = document.getElementById('results');
        if (loading) loading.style.display = 'none';
        if (results) results.style.display = 'block';
    }

    showError(message) {
        const errorFrame = document.getElementById('errorFrame');
        const errorMessage = document.getElementById('errorMessage');
        if (errorFrame && errorMessage) {
            errorMessage.textContent = message;
            errorFrame.style.display = 'block';
        }
    }

    formatCurrency(amount) {
        if (isNaN(amount) || amount == null) return 'N/A';
        const locale = this.appState.currentLanguage === 'ar' ? 'ar-EG' : 'en-EG';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(Math.abs(amount));
    }
}
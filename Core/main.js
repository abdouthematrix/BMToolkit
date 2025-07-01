import { CONFIG } from './config.js';
import { AppState } from './state.js';
import { UIManager } from './ui-manager.js';
import { translate } from './translations.js';
import { URLParamsManager } from './url-params.js';

class BMToolkitApp {
    constructor() {
        this.appState = new AppState(translate);
        this.urlParamsManager = new URLParamsManager(this.appState); 
        this.uiManager = new UIManager(this.appState, this.urlParamsManager);
        this.version = '1.0';
        this.author = 'AbdouMatrix ®';
    }

    async initialize() {
        // Set initial language
        this.setInitialLanguage();

        // Setup URL parameters
        this.setupURLParams();

        // Setup language toggle handler
        this.setupLanguageToggle();

        // Setup real-time validation
        this.setupValidation();

        // Setup navigation handlers
        this.setupNavigation();

        // Setup app info handler
        this.setupAppInfo();

        // Focus first input
        this.focusFirstInput();

        this.setupPresetRateButtons();

        this.setupShareButton();
    }

    // Add this new method
    setupURLParams() {
        // Load parameters from URL on page load
        this.urlParamsManager.loadFromURL();

        // Setup event listeners for real-time URL updates
        this.urlParamsManager.setupEventListeners();
    }
    // Add this method to get shareable URL
    getShareableURL() {
        return this.urlParamsManager.getShareableURL();
    }   

    setInitialLanguage() {
        // Check for saved language preference or default to English
        const savedLang = localStorage.getItem('bmtoolkit-language') || 'en';
        this.appState.updateLanguage(savedLang);
        this.updateHTMLAttributes(savedLang);
    }

    setupLanguageToggle() {
        // Setup language toggle event listeners
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-language-toggle')) {
                e.preventDefault();
                this.toggleLanguage();
            }
        });

        // Add keyboard shortcut for language toggle (Ctrl+L)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.toggleLanguage();
            }
        });
    }

    toggleLanguage() {
        const newLang = this.appState.currentLanguage === 'en' ? 'ar' : 'en';
        this.appState.updateLanguage(newLang);
        this.updateHTMLAttributes(newLang);

        // Save language preference
        localStorage.setItem('bmtoolkit-language', newLang);

        // Trigger UI update
        this.uiManager.updateLanguage(newLang);
    }

    updateHTMLAttributes(lang) {
        const html = document.documentElement;
        html.setAttribute('lang', lang);
        html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }

    setupValidation() {
        // Debounced validation setup
        const debouncedValidation = this.debounce((input) => {           
            this.validateInput(input);           
        }, 300);

        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', () => debouncedValidation(input));
            input.addEventListener('blur', () => this.validateInput(input));
        });
    }    

    validateInput(input) {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);

        // Remove existing validation classes
        input.classList.remove('valid', 'invalid');

        // Validate range
        if (isNaN(value) || (min && value < min) || (max && value > max)) {
            input.classList.add('invalid');
            this.showValidationError(input);
        } else {
            input.classList.add('valid');
            this.hideValidationError(input);
        }
    }

    showValidationError(input) {
        const errorId = `${input.id}-error`;
        let errorElement = document.getElementById(errorId);

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = errorId;
            errorElement.className = 'validation-error';
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }

        const lang = this.appState.currentLanguage;
        const errorMessage = lang === 'ar'
            ? 'قيمة غير صحيحة'
            : 'Invalid value';

        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
    }

    hideValidationError(input) {
        const errorId = `${input.id}-error`;
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    setupNavigation() {
        // Add navigation function to global scope for backward compatibility
        window.navigate = this.navigate.bind(this);

        // Setup navigation event listeners for modern approach
        document.addEventListener('click', (e) => {
            const targetEl = e.target.closest('[data-navigate]');
            if (targetEl) {
                e.preventDefault();
                const target = targetEl.getAttribute('data-navigate');
                this.navigate(target);
            }
        });
    }

    navigate(target) {
        // Validate target to prevent XSS
        if (!/^[a-zA-Z0-9_-]+$/.test(target)) {
            console.error('Invalid navigation target');
            return;
        }

        // Save current state before navigation
        this.saveAppState();

        // Navigate to target page
        window.location.href = `Pages/${target}.html`;
    }

    setupAppInfo() {
        // Add showAppInfo function to global scope for backward compatibility
        window.showAppInfo = this.showAppInfo.bind(this);

        // Setup app info event listeners for modern approach
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-app-info')) {
                e.preventDefault();
                this.showAppInfo();
            }
        });
    }

    showAppInfo() {
        const lang = this.appState.currentLanguage;
        const message = lang === "ar"
            ? `BMToolkit الإصدار ${this.version}\n${this.author}`
            : `BMToolkit v${this.version}\n${this.author}`;
        alert(message);
    }

    focusFirstInput() {
        const firstInput = document.querySelector('input[type="number"]');
        if (firstInput) {
            // Small delay to ensure page is fully rendered
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    setupPresetRateButtons() {
        document.addEventListener('click', (e) => {
            const presetType = e.target.getAttribute('data-preset-rate');
            if (presetType) {
                e.preventDefault();
                this.setPresetRate(presetType);
            }
        });
    }

    setPresetRate(type) {
        const rate = CONFIG.PRESET_RATES[type] || 0;
        const rateInput = document.getElementById('interestRate');
        if (rateInput) {
            rateInput.value = rate;
            rateInput.dispatchEvent(new Event('input')); // Trigger validation if needed
        }
    }

    saveAppState() {
        // Save current application state to localStorage
        const state = {
            language: this.appState.currentLanguage,
            timestamp: Date.now()
        };
        localStorage.setItem('bmtoolkit-state', JSON.stringify(state));
    }

    restoreAppState() {
        // Restore application state from localStorage
        try {
            const savedState = localStorage.getItem('bmtoolkit-state');
            if (savedState) {
                const state = JSON.parse(savedState);
                if (state.language) {
                    this.appState.updateLanguage(state.language);
                    this.updateHTMLAttributes(state.language);
                }
            }
        } catch (error) {
            console.warn('Failed to restore app state:', error);
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Utility method to get current language
    getCurrentLanguage() {
        return this.appState.currentLanguage;
    }

    // Utility method to get translation
    translate(key) {
        return translate(key, this.appState.currentLanguage);
    }

    // Method to handle errors gracefully
    handleError(error, context = '') {
        console.error(`BMToolkit Error ${context}:`, error);

        const lang = this.appState.currentLanguage;
        const message = lang === 'ar'
            ? 'حدث خطأ غير متوقع'
            : 'An unexpected error occurred';
        alert(message);

    }

    setupShareButton() {
        // Setup share button event listeners
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-share-calculator') ||
                e.target.closest('[data-share-calculator]')) {
                e.preventDefault();
                this.shareCalculator();
            }
        });
    }

    async shareCalculator() {
        try {
            // Get the shareable URL with current form values
            const shareableURL = this.urlParamsManager.getShareableURL();

            // Prepare share data
            const lang = this.appState.currentLanguage;
            const shareData = {
                title: lang === 'ar' ? 'حاسبة القرض - BMToolkit' : 'Loan Calculator - BMToolkit',
                text: lang === 'ar'
                    ? 'احسب أقساط القرض والتكاليف الإجمالية باستخدام هذه الحاسبة المتقدمة'
                    : 'Calculate your loan payments and total costs with this advanced calculator',
                url: shareableURL
            };

            // Try to use Web Share API if available (mobile devices)
            if (navigator.share && this.isMobileDevice()) {
                await navigator.share(shareData);
                this.showShareSuccess('shared');
            } else {
                // Fallback to clipboard
                await this.copyToClipboard(shareableURL);
                this.showShareSuccess('copied');
            }
        } catch (error) {
            console.error('Share failed:', error);
            this.handleShareError(error);
        }
    }

    async copyToClipboard(text) {
        try {
            // Try modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                textArea.style.pointerEvents = 'none';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
        } catch (error) {
            throw new Error('Failed to copy to clipboard');
        }
    }

    showShareSuccess(type = 'copied') {
        const notification = document.getElementById('shareNotification');
        if (!notification) return;

        const lang = this.appState.currentLanguage;
        const textElement = notification.querySelector('.notification-text span');

        if (textElement) {
            const message = type === 'shared'
                ? (lang === 'ar' ? 'تم المشاركة بنجاح!' : 'Shared successfully!')
                : (lang === 'ar' ? 'تم نسخ الرابط!' : 'Link copied to clipboard!');

            textElement.textContent = message;
        }

        // Show notification
        notification.style.display = 'block';
        notification.style.animation = 'slideInRight 0.3s ease';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 3000);
    }

    handleShareError(error) {
        console.error('Share error:', error);
        const lang = this.appState.currentLanguage;
        const message = lang === 'ar'
            ? 'فشل في المشاركة. يرجى المحاولة مرة أخرى.'
            : 'Failed to share. Please try again.';

        this.showError(message);
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
    }

    // Enhanced error display method
    showError(message) {
        const errorFrame = document.getElementById('errorFrame');
        const errorMessage = document.getElementById('errorMessage');

        if (errorFrame && errorMessage) {
            errorMessage.textContent = message;
            errorFrame.style.display = 'block';

            // Auto-hide error after 5 seconds
            setTimeout(() => {
                errorFrame.style.display = 'none';
            }, 5000);
        } else {
            // Fallback to alert
            alert(message);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new BMToolkitApp();
        app.initialize();

        const bodyId = document.body.id;
        if (bodyId == 'max-loan-calculators') {
            app.uiManager.updateModeUI();
        }
        // Make app globally accessible
        window.app = app;
        globalThis.app = app;

        console.log('BMToolkit initialized successfully');
    } catch (error) {
        console.error('Failed to initialize BMToolkit:', error);
    }
});

// Export for module usage
export default BMToolkitApp;
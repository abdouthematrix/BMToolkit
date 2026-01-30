// i18n.js - Internationalization Service

export class I18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {
            en: {
                // App
                'app-name': 'BMToolkit',
                'footer-text': 'Financial Calculators for Everyone',
                'loading': 'Loading...',
                'login': 'Login',
                'logout': 'Logout',
                
                // Navigation
                'nav-home': 'Home',
                'nav-secured': 'Secured Loans',
                'nav-unsecured': 'Unsecured Loans',
                'nav-admin': 'Admin',
                
                // Home Page
                'home-title': 'Welcome to BMToolkit',
                'home-subtitle': 'Your financial calculator for smart decisions',
                'secured-loans-title': 'Secured Loans',
                'secured-loans-desc': 'Calculate loans backed by certificates of deposit',
                'unsecured-loans-title': 'Unsecured Loans',
                'unsecured-loans-desc': 'Personal loans based on income and employment',
                'get-started': 'Get Started',
                
                // Secured Loans
                'smart-investment': 'Smart Investment Tool',
                'smart-investment-desc': 'Compare 4 investment scenarios',
                'smart-optimizer': 'Smart Loan Optimizer',
                'smart-optimizer-desc': 'Find the optimal loan amount (0-90%)',
                'loan-calculator': 'Loan Calculator',
                'loan-calculator-desc': 'Calculate loan payments for multiple tenors',
                'max-loan-calc': 'Max Loan Calculator',
                'max-loan-calc-desc': 'Find maximum loan based on monthly payment',
                
                // Form Labels
                'td-amount': 'Certificate Amount',
                'cd-rate': 'Certificate Rate (%)',
                'loan-term': 'Loan Term',
                'years': 'Years',
                'months': 'Months',
                'calculate': 'Calculate',
                'reset': 'Reset',
                'principal': 'Principal Amount',
                'interest-rate': 'Interest Rate (%)',
                'monthly-income': 'Monthly Income',
                'monthly-installments': 'Current Monthly Installments',
                'max-dti': 'Max Debt-to-Income (%)',
                'start-date': 'Start Date',
                'stamp-duty-rate': 'Stamp Duty Rate (‰)',
                
                // Results
                'scenario': 'Scenario',
                'loan-amount': 'Loan Amount',
                'monthly-interest': 'Monthly Interest',
                'monthly-payment': 'Monthly Payment',
                'net-monthly': 'Net Monthly',
                'total-interest': 'Total Interest',
                'final-amount': 'Final Amount',
                'best-option': 'Best Option',
                'tenor': 'Tenor',
                'total-payment': 'Total Payment',
                'flat-rate': 'Flat Rate (%)',
                
                // Products
                'select-product': 'Select Product',
                'product': 'Product',
                'sector': 'Sector',
                'payroll': 'Payroll Type',
                'company-segment': 'Company Segment',
                
                // Admin
                'admin-panel': 'Admin Panel',
                'rates-margins': 'Rates & Margins',
                'cd-rate-label': 'CD Rate',
                'td-margin-label': 'TD Margin',
                'min-rate-label': 'Minimum Rate',
                'max-dti-label': 'Max DTI Ratio',
                'save-changes': 'Save Changes',
                'email': 'Email',
                'password': 'Password',
                
                // Messages
                'success': 'Success',
                'error': 'Error',
                'warning': 'Warning',
                'info': 'Information',
                'login-success': 'Login successful',
                'logout-success': 'Logout successful',
                'save-success': 'Changes saved successfully',
                'invalid-input': 'Please check your inputs',
                'auth-required': 'Authentication required'
            },
            ar: {
                // App
                'app-name': 'BMToolkit',
                'footer-text': 'حاسبات مالية للجميع',
                'loading': 'جاري التحميل...',
                'login': 'تسجيل الدخول',
                'logout': 'تسجيل الخروج',
                
                // Navigation
                'nav-home': 'الرئيسية',
                'nav-secured': 'قروض مضمونة',
                'nav-unsecured': 'قروض نقدية',
                'nav-admin': 'لوحة التحكم',
                
                // Home Page
                'home-title': 'مرحباً بك في BMToolkit',
                'home-subtitle': 'الحاسبة المالية لقرارات ذكية',
                'secured-loans-title': 'القروض المضمونة',
                'secured-loans-desc': 'احسب القروض المضمونة بشهادات الادخار',
                'unsecured-loans-title': 'القروض النقدية',
                'unsecured-loans-desc': 'قروض شخصية بناءً على الدخل والوظيفة',
                'get-started': 'ابدأ الآن',
                
                // Secured Loans
                'smart-investment': 'أداة الاستثمار الذكي',
                'smart-investment-desc': 'قارن بين 4 سيناريوهات استثمارية',
                'smart-optimizer': 'محسن القرض الذكي',
                'smart-optimizer-desc': 'ابحث عن المبلغ الأمثل للقرض (0-90%)',
                'loan-calculator': 'حاسبة القروض',
                'loan-calculator-desc': 'احسب الأقساط الشهرية لعدة فترات',
                'max-loan-calc': 'حاسبة الحد الأقصى',
                'max-loan-calc-desc': 'ابحث عن أقصى قرض حسب القسط الشهري',
                
                // Form Labels
                'td-amount': 'مبلغ الشهادة',
                'cd-rate': 'عائد الشهادة (%)',
                'loan-term': 'مدة القرض',
                'years': 'سنوات',
                'months': 'أشهر',
                'calculate': 'احسب',
                'reset': 'إعادة تعيين',
                'principal': 'مبلغ القرض',
                'interest-rate': 'سعر الفائدة (%)',
                'monthly-income': 'الدخل الشهري',
                'monthly-installments': 'الأقساط الشهرية الحالية',
                'max-dti': 'الحد الأقصى للديون (%)',
                'start-date': 'تاريخ البدء',
                'stamp-duty-rate': 'رسم الدمغة (‰)',
                
                // Results
                'scenario': 'السيناريو',
                'loan-amount': 'مبلغ القرض',
                'monthly-interest': 'الفائدة الشهرية',
                'monthly-payment': 'القسط الشهري',
                'net-monthly': 'الصافي الشهري',
                'total-interest': 'إجمالي الفائدة',
                'final-amount': 'المبلغ النهائي',
                'best-option': 'الخيار الأفضل',
                'tenor': 'المدة',
                'total-payment': 'إجمالي السداد',
                'flat-rate': 'المعدل المسطح (%)',
                
                // Products
                'select-product': 'اختر المنتج',
                'product': 'المنتج',
                'sector': 'القطاع',
                'payroll': 'نوع كشف المرتب',
                'company-segment': 'تصنيف الشركة',
                
                // Admin
                'admin-panel': 'لوحة التحكم',
                'rates-margins': 'المعدلات والهوامش',
                'cd-rate-label': 'عائد الشهادة',
                'td-margin-label': 'هامش الشهادة',
                'min-rate-label': 'الحد الأدنى للفائدة',
                'max-dti-label': 'نسبة الديون القصوى',
                'save-changes': 'حفظ التغييرات',
                'email': 'البريد الإلكتروني',
                'password': 'كلمة المرور',
                
                // Messages
                'success': 'نجح',
                'error': 'خطأ',
                'warning': 'تحذير',
                'info': 'معلومة',
                'login-success': 'تم تسجيل الدخول بنجاح',
                'logout-success': 'تم تسجيل الخروج بنجاح',
                'save-success': 'تم حفظ التغييرات بنجاح',
                'invalid-input': 'يرجى التحقق من المدخلات',
                'auth-required': 'يجب تسجيل الدخول'
            }
        };
    }

    // Get translation
    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    // Set language
    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        this.updatePageText();
    }

    // Toggle language
    toggleLanguage() {
        const newLang = this.currentLanguage === 'en' ? 'ar' : 'en';
        this.setLanguage(newLang);
        return newLang;
    }

    // Update all text on page
    updatePageText() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // Update language toggle button text
        const langText = document.getElementById('lang-text');
        if (langText) {
            langText.textContent = this.currentLanguage === 'en' ? 'AR' : 'EN';
        }
    }

    // Initialize
    init() {
        this.setLanguage(this.currentLanguage);
    }

    // Format currency
    formatCurrency(amount, currency = 'EGP') {
        const formatter = new Intl.NumberFormat(this.currentLanguage === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
        return formatter.format(amount);
    }

    // Format number
    formatNumber(number, decimals = 2) {
        const formatter = new Intl.NumberFormat(this.currentLanguage === 'ar' ? 'ar-EG' : 'en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
        return formatter.format(number);
    }

    // Format percentage
    formatPercent(value, decimals = 2) {
        return this.formatNumber(value, decimals) + '%';
    }
}

export const i18n = new I18n();

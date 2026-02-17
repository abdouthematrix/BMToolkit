// i18n.js - Internationalization Service

export class I18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {
            en: {
                // App
                'app-name': 'BMToolkit',
                'footer-text': 'Smart Financial Tools',
                'loading': 'Crunching numbers...',
                'login': 'Sign In',
                'logout': 'Sign Out',
                'login-panel-desc': 'Access admin controls for rates and products',

                // Navigation
                'nav-home': 'Home',
                'nav-loans': 'Loans',
                'nav-credit-cards': 'Credit Cards',
                'nav-secured': 'Secured Loans (CDs)',
                'nav-unsecured': 'Cash Loans',
                'nav-advancedtools': 'Advanced Tools',
                'nav-admin': 'Settings',

                // Home Page
                'home-title': 'Welcome to BMToolkit',
                'home-subtitle': 'Empowering your financial decisions with precision',
                'secured-loans-title': 'Secured Loans',
                'secured-loans-desc': 'Leverage your Certificates of Deposit (CDs) for funding',
                'unsecured-loans-title': 'Cash Loans',
                'unsecured-loans-desc': 'Personal finance solutions based on your income',
                'get-started': 'Start Calculation',
                'salary-transfer-loans': 'Salary Transfer',
                'income-proof-loans': 'Income Proof',
                'business-owner-loans': 'Business Owners',
                'pension-loans': 'Pensioners',
                'loans-title': 'Loans',
                'loans-desc': 'All loan products and calculators in one place',
                'credit-cards-title': 'Credit Cards',
                'credit-cards-desc': 'Transactions installment calculator for credit cards',
                'cc-installment-calculator': 'Transactions Installment for Credit Cards',
                'cc-installment-range': 'Installment period from 3 to 36 months',

                // Secured Loans
                'smart-investment': 'Investment Comparator',
                'smart-investment-desc': 'Analyze 4 different investment scenarios side-by-side',
                'smart-optimizer': 'Loan Optimizer',
                'smart-optimizer-desc': 'Discover the perfect loan-to-value ratio (0-90%)',
                'loan-calculator': 'Repayment Calculator',
                'loan-calculator-desc': 'Estimate your monthly installments over time',
                'max-loan-calc': 'Borrowing Limit',
                'max-loan-calc-desc': 'How much can you borrow based on what you can pay?',
                'td-secured-loan-calculator': 'TD Secured Loan Calculator',
                'td-secured-loan-desc': 'Calculate loan results using the highest TD rate from all your term deposits.',
                'td-list-label': 'Term Deposits (Amount & Rate)',
                'add-td': 'Add TD',
                'find-optimal': 'Find Best Option',
                'td-interest-details': 'Term Deposit Interest Details',
                'interest-type': 'Interest Type',
                'periodic-interest-amount': 'Periodic Interest Amount',
                'total-td-interest-period': 'Total TD Interest (per installment period)',
                'all-loan-results': 'All Loan Results',
                'paid-amount': 'Paid Amount',
                'td-loan-rate-summary': 'TD-Based Loan Rate Summary',
                'highest-td-rate': 'Highest TD Rate',
                'calculated-loan-rate': 'Calculated Loan Rate',
                'reinvest-loan-into-td': 'Reinvest Loan into TD',
                'yes': 'Yes',
                'no': 'No',

                // Unsecured Loans
                'max-loan-by-income': 'Limit by Salary',
                'max-loan-by-income-desc': 'Check your maximum loan limit based on monthly income',
                'max-loan-by-installment': 'Limit by Installment',
                'max-loan-by-installment-desc': 'Check loan limit based on a specific monthly payment',
                'loan-schedule': 'Payment Schedule',
                'loan-schedule-desc': 'View your complete repayment timeline',

                // advancedtools
                'advancedtools-title': 'Advanced Tools',
                'advancedtools-desc': 'Deep-dive calculations for specialized scenarios',
                'first-month-interest': 'Broken Period Interest',
                'first-month-interest-desc': 'Calculate interest for the partial first month',
                'amortization-schedule': 'Full Amortization',
                'amortization-schedule-desc': 'Complete breakdown including stamp duties',
                'first-month-calculation': 'Initial Payment Breakdown',
                'first-payment-message': 'Your very first payment will be {payment}. This includes {interest} in extra interest covering the {days} days before your regular schedule starts.',
                'stamp-duty-message': 'Government Stamp Duty is applied quarterly (every 3 months) on your remaining balance at {rate}‰.',

                // Form Labels
                'td-amount': 'Certificate Value',
                'cd-rate': 'Certificate Return Rate (%)',
                'loan-term': 'Duration',
                'loan-term-years': 'Duration (Years)',
                'loan-term-months': 'Duration (Months)',
                'years': 'Years',
                'months': 'Months',
                'monthly': 'Monthly',
                'quarterly': 'Quarterly',
                'installment-frequency': 'Installment Frequency',
                'calculate': 'Calculate Results',
                'reset': 'Clear Form',
                'principal': 'Loan Amount',
                'interest-rate': 'Interest Rate (%)',
                'annual-interest-rate': 'Annual Rate (%)',
                'monthly-income': 'Total Monthly Income',
                'monthly-installments': 'Existing Monthly Obligations',
                'max-dti': 'Max Debt Burden Ratio (%)',
                'start-date': 'Start Date',
                'loan-start-date': 'Loan Booking Date',
                'stamp-duty-rate': 'Stamp Duty Rate (‰)',
                'tenor-range': 'Duration Range',
                'min-tenor': 'Min',
                'max-tenor': 'Max',
                'monthly-payment-amount': 'Desired Monthly Payment',
                'transaction-amount': 'Transaction Amount (EGP)',
                'cc-card-type': 'Credit Card Type',
                'cc-installment-type': 'Installment Type',
                'cc-installment-period': 'Installment Period',
                'monthly-installment': 'Monthly Installment',
                'months-vs-years': 'Duration in Months (default is Years)',

                // Results
                'scenario': 'Option',
                'loan-amount': 'Loan Principal',
                'monthly-interest': 'Est. Monthly Interest',
                'monthly-payment': 'Monthly Installment',
                'quarterly-installment': 'Quarterly Installment',
                'net-monthly': 'Net Monthly Profit',
                'total-interest': 'Total Interest Cost',
                'loan-interest': 'Loan Interest Cost',
                'final-amount': 'Maturity Value',
                'best-option': '⭐ Best Value',
                'tenor': 'Duration',
                'total-payment': 'Total Repayment',
                'flat-rate': 'Fixed Rate Equivalent (%)',
                'max-loan': 'Max Borrowing Limit',
                'available-monthly': 'Available for Installment',
                'results': 'Your Results',
                'detailed-results': 'Detailed Breakdown',
                'summary': 'Quick Summary',
                'payment-schedule': 'Repayment Schedule',
                'regular-monthly-payment': 'Standard Monthly Payment',
                'total-stamp-duty': 'Total Stamp Duty Fees',
                'first-payment-date': 'First Payment Date',
                'days-between': 'Days until First Payment',
                'calculation-days': 'Interest Days',
                'first-month-interest-amount': 'Initial Partial Interest',
                'total-first-payment': 'Total First Payment',
                'payment-date': 'Due Date',
                'interest': 'Interest Portion',
                'stamp-duty': 'Stamp Duty',
                'remaining-balance': 'Outstanding Balance',
                'payment-number': '#',
                'interest-payment': 'Interest',
                'principal-payment': 'Principal',
                'monthly-income-amount': 'Monthly Income',
                'net-monthly-profit': 'Net Monthly Income',
                'grand-total': 'Total Return',
                'investment-scenarios': 'Investment Comparison',
                'maximum-loan-amounts': 'Maximum Loan Amounts',
                'optimalLoanConfig': "Recommended Setup",
                'optimalLoanAmount': "Recommended Loan:",
                'monthlyNetProfit': 'Monthly Net Gain:',
                'grandTotal': 'Total Project Value:',

                // Products
                'select-product': 'Choose a Loan Product',
                'select-product-placeholder': 'Select product...',
                'product': 'Product',
                'sector': 'Sector',
                'payroll': 'Payroll Type',
                'company-segment': 'Company Tier',
                'all': 'All',
                'government-public': 'Government / Public',
                'private': 'Private Sector',
                'not-specified': 'General',
                'contracted': 'Contracted Entity',
                'non-contracted': 'Non-Contracted',
                'product-info': 'Product Details',
                'quick-search': 'Quick Search',
                'quick-search-placeholder': 'Search by product name or UBS code',
                'recent-searches': 'Recent searches:',
                'clear-search': 'Clear',
                'clear-recent-searches': 'Clear recent',

                // Admin
                'admin-panel': 'System Settings',
                'admin-desc': 'Configure global rates and calculation constants',
                'rates-margins': 'Rates & Margins',
                'secured-loans-constants': 'Secured Loan Settings',
                'unsecured-loans-constants': 'Cash Loan Settings',
                'scenario-constants': 'Smart Investment Tool',
                'cc-constants-admin': 'Credit Cards Settings',
                'cc-staff-rate-admin': 'Staff Monthly Rate (%)',
                'cc-regular-rates-admin': 'Regular Monthly Rates (%)',
                'cc-admin-fees-admin': 'Administrative Fees (%)',
                'interest-upfront-label': 'Interest Upfront (%)',
                'loan-certificate-label': 'Loan Certificat (%)',
                'cd-rate-label': 'Base CD Rate (%)',
                'td-margin-label': 'Bank Margin (%)',
                'min-rate-label': 'Minimum Interest Floor (%)',
                'max-dti-label': 'Max DTI Cap (%)',
                'max-loan-percent': 'Loan-to-Value Cap (%)',
                'secured-min-tenor-months': 'Min Tenor (Months)',
                'secured-max-tenor-years': 'Max Tenor (Years)',
                'unsecured-max-tenor-8plus': 'Max Tenor for Rate8+ (Years)',
                'stamp-duty-help': 'Display in per mille (‰). 0.5 = 0.5‰ = 0.0005 ratio',
                'save-changes': 'Update Settings',
                'reset-defaults': 'Restore Defaults',
                'email': 'Email Address',
                'password': 'Password',
                'unsecured-products': 'Product Catalog',
                'import-csv': 'Import from CSV',
                'add-product': 'Create New Product',
                'edit-product': 'Edit',
                'delete-product': 'Remove',
                'product-name-ar': 'Name (Arabic)',
                'product-name-en': 'Name (English)',
                'ubs-code': 'System Code (UBS)',
                'rate-1-5': 'Rate (1-5 Yrs)',
                'rate-5-8': 'Rate (5-8 Yrs)',
                'rate-8-plus': 'Rate (8+ Yrs)',
                'save-product': 'Save Product',
                'cancel': 'Cancel',
                'actions': 'Actions',
                'status': 'Status',
                'active': 'Active',
                'inactive': 'Inactive',
                'product-id': 'Product ID',
                'rate-rules-title': 'Rate Rules:',
                'rate-rule-1': 'If Rate 8+ exists, Rate 5-8 must exist',
                'rate-rule-2': 'If Rate 5-8 exists, Rate 1-5 must exist',
                'rate-rule-3': 'Rates can be entered as "22.75" or "22.75%"',

                // Messages
                'success': 'Done',
                'error': 'Error',
                'warning': 'Notice',
                'info': 'Tip',
                'login-success': 'Welcome back!',
                'logout-success': 'Signed out successfully',
                'save-success': 'Settings updated successfully',
                'invalid-input': 'Please check highlighted fields',
                'cc-cash-min-note': 'Minimum transaction is 1,000 EGP.',
                'cc-cash-min-validation': 'Cash installment requires a minimum transaction of 1,000 EGP.',
                'cc-interest-rates-title': 'Monthly Interest Rates',
                'cc-installment-calculator-simple': 'Credit Card Installment Rates Summary',
                'cc-regular-rate': 'Regular Rate (Monthly)',
                'cc-staff-rate': 'Staff Rate (Monthly)',
                'cc-admin-fee': 'Admin Fee (One-time)',
                'cc-regular-monthly': 'Regular Monthly Installment',
                'cc-staff-monthly': 'Staff Monthly Installment',
                'cc-regular-total-fees': 'Regular Total + Fee',
                'cc-staff-total-fees': 'Staff Total + Fee',
                'cc-rates-note': 'Regular rates range from 2.56% to 2.81% monthly, staff rate is 2.25% monthly, and admin fees apply once at installment start.',
                'cc-tab-installment': 'Installment',
                'cc-tab-admin-fees': 'Admin Fees',
                'cc-staff-mode': 'Staff Mode',
                'cc-staff-mode-note': 'Staff',
                'cc-active-rate': 'Active Rate',
                'cc-total-with-interest': 'Total Amount with Interest',
                'cc-flat-equivalent': 'Approx. Annual Flat Rate',
                'cc-admin-fee-amount': 'Admin Fee Amount',
                'cc-installment-no-interest': 'Installment Amount (No Interest)',
                'cc-total-with-admin': 'Total Amount with Admin Fee',
                'cc-metric': 'Metric',
                'auth-required': 'Please log in first',
                'select-product-first': 'Please select a loan product to continue',
                'max-tenor-capped': 'Max tenor capped at {years} years for this product',
                'min-tenor-exceeds-max': 'Min tenor cannot exceed max tenor',
                'payment-capacity-zero': 'Payment capacity is negative or zero',
                'login-failed': 'Incorrect credentials',
                'product-updated': 'Product updated',
                'product-added': 'New product added',
                'product-deleted': 'Product removed',
                'save-failed': 'Could not save changes',
                'delete-failed': 'Could not delete product',
                'constants-reset': 'System defaults restored',
                'reset-failed': 'Restore failed',
                'import-success': 'Products imported successfully',
                'import-failed': 'Import failed',
                'invalid-csv': 'Invalid CSV file format',
                'no-products-found': 'No readable product data found',
                'delete-confirm': 'Delete this product? This cannot be undone.',
                'import-confirm': 'Importing will append these to your existing list. Continue?',
                'reset-constants-confirm': 'Are you sure you want to reset all constants to default values?',
                'delete-product-confirm': 'Are you sure you want to delete this product? This action cannot be undone.',
                'csv-import-confirm': 'Import {count} products from CSV? Existing products with the same ID will be updated.',
                'importing-products': 'Importing products...',
                'csv-import-success': 'Successfully imported {count} products',
                'csv-import-partial': 'Imported {success} products, {failed} failed.',
                'check-console': 'Check console for details.',

                // Info Messages
                'important-note': 'Please Note',
                'admin-warning': '⚠️ Changes here affect calculations for all users immediately.',
                'advancedtools-info': 'Need detailed schedules?',
                'advancedtools-link': 'Check the Advanced Tools section.',
                'advancedtools-link-secured': 'Check Advanced Tools for detailed amortization schedules.',
                'first-month-how-it-works': 'Understanding the First Payment:',
                'first-month-explanation': 'If your loan starts mid-month, the first payment is higher because it covers the extra days before your regular billing cycle begins.',
                'stamp-duty-info': 'About Stamp Duty:',
                'stamp-duty-explanation': 'A government fee charged every quarter (Mar, Jun, Sep, Dec) based on your loan balance.',
                'stamp-duty-note': 'Stamp Duty:',
                'stamp-duty-note-detail': 'Highlighted rows indicate months where quarterly Stamp Duty is collected.',
                'first-payment-note': 'Note:',
                'back-to-home': 'Return Home',
                'use-calculators': 'Empower your financial planning with our precision calculators.',

                // Table Headers
                'table-number': '#',
                'no-products': 'No products found in catalog',

                // Tabs
                'tab-by-income': 'By Salary',
                'tab-by-installment': 'By Installment',
                'tab-loan-schedule': 'Calculator',
                'tab-smart-investment': 'Investment Tool',
                'tab-smart-optimizer': 'Loan Optimizer',
                'tab-td-secured-loan': 'TD Secured Loan',
                'tab-loan-calculator': 'Loan Calc',
                'tab-max-loan': 'Loan Limit',
                'tab-first-month': 'First Month',
                'tab-amortization': 'Amortization',

                // Share
                'share-btn-title': 'Share this page',
                'share-text': 'Check out BMToolkit – smart financial calculators for loans and investments.',
                'share-copied': 'Link copied to clipboard!',
                'share-failed': 'Could not copy link',
                'share-copy-prompt': 'Copy this link:'
            },
            ar: {
                // App
                'app-name': 'BMToolkit',
                'footer-text': 'أدواتك المالية الذكية',
                'loading': 'جاري المعالجة...',
                'login': 'دخول',
                'logout': 'خروج',
                'login-panel-desc': 'لوحة الإدارة للتحكم في الأسعار والمنتجات',

                // Navigation
                'nav-home': 'الرئيسية',
                'nav-loans': 'القروض',
                'nav-credit-cards': 'بطاقات الائتمان',
                'nav-secured': 'قروض بضمان (شهادات)',
                'nav-unsecured': 'القروض النقدية',
                'nav-advancedtools': 'أدوات متقدمة',
                'nav-admin': 'الإعدادات',

                // Home Page
                'home-title': 'مرحباً بك في BMToolkit',
                'home-subtitle': 'قراراتك المالية.. بدقة وذكاء',
                'secured-loans-title': 'قروض بضمان أوعية',
                'secured-loans-desc': 'احصل على تمويل بضمان مدخراتك وشهاداتك',
                'unsecured-loans-title': 'القروض النقدية',
                'unsecured-loans-desc': 'تمويل شخصي يناسب دخلك واحتياجاتك',
                'get-started': 'ابدأ الحساب',
                'salary-transfer-loans': 'بضمان المرتب',
                'income-proof-loans': 'بإثبات الدخل',
                'business-owner-loans': 'أصحاب الأعمال',
                'pension-loans': 'أصحاب المعاشات',
                'loans-title': 'القروض',
                'loans-desc': 'كل منتجات وحاسبات القروض في مكان واحد',
                'credit-cards-title': 'بطاقات الائتمان',
                'credit-cards-desc': 'حاسبة تقسيط معاملات بطاقات الائتمان',
                'cc-installment-calculator': 'تقسيط معاملات بطاقات الائتمان',
                'cc-installment-range': 'فترة التقسيط من 3 إلى 36 شهرًا',

                // Secured Loans
                'smart-investment': 'مقارنة الاستثمار',
                'smart-investment-desc': 'قارن بين 4 سيناريوهات لاستثمار أموالك',
                'smart-optimizer': 'محسّن القروض',
                'smart-optimizer-desc': 'اعرف النسبة الأفضل للاقتراض (0-90%)',
                'loan-calculator': 'حاسبة الأقساط',
                'loan-calculator-desc': 'جدول الأقساط المتوقعة على مدار الفترة',
                'max-loan-calc': 'حد الاقتراض',
                'max-loan-calc-desc': 'ما هو أقصى مبلغ يمكنك اقتراضه؟',
                'td-secured-loan-calculator': 'حاسبة القرض بضمان الودائع',
                'td-secured-loan-desc': 'احسب نتائج القرض باستخدام أعلى معدل وديعة من جميع ودائعك.',
                'td-list-label': 'الودائع لأجل (المبلغ والعائد)',
                'add-td': 'إضافة وديعة',
                'find-optimal': 'أظهر الخيار الأفضل',
                'td-interest-details': 'تفاصيل فائدة الودائع',
                'interest-type': 'نوع الفائدة',
                'periodic-interest-amount': 'مبلغ الفائدة الدورية',
                'total-td-interest-period': 'إجمالي فائدة الودائع (لكل فترة قسط)',
                'all-loan-results': 'جميع نتائج القرض',
                'paid-amount': 'المبلغ المدفوع',
                'td-loan-rate-summary': 'ملخص معدل القرض المبني على الودائع',
                'highest-td-rate': 'أعلى معدل وديعة',
                'calculated-loan-rate': 'معدل القرض المحسوب',
                'reinvest-loan-into-td': 'إعادة استثمار مبلغ القرض في وديعة',
                'yes': 'نعم',
                'no': 'لا',

                // Unsecured Loans
                'max-loan-by-income': 'حساب الحد الأقصى بالراتب',
                'max-loan-by-income-desc': 'اعرف أقصى قرض متاح بناءً على دخلك',
                'max-loan-by-installment': 'حساب الحد الأقصى بالقسط',
                'max-loan-by-installment-desc': 'اعرف القرض المتاح بناءً على قسط محدد',
                'loan-schedule': 'جدول السداد',
                'loan-schedule-desc': 'عرض تفصيلي لتواريخ وقيم الدفعات',

                // advancedtools
                'advancedtools-title': 'أدوات متقدمة',
                'advancedtools-desc': 'حسابات دقيقة للسيناريوهات المعقدة',
                'first-month-interest': 'فائدة كسر الشهر',
                'first-month-interest-desc': 'حساب الفائدة عن الأيام الأولى قبل انتظام الجدول',
                'amortization-schedule': 'جدول الاستهلاك الكامل',
                'amortization-schedule-desc': 'تفصيل كامل يشمل رسوم الدمغة الحكومية',
                'first-month-calculation': 'تفاصيل الدفعة الأولى',
                'first-payment-message': 'قيمة أول قسط ستكون {payment}، وهي تشمل {interest} كفائدة إضافية عن {days} يوماً قبل بدء جدول السداد المنتظم.',
                'stamp-duty-message': 'يتم تحصيل رسوم الدمغة ربع سنوياً على الرصيد المتبقي بنسبة {rate}‰.',

                // Form Labels
                'td-amount': 'قيمة الشهادة',
                'cd-rate': 'عائد الشهادة (%)',
                'loan-term': 'المدة',
                'loan-term-years': 'المدة (سنوات)',
                'loan-term-months': 'المدة (شهور)',
                'years': 'سنوات',
                'months': 'شهور',
                'monthly': 'شهري',
                'quarterly': 'ربع سنوي',
                'installment-frequency': 'دورية القسط',
                'calculate': 'عرض النتائج',
                'reset': 'مسح البيانات',
                'principal': 'قيمة القرض',
                'interest-rate': 'سعر الفائدة (%)',
                'annual-interest-rate': 'الفائدة السنوية (%)',
                'monthly-income': 'إجمالي الدخل الشهري',
                'monthly-installments': 'الالتزامات الشهرية الحالية',
                'max-dti': 'أقصى عبء دين (DTI) %',
                'start-date': 'تاريخ البداية',
                'loan-start-date': 'تاريخ منح القرض',
                'stamp-duty-rate': 'نسبة الدمغة (‰)',
                'tenor-range': 'نطاق المدة',
                'min-tenor': 'أقل مدة',
                'max-tenor': 'أقصى مدة',
                'monthly-payment-amount': 'القسط الشهري المرغوب',
                'transaction-amount': 'قيمة المعاملة (جنيه)',
                'cc-card-type': 'نوع بطاقة الائتمان',
                'cc-installment-type': 'نوع التقسيط',
                'cc-installment-period': 'فترة التقسيط',
                'monthly-installment': 'القسط الشهري',
                'months-vs-years': 'المدة بالشهور (بدلاً من السنوات)',

                // Results
                'scenario': 'الخيار',
                'loan-amount': 'أصل القرض',
                'monthly-interest': 'فائدة الشهر التقريبية',
                'monthly-payment': 'القسط الشهري',
                'quarterly-installment': 'القسط الربع سنوي',
                'net-monthly': 'صافي الربح الشهري',
                'total-interest': 'إجمالي تكلفة الفائدة',
                'loan-interest': 'فوائد القرض',
                'final-amount': 'القيمة عند الاستحقاق',
                'best-option': '⭐ الخيار الأفضل',
                'tenor': 'المدة',
                'total-payment': 'إجمالي المدفوعات',
                'flat-rate': 'ما يعادل فائدة ثابتة (%)',
                'max-loan': 'الحد الأقصى للتمويل',
                'available-monthly': 'الجزء المتاح للقسط',
                'results': 'النتائج',
                'detailed-results': 'تفاصيل النتائج',
                'summary': 'ملخص سريع',
                'payment-schedule': 'جدول السداد',
                'regular-monthly-payment': 'القسط الشهري المعتاد',
                'total-stamp-duty': 'إجمالي رسوم الدمغة',
                'first-payment-date': 'تاريخ أول قسط',
                'days-between': 'أيام فترة السماح الأولى',
                'calculation-days': 'عدد أيام الفائدة',
                'first-month-interest-amount': 'فائدة الفترة الأولى',
                'total-first-payment': 'إجمالي القسط الأول',
                'payment-date': 'تاريخ الاستحقاق',
                'interest': 'جزء الفائدة',
                'stamp-duty': 'الدمغة',
                'remaining-balance': 'الرصيد القائم',
                'payment-number': 'م',
                'interest-payment': 'فائدة',
                'principal-payment': 'أصل',
                'monthly-income-amount': 'الدخل الشهري',
                'net-monthly-profit': 'صافي العائد الشهري',
                'grand-total': 'الإجمالي الكلي',
                'investment-scenarios': 'مقارنة الفرص الاستثمارية',
                'maximum-loan-amounts': 'الحدود القصوى للتمويل',
                'optimalLoanConfig': "التكوين المقترح",
                'optimalLoanAmount': "القرض المقترح:",
                'monthlyNetProfit': 'صافي الربح:',
                'grandTotal': 'إجمالي العائد:',

                // Products
                'select-product': 'اختر نوع القرض',
                'select-product-placeholder': 'اختر المنتج...',
                'product': 'المنتج',
                'sector': 'القطاع',
                'payroll': 'نوع تحويل الراتب',
                'company-segment': 'تصنيف الشركة',
                'all': 'الكل',
                'government-public': 'حكومي / عام',
                'private': 'قطاع خاص',
                'not-specified': 'غير محدد',
                'contracted': 'جهات متعاقدة',
                'non-contracted': 'غير متعاقدة',
                'product-info': 'تفاصيل المنتج',
                'quick-search': 'بحث سريع',
                'quick-search-placeholder': 'ابحث باسم المنتج أو كود UBS',
                'recent-searches': 'آخر عمليات البحث:',
                'clear-search': 'مسح',
                'clear-recent-searches': 'مسح آخر عمليات البحث',

                // Admin
                'admin-panel': 'إعدادات النظام',
                'admin-desc': 'التحكم في أسعار الفائدة وثوابت الحسابات',
                'rates-margins': 'الهوامش والأسعار',
                'secured-loans-constants': 'إعدادات القروض المضمونة',
                'unsecured-loans-constants': 'إعدادات القروض النقدية',
                'scenario-constants': 'ثوابت أداة الاستثمار الذكي',
                'cc-constants-admin': 'إعدادات بطاقات الائتمان',
                'cc-staff-rate-admin': 'سعر الموظفين الشهري (%)',
                'cc-regular-rates-admin': 'الأسعار الشهرية للعملاء العاديين (%)',
                'cc-admin-fees-admin': 'المصاريف الإدارية (%)',
                'interest-upfront-label': 'الفائدة مقدماً (%)',
                'loan-certificate-label': 'شهادة وقرض (%)',

                'cd-rate-label': 'سعر الكوريدور/الشهادة (%)',
                'td-margin-label': 'هامش البنك (%)',
                'min-rate-label': 'الحد الأدنى للفائدة (%)',
                'max-dti-label': 'سقف عبء الدين (DTI) %',
                'max-loan-percent': 'نسبة التسليف (%)',
                'secured-min-tenor-months': 'الحد الأدنى للمدة (شهور)',
                'secured-max-tenor-years': 'الحد الأقصى للمدة (سنوات)',
                'unsecured-max-tenor-8plus': 'الحد الأقصى لمدة الفائدة 8+ (سنوات)',
                'stamp-duty-help': 'القيمة بالألف (‰). مثال: 0.5 = 0.5‰ = 0.0005 نسبة',
                'save-changes': 'حفظ التعديلات',
                'reset-defaults': 'استعادة الافتراضي',
                'email': 'البريد الإلكتروني',
                'password': 'كلمة المرور',
                'unsecured-products': 'كتالوج المنتجات',
                'import-csv': 'استيراد ملف CSV',
                'add-product': 'إضافة منتج جديد',
                'edit-product': 'تعديل',
                'delete-product': 'حذف',
                'product-name-ar': 'اسم المنتج (عربي)',
                'product-name-en': 'اسم المنتج (إنجليزي)',
                'ubs-code': 'كود النظام (UBS)',
                'rate-1-5': 'فائدة (1-5 سنوات)',
                'rate-5-8': 'فائدة (5-8 سنوات)',
                'rate-8-plus': 'فائدة (8+ سنوات)',
                'save-product': 'حفظ البيانات',
                'cancel': 'إلغاء',
                'actions': 'إجراءات',
                'status': 'الحالة',
                'active': 'نشط',
                'inactive': 'غير نشط',
                'product-id': 'رقم المنتج',
                'rate-rules-title': 'قواعد أسعار الفائدة:',
                'rate-rule-1': 'إذا كان معدل 8+ موجوداً، يجب أن يكون معدل 5-8 موجوداً',
                'rate-rule-2': 'إذا كان معدل 5-8 موجوداً، يجب أن يكون معدل 1-5 موجوداً',
                'rate-rule-3': 'يمكن إدخال الأسعار كـ "22.75" أو "22.75%"',

                // Messages
                'success': 'تم بنجاح',
                'error': 'خطأ',
                'warning': 'تنبيه',
                'info': 'معلومة',
                'login-success': 'مرحباً بعودتك',
                'logout-success': 'تم الخروج بنجاح',
                'save-success': 'تم تحديث الإعدادات',
                'invalid-input': 'يرجى مراجعة الحقول المميزة',
                'cc-cash-min-note': 'الحد الأدنى للمعاملة 1000 جنيه.',
                'cc-cash-min-validation': 'تقسيط السحب النقدي يتطلب حد أدنى 1000 جنيه للمعاملة.',
                'cc-interest-rates-title': 'أسعار الفائدة الشهرية',
                'cc-installment-calculator-simple': 'ملخص أسعار تقسيط بطاقات الائتمان',
                'cc-regular-rate': 'سعر العميل العادي (شهري)',
                'cc-staff-rate': 'سعر الموظفين (شهري)',
                'cc-admin-fee': 'المصروفات الإدارية (مرة واحدة)',
                'cc-regular-monthly': 'القسط الشهري - عادي',
                'cc-staff-monthly': 'القسط الشهري - موظفين',
                'cc-regular-total-fees': 'الإجمالي - عادي + مصروفات',
                'cc-staff-total-fees': 'الإجمالي - موظفين + مصروفات',
                'cc-rates-note': 'أسعار العملاء العاديين من 2.56% إلى 2.81% شهريًا، وسعر الموظفين 2.25% شهريًا، وتُطبق المصروفات الإدارية مرة واحدة عند بداية التقسيط.',
                'cc-tab-installment': 'التقسيط',
                'cc-tab-admin-fees': 'المصاريف الإدارية',
                'cc-staff-mode': 'وضع الموظفين',
                'cc-staff-mode-note': 'موظف ',
                'cc-active-rate': 'السعر المستخدم',
                'cc-total-with-interest': 'إجمالي المبلغ بالفوائد',
                'cc-flat-equivalent': 'العائد الثابت السنوي التقريبي',
                'cc-admin-fee-amount': 'قيمة المصروفات الإدارية',
                'cc-installment-no-interest': 'قيمة القسط (بدون فوائد)',
                'cc-total-with-admin': 'إجمالي المبلغ بالمصاريف الإدارية',
                'cc-metric': 'البند',
                'auth-required': 'يجب تسجيل الدخول أولاً',
                'select-product-first': 'يرجى اختيار نوع القرض للمتابعة',
                'max-tenor-capped': 'تم تقليص الحد الأقصى للمدة إلى {years} سنوات لهذا المنتج',
                'min-tenor-exceeds-max': 'لا يمكن أن تتجاوز الحد الأدنى للمدة الحد الأقصى',
                'payment-capacity-zero': 'القدرة على السداد صفر أو سالبة',
                'login-failed': 'بيانات الدخول غير صحيحة',
                'product-updated': 'تم تحديث المنتج',
                'product-added': 'تم إضافة المنتج',
                'product-deleted': 'تم حذف المنتج',
                'save-failed': 'لم يتم الحفظ',
                'delete-failed': 'لم يتم الحذف',
                'constants-reset': 'تمت استعادة إعدادات النظام الأصلية',
                'reset-failed': 'فشلت العملية',
                'import-success': 'تم استيراد المنتجات',
                'import-failed': 'فشل الاستيراد',
                'invalid-csv': 'صيغة الملف غير صحيحة',
                'no-products-found': 'لم يتم العثور على بيانات في الملف',
                'delete-confirm': 'هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.',
                'import-confirm': 'سيتم إضافة هذه المنتجات للقائمة الحالية. استمرار؟',
                'reset-constants-confirm': 'هل أنت متأكد من استعادة جميع الإعدادات إلى القيم الافتراضية؟',
                'delete-product-confirm': 'هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.',
                'csv-import-confirm': 'استيراد {count} منتج من ملف CSV؟ سيتم تحديث المنتجات الموجودة بنفس الرقم.',
                'importing-products': 'جاري استيراد المنتجات...',
                'csv-import-success': 'تم استيراد {count} منتج بنجاح',
                'csv-import-partial': 'تم استيراد {success} منتج، فشل {failed}.',
                'check-console': 'راجع وحدة التحكم للتفاصيل.',

                // Info Messages
                'important-note': 'ملاحظة هامة',
                'admin-warning': '⚠️ انتبه: أي تغيير هنا سيؤثر فوراً على جميع الحسابات للمستخدمين.',
                'advancedtools-info': 'تريد جدول سداد مفصل؟',
                'advancedtools-link': 'اذهب للأدوات المتقدمة',
                'advancedtools-link-secured': 'اذهب للأدوات المتقدمة للحصول على جداول الاستهلاك.',
                'first-month-how-it-works': 'توضيح بخصوص القسط الأول:',
                'first-month-explanation': 'إذا بدأ القرض في منتصف الشهر، يكون القسط الأول أكبر لأنه يشمل فوائد الأيام الزائدة قبل انتظام دورة الدفع.',
                'stamp-duty-info': 'عن رسوم الدمغة:',
                'stamp-duty-explanation': 'رسم حكومي يطبق ربع سنوياً (مارس، يونيو، سبتمبر، ديسمبر) على رصيد القرض.',
                'stamp-duty-note': 'الدمغة النسبية:',
                'stamp-duty-note-detail': 'الصفوف المظللة تشير للأشهر التي يتم فيها خصم الدمغة الربع سنوية.',
                'first-payment-note': 'ملاحظة:',
                'back-to-home': 'العودة للرئيسية',
                'use-calculators': 'استخدم هذه الأدوات لاتخاذ قرارات مالية دقيقة.',

                // Table Headers
                'table-number': '#',
                'no-products': 'No products available. Add one or import from CSV.',

                // Tabs
                'tab-by-income': 'بالدخل',
                'tab-by-installment': 'بالقسط',
                'tab-loan-schedule': 'حاسبة القروض',
                'tab-smart-investment': 'الاستثمار',
                'tab-smart-optimizer': 'المحسّن الذكي',
                'tab-td-secured-loan': 'قرض بضمان الودائع',
                'tab-loan-calculator': 'حاسبة القرض',
                'tab-max-loan': 'الحد الأقصى',
                'tab-first-month': 'الشهر الأول',
                'tab-amortization': 'جدول الاستهلاك',

                // Share
                'share-btn-title': 'مشاركة هذه الصفحة',
                'share-text': 'اكتشف BMToolkit – حاسبات مالية ذكية للقروض والاستثمارات.',
                'share-copied': 'تم نسخ الرابط!',
                'share-failed': 'تعذّر نسخ الرابط',
                'share-copy-prompt': 'انسخ هذا الرابط:'
            }
        };
    }

    // Get translation with optional interpolation params e.g. t('key', { years: 5 })
    t(key, params = null) {
        let str = this.translations[this.currentLanguage][key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
            });
        }
        return str;
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
// mortgage.js - CBE Mortgage Initiative Calculator

import { i18n } from '../i18n.js';
import { FinancialCalculator } from '../services/financial-calculator.js';

export class MortgagePage {
    static MAX_DBR_RATIO = 0.40;

    static t(en, ar) {
        return i18n.currentLanguage === 'ar' ? ar : en;
    }

    // ─── PRODUCT CATALOG ────────────────────────────────────────────────────────
    static CBE_PRODUCTS = [

        // ── PAYROLL | تحويل مرتب  (max_age: 60) ──────────────────────────────
        { id: 'PAY-8-T1-FX', ubs_code: 1034, installment_type: 'fixed', name_ar: 'تحويل مرتب - شريحة أولى - قسط ثابت', name_en: 'Salary Transfer T1 Fixed', ltv: 0.85, max_age: 60, program_name: 'CBE Mid payroll 8% LTV 85-30y', unit_price: { min: 0, max: 1_100_000 }, rate: 8, max_loan: 935_000, max_tenure: 30, admin_fees_pct: 1 },
        { id: 'PAY-8-T1-VA', ubs_code: 1035, installment_type: 'variable', name_ar: 'تحويل مرتب - شريحة أولى - قسط متزايد', name_en: 'Salary Transfer T1 Variable', ltv: 0.85, max_age: 60, program_name: 'CBE Mid payroll 8% LTV 85-30y', unit_price: { min: 0, max: 1_100_000 }, rate: 8, max_loan: 935_000, max_tenure: 30, admin_fees_pct: 1 },
        { id: 'PAY-8-T2-FX', ubs_code: 1034, installment_type: 'fixed', name_ar: 'تحويل مرتب - شريحة ثانية - قسط ثابت', name_en: 'Salary Transfer T2 Fixed', ltv: 0.80, max_age: 60, program_name: 'CBE Mid payroll 8% LTV 80-30y', unit_price: { min: 1_100_001, max: 1_400_000 }, rate: 8, max_loan: 1_120_000, max_tenure: 30, admin_fees_pct: 1 },
        { id: 'PAY-8-T2-VA', ubs_code: 1035, installment_type: 'variable', name_ar: 'تحويل مرتب - شريحة ثانية - قسط متزايد', name_en: 'Salary Transfer T2 Variable', ltv: 0.80, max_age: 60, program_name: 'CBE Mid payroll 8% LTV 80-30y', unit_price: { min: 1_100_001, max: 1_400_000 }, rate: 8, max_loan: 1_120_000, max_tenure: 30, admin_fees_pct: 1 },
        { id: 'PAY-12-FX', ubs_code: 1032, installment_type: 'fixed', name_ar: 'تحويل مرتب - 12% - قسط ثابت', name_en: 'Salary Transfer 12% Fixed', ltv: 0.80, max_age: 60, program_name: 'CBE Mid Payroll 12%-25y', unit_price: { min: 1_400_001, max: 2_500_000 }, rate: 12, max_loan: 2_000_000, max_tenure: 25, admin_fees_pct: 0 },
        { id: 'PAY-12-VA', ubs_code: 1033, installment_type: 'variable', name_ar: 'تحويل مرتب - 12% - قسط متزايد', name_en: 'Salary Transfer 12% Variable', ltv: 0.80, max_age: 60, program_name: 'CBE Mid Payroll 12%-25y', unit_price: { min: 1_400_001, max: 2_500_000 }, rate: 12, max_loan: 2_000_000, max_tenure: 25, admin_fees_pct: 0 },

        // ── INCOME PROOF | إثبات الدخل  (max_age: 60) ────────────────────────
        { id: 'INC-8-T1-FX', ubs_code: 1034, installment_type: 'fixed', name_ar: 'إثبات الدخل - شريحة أولى - قسط ثابت', name_en: 'Income Proof T1 Fixed', ltv: 0.85, max_age: 60, program_name: 'CBE MID Income proof 8% LTV 85%-30y', unit_price: { min: 0, max: 1_100_000 }, rate: 8, max_loan: 935_000, max_tenure: 30, admin_fees_pct: 1 },
        { id: 'INC-8-T1-VA', ubs_code: 1035, installment_type: 'variable', name_ar: 'إثبات الدخل - شريحة أولى - قسط متزايد', name_en: 'Income Proof T1 Variable', ltv: 0.85, max_age: 60, program_name: 'CBE MID Income proof 8% LTV 85%-30y', unit_price: { min: 0, max: 1_100_000 }, rate: 8, max_loan: 935_000, max_tenure: 30, admin_fees_pct: 1 },
        { id: 'INC-8-T2-FX', ubs_code: 1034, installment_type: 'fixed', name_ar: 'إثبات الدخل - شريحة ثانية - قسط ثابت', name_en: 'Income Proof T2 Fixed', ltv: 0.80, max_age: 60, program_name: 'CBE Mid income proof 8% LTV 80%-30y', unit_price: { min: 1_100_001, max: 1_400_000 }, rate: 8, max_loan: 1_120_000, max_tenure: 30, admin_fees_pct: 1 },
        { id: 'INC-8-T2-VA', ubs_code: 1035, installment_type: 'variable', name_ar: 'إثبات الدخل - شريحة ثانية - قسط متزايد', name_en: 'Income Proof T2 Variable', ltv: 0.80, max_age: 60, program_name: 'CBE Mid income proof 8% LTV 80%-30y', unit_price: { min: 1_100_001, max: 1_400_000 }, rate: 8, max_loan: 1_120_000, max_tenure: 30, admin_fees_pct: 1 },
        { id: 'INC-12-FX', ubs_code: 1032, installment_type: 'fixed', name_ar: 'إثبات الدخل - 12% - قسط ثابت', name_en: 'Income Proof 12% Fixed', ltv: 0.80, max_age: 60, program_name: 'CBE Mid Income Proof 12%-25y', unit_price: { min: 1_400_001, max: 2_500_000 }, rate: 12, max_loan: 2_000_000, max_tenure: 25, admin_fees_pct: 0 },
        { id: 'INC-12-VA', ubs_code: 1033, installment_type: 'variable', name_ar: 'إثبات الدخل - 12% - قسط متزايد', name_en: 'Income Proof 12% Variable', ltv: 0.80, max_age: 60, program_name: 'CBE Mid Income Proof 12%-25y', unit_price: { min: 1_400_001, max: 2_500_000 }, rate: 12, max_loan: 2_000_000, max_tenure: 25, admin_fees_pct: 0 },

        // ── PROFESSIONALS | مهن حرة  (8%: ltv 80 | 12%: ltv 75) ─────────────
        { id: 'PRO-8-FX', ubs_code: 1034, installment_type: 'fixed', name_ar: 'مهن حرة - 8% - قسط ثابت', name_en: 'Free Professions 8% Fixed', ltv: 0.80, max_age: 65, program_name: 'CBE Mid 8% Professional-30y', unit_price: { min: 0, max: 1_400_000 }, rate: 8, max_loan: 1_120_000, max_tenure: 30, admin_fees_pct: 1, requirements: ['رخصة مزاولة المهنة > سنتين', 'بطاقة ضريبية'] },
        { id: 'PRO-8-VA', ubs_code: 1035, installment_type: 'variable', name_ar: 'مهن حرة - 8% - قسط متزايد', name_en: 'Free Professions 8% Variable', ltv: 0.80, max_age: 65, program_name: 'CBE Mid 8% Professional-30y', unit_price: { min: 0, max: 1_400_000 }, rate: 8, max_loan: 1_120_000, max_tenure: 30, admin_fees_pct: 1, requirements: ['رخصة مزاولة المهنة > سنتين', 'بطاقة ضريبية'] },
        { id: 'PRO-12-FX', ubs_code: 1032, installment_type: 'fixed', name_ar: 'مهن حرة - 12% - قسط ثابت', name_en: 'Free Professions 12% Fixed', ltv: 0.75, max_age: 65, program_name: 'CBE Mid Professional 12%-25y', unit_price: { min: 1_400_001, max: 2_500_000 }, rate: 12, max_loan: 1_875_000, max_tenure: 25, admin_fees_pct: 0, requirements: ['رخصة مزاولة المهنة > سنتين', 'بطاقة ضريبية'] },
        { id: 'PRO-12-VA', ubs_code: 1033, installment_type: 'variable', name_ar: 'مهن حرة - 12% - قسط متزايد', name_en: 'Free Professions 12% Variable', ltv: 0.75, max_age: 65, program_name: 'CBE Mid Professional 12%-25y', unit_price: { min: 1_400_001, max: 2_500_000 }, rate: 12, max_loan: 1_875_000, max_tenure: 25, admin_fees_pct: 0, requirements: ['رخصة مزاولة المهنة > سنتين', 'بطاقة ضريبية'] },

        // ── SELF-EMPLOYED | أصحاب الأعمال  (8%: ltv 80 | 12%: ltv 75) ───────
        { id: 'SE-8-FX', ubs_code: 1034, installment_type: 'fixed', name_ar: 'أصحاب الأعمال - 8% - قسط ثابت', name_en: 'Business Owners 8% Fixed', ltv: 0.80, max_age: 65, program_name: 'CBE MID SELF EMPLOYED 8%-30y', unit_price: { min: 0, max: 1_400_000 }, rate: 8, max_loan: 1_120_000, max_tenure: 30, admin_fees_pct: 1, requirements: ['سجل تجاري حديث > سنتين', 'بطاقة ضريبية'] },
        { id: 'SE-8-VA', ubs_code: 1035, installment_type: 'variable', name_ar: 'أصحاب الأعمال - 8% - قسط متزايد', name_en: 'Business Owners 8% Variable', ltv: 0.80, max_age: 65, program_name: 'CBE MID SELF EMPLOYED 8%-30y', unit_price: { min: 0, max: 1_400_000 }, rate: 8, max_loan: 1_120_000, max_tenure: 30, admin_fees_pct: 1, requirements: ['سجل تجاري حديث > سنتين', 'بطاقة ضريبية'] },
        { id: 'SE-12-FX', ubs_code: 1032, installment_type: 'fixed', name_ar: 'أصحاب الأعمال - 12% - قسط ثابت', name_en: 'Business Owners 12% Fixed', ltv: 0.75, max_age: 65, program_name: 'CBE Mid self-employed 12%-25y', unit_price: { min: 1_400_001, max: 2_500_000 }, rate: 12, max_loan: 1_875_000, max_tenure: 25, admin_fees_pct: 0, requirements: ['سجل تجاري حديث > سنتين', 'بطاقة ضريبية'] },
        { id: 'SE-12-VA', ubs_code: 1033, installment_type: 'variable', name_ar: 'أصحاب الأعمال - 12% - قسط متزايد', name_en: 'Business Owners 12% Variable', ltv: 0.75, max_age: 65, program_name: 'CBE Mid self-employed 12%-25y', unit_price: { min: 1_400_001, max: 2_500_000 }, rate: 12, max_loan: 1_875_000, max_tenure: 25, admin_fees_pct: 0, requirements: ['سجل تجاري حديث > سنتين', 'بطاقة ضريبية'] },

        // ── UNCODED | جهات غير مصنفة  (ltv: 70%) ────────────────────────────
        { id: 'UNC-8-FX', ubs_code: 1034, installment_type: 'fixed', name_ar: 'جهات غير مصنفة - 8% - قسط ثابت', name_en: 'Unclassified 8% Fixed', ltv: 0.70, max_age: 60, program_name: 'CBE Mid un coded company 8%-30y', unit_price: { min: 0, max: 1_400_000 }, rate: 8, max_loan: 980_000, max_tenure: 30, admin_fees_pct: 1, requirements: ['بيرنت تأمينات', 'كشف حساب آخر 3 شهور'] },
        { id: 'UNC-8-VA', ubs_code: 1035, installment_type: 'variable', name_ar: 'جهات غير مصنفة - 8% - قسط متزايد', name_en: 'Unclassified 8% Variable', ltv: 0.70, max_age: 60, program_name: 'CBE Mid un coded company 8%-30y', unit_price: { min: 0, max: 1_400_000 }, rate: 8, max_loan: 980_000, max_tenure: 30, admin_fees_pct: 1, requirements: ['بيرنت تأمينات', 'كشف حساب آخر 3 شهور'] },
        { id: 'UNC-12-FX', ubs_code: 1032, installment_type: 'fixed', name_ar: 'جهات غير مصنفة - 12% - قسط ثابت', name_en: 'Unclassified 12% Fixed', ltv: 0.70, max_age: 60, program_name: 'CBE MID UN coded 12%-25y', unit_price: { min: 1_400_001, max: 2_500_000 }, rate: 12, max_loan: 1_750_000, max_tenure: 25, admin_fees_pct: 0, requirements: ['بيرنت تأمينات', 'كشف حساب آخر 3 شهور'] },
        { id: 'UNC-12-VA', ubs_code: 1033, installment_type: 'variable', name_ar: 'جهات غير مصنفة - 12% - قسط متزايد', name_en: 'Unclassified 12% Variable', ltv: 0.70, max_age: 60, program_name: 'CBE MID UN coded 12%-25y', unit_price: { min: 1_400_001, max: 2_500_000 }, rate: 12, max_loan: 1_750_000, max_tenure: 25, admin_fees_pct: 0, requirements: ['بيرنت تأمينات', 'كشف حساب آخر 3 شهور'] },

        // ── PENSION | معاشات ─────────────────────────────────────────────────
        { id: 'PEN-8-FX', ubs_code: 1034, installment_type: 'fixed', name_ar: 'معاشات - 8% - قسط ثابت', name_en: 'Pensions 8% Fixed', ltv: 0.60, max_age: 75, program_name: 'CBE Mid Pension 8%-30y', unit_price: { min: 0, max: 1_400_000 }, rate: 8, max_loan: 840_000, max_tenure: 30, admin_fees_pct: 1, notes_ar: 'صاحب المعاش أو المستفيد' },
        { id: 'PEN-8-VA', ubs_code: 1035, installment_type: 'variable', name_ar: 'معاشات - 8% - قسط متزايد', name_en: 'Pensions 8% Variable', ltv: 0.60, max_age: 75, program_name: 'CBE Mid Pension 8%-30y', unit_price: { min: 0, max: 1_400_000 }, rate: 8, max_loan: 840_000, max_tenure: 30, admin_fees_pct: 1, notes_ar: 'صاحب المعاش أو المستفيد' },
        { id: 'PEN-12-FX', ubs_code: 1032, installment_type: 'fixed', name_ar: 'معاشات - 12% - قسط ثابت', name_en: 'Pensions 12% Fixed', ltv: 0.60, max_age: 65, program_name: 'CBE MID PENSION 12%-25y', unit_price: { min: 1_400_001, max: 2_500_000 }, rate: 12, max_loan: 1_500_000, max_tenure: 25, admin_fees_pct: 0, notes_ar: 'صاحب المعاش فقط' },
        { id: 'PEN-12-VA', ubs_code: 1033, installment_type: 'variable', name_ar: 'معاشات - 12% - قسط متزايد', name_en: 'Pensions 12% Variable', ltv: 0.60, max_age: 65, program_name: 'CBE MID PENSION 12%-25y', unit_price: { min: 1_400_001, max: 2_500_000 }, rate: 12, max_loan: 1_500_000, max_tenure: 25, admin_fees_pct: 0, notes_ar: 'صاحب المعاش فقط' },
    ];

    static SEGMENT_PREFIXES = {
        'Payroll Transfer': 'PAY',
        'Income Proof': 'INC',
        'Freelancers': 'PRO',
        'Self-Employed': 'SE',
        'Uncoded Companies': 'UNC',
        'Pension': 'PEN',
    };

    static INCOME_CAPS = {
        '8': { individual: 13_000, family: 18_000 },
        '12': { individual: 40_000, family: 50_000 },
    };

    static ESCALATING_PARAMS = {
        '8': { annualIncrease: 0.05, increaseLimitFn: (y) => y },
        '12': { annualIncrease: 0.07, increaseLimitFn: (y) => Math.min(10, y) },
    };

    // ─── PRODUCT LOOKUP ──────────────────────────────────────────────────────────
    static getProduct(segment, unitPrice, installmentType) {
        const prefix = this.SEGMENT_PREFIXES[segment];
        if (!prefix) return null;
        const instNorm = installmentType === 'escalating' ? 'variable' : installmentType;
        return this.CBE_PRODUCTS.find(p =>
            p.id.startsWith(prefix) &&
            p.installment_type === instNorm &&
            unitPrice >= p.unit_price.min &&
            unitPrice <= p.unit_price.max
        ) ?? null;
    }

    // ─── RENDER ──────────────────────────────────────────────────────────────────
    static render() {
        return `
            <div class="container">
                <div style="margin-bottom: var(--spacing-2xl);">
                    <h1>
                        <i class="fas fa-house" style="color: var(--primary);"></i>
                        ${this.t('Mortgage Initiative Calculator', 'حاسبة مبادرة التمويل العقاري')}
                    </h1>
                    <p class="text-muted">
                        ${this.t(
            'Estimate eligibility, max loan amount, and fixed/escalating installments for CBE 8% and 12% initiatives.',
            'احسب الأهلية وقيمة التمويل القصوى والأقساط الثابتة والمتزايدة لمبادرتي البنك المركزي 8% و12%.'
        )}
                    </p>
                </div>

                <div class="card" style="margin-bottom: var(--spacing-lg);">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-sliders-h"></i>
                            ${this.t('Loan Parameters', 'بيانات التمويل')}
                        </h3>
                    </div>
                    <div class="card-body">
                        <form id="mortgage-form">

                            <!-- Row 1 -->
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-building"></i>
                                        ${this.t('Unit Price (EGP)', 'سعر الوحدة (جنيه)')}
                                    </label>
                                    <input id="unit-price" type="number" class="form-input" min="1" placeholder="e.g. 1200000" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-users"></i>
                                        ${this.t('Customer Segment', 'شريحة العميل')}
                                    </label>
                                    <select id="customer-segment" class="form-select" required>
                                        <option value="Payroll Transfer">${this.t('Payroll Transfer', 'تحويل مرتب')}</option>
                                        <option value="Income Proof">${this.t('Income Proof', 'إثبات الدخل')}</option>
                                        <option value="Freelancers">${this.t('Freelancers', 'مهن حرة')}</option>
                                        <option value="Self-Employed">${this.t('Self-Employed', 'أصحاب الأعمال')}</option>
                                        <option value="Uncoded Companies">${this.t('Uncoded Companies', 'جهات غير مصنفة')}</option>
                                        <option value="Pension">${this.t('Pension', 'معاشات')}</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Row 2 -->
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-money-bill-wave"></i>
                                        ${this.t('Monthly Net Income (EGP)', 'صافي الدخل الشهري (جنيه)')}
                                    </label>
                                    <input id="monthly-income" type="number" class="form-input" min="1" placeholder="e.g. 15000" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-user-friends"></i>
                                        ${this.t('Income Type', 'نوع الدخل')}
                                    </label>
                                    <select id="income-type" class="form-select" required>
                                        <option value="individual">${this.t('Individual', 'فرد')}</option>
                                        <option value="family">${this.t('Family', 'أسرة')}</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Row 3: Obligations -->
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-file-invoice-dollar"></i>
                                        ${this.t('Existing Monthly Obligations (EGP)', 'الالتزامات الشهرية الحالية (جنيه)')}
                                    </label>
                                    <input id="monthly-installments" type="number" class="form-input" min="0" value="0">
                                    <small class="text-muted">${this.t('Other active loan installments', 'أقساط القروض الأخرى الجارية')}</small>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-credit-card"></i>
                                        ${this.t('Credit Card Limit (EGP)', 'حد بطاقة الائتمان (جنيه)')}
                                    </label>
                                    <input id="credit-card-limit" type="number" class="form-input" min="0" value="0">
                                    <small class="text-muted">${this.t('5% of limit added as monthly obligation', '5% من الحد يُضاف كالتزام شهري')}</small>
                                </div>
                            </div>

                            <!-- Row 4 -->
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-calendar-alt"></i>
                                        ${this.t('Preferred Loan Term (Years)', 'مدة التمويل المطلوبة (سنوات)')}
                                    </label>
                                    <input id="loan-term-years" type="number" class="form-input" min="1" max="30" placeholder="e.g. 20" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-chart-line"></i>
                                        ${this.t('Installment Type', 'نوع القسط')}
                                    </label>
                                    <select id="installment-type" class="form-select" required>
                                        <option value="fixed">${this.t('Fixed', 'ثابت')}</option>
                                        <option value="escalating">${this.t('Escalating (+5%/+7% annually)', 'متزايد (+5%/+7% سنويًا)')}</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div style="display:flex; align-items:center; gap:var(--spacing-sm); flex-wrap:wrap; margin-top:var(--spacing-sm);">
                                <button class="btn-primary" type="submit">
                                    <i class="fas fa-calculator"></i>
                                    ${this.t('Calculate', 'احسب')}
                                </button>
                                <button class="btn-secondary" type="reset">
                                    <i class="fas fa-redo"></i>
                                    ${this.t('Reset', 'مسح')}
                                </button>
                                <label style="display:flex; align-items:center; gap:8px; margin-inline-start:var(--spacing-sm); cursor:pointer;">
                                    <input id="show-schedule" type="checkbox">
                                    <span style="font-size:0.9em;">${this.t('Show escalating schedule', 'عرض جدول القسط المتزايد')}</span>
                                </label>
                            </div>

                        </form>
                    </div>
                </div>

                <div id="mortgage-results"></div>
            </div>
        `;
    }

    // ─── ELIGIBILITY ─────────────────────────────────────────────────────────────
    static getInitiative(unitPrice, income, incomeType, segment) {
        if (unitPrice <= 0 || income <= 0) {
            return { errors: [this.t('Please provide valid unit price and income.', 'يرجى إدخال سعر وحدة ودخل صحيحين.')] };
        }

        const rateKey = unitPrice <= 1_400_000 ? '8' : unitPrice <= 2_500_000 ? '12' : null;
        if (!rateKey) {
            return { errors: [this.t('Unit price exceeds program maximum (2,500,000 EGP).', 'سعر الوحدة يتجاوز الحد الأقصى للمبادرة (2,500,000 جنيه).')] };
        }

        const cap = this.INCOME_CAPS[rateKey];
        const incomeOk = incomeType === 'family' ? income <= cap.family : income <= cap.individual;
        if (!incomeOk) {
            return {
                errors: [this.t(
                    `Income exceeds the ${rateKey}% initiative cap. Max: ${cap.individual.toLocaleString()} EGP (individual) / ${cap.family.toLocaleString()} EGP (family).`,
                    `الدخل يتجاوز حد مبادرة ${rateKey}%. الحد الأقصى: ${cap.individual.toLocaleString()} جنيه (فرد) / ${cap.family.toLocaleString()} جنيه (أسرة).`
                )]
            };
        }

        const productRecord = this.getProduct(segment, unitPrice, 'fixed');
        if (!productRecord) {
            return { errors: [this.t('No matching product found for this segment and unit price.', 'لا يوجد منتج مطابق لهذه الشريحة وسعر الوحدة.')] };
        }

        const ep = this.ESCALATING_PARAMS[rateKey];
        return {
            initiative: rateKey,
            tranche: rateKey === '8' ? (unitPrice <= 1_100_000 ? 1 : 2) : null,
            ltv: productRecord.ltv,
            maxLoanCap: productRecord.max_loan,
            maxTermYears: productRecord.max_tenure,
            maxAge: productRecord.max_age,
            annualRate: productRecord.rate / 100,
            adminFeeRate: productRecord.admin_fees_pct / 100,
            programName: productRecord.program_name,
            annualIncrease: ep.annualIncrease,
            increaseLimitFn: ep.increaseLimitFn,
        };
    }

    // ─── FINANCIAL HELPERS ───────────────────────────────────────────────────────
    static calculatePresentValueFromInstallment(monthlyInstallment, monthlyRate, months) {
        if (monthlyRate === 0) return monthlyInstallment * months;
        return monthlyInstallment * ((1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate);
    }

    static calculateEscalatingPresentValue(firstInstallment, annualRate, years, annualIncrease, increaseYearsLimit) {
        const monthlyRate = annualRate / 12;
        const months = years * 12;
        let pv = 0;
        for (let month = 1; month <= months; month++) {
            const yearIndex = Math.ceil(month / 12) - 1;
            const growthYears = Math.min(yearIndex, increaseYearsLimit);
            const installment = firstInstallment * Math.pow(1 + annualIncrease, growthYears);
            pv += installment / Math.pow(1 + monthlyRate, month);
        }
        return pv;
    }

    static calculateEscalatingFirstInstallment(loanAmount, annualRate, years, annualIncrease, increaseYearsLimit) {
        const monthlyRate = annualRate / 12;
        const months = years * 12;
        let low = 0;
        let high = FinancialCalculator.PMT(monthlyRate, months, loanAmount);
        while (this.calculateEscalatingPresentValue(high, annualRate, years, annualIncrease, increaseYearsLimit) < loanAmount) {
            high *= 1.2;
        }
        for (let i = 0; i < 60; i++) {
            const mid = (low + high) / 2;
            if (this.calculateEscalatingPresentValue(mid, annualRate, years, annualIncrease, increaseYearsLimit) > loanAmount) high = mid;
            else low = mid;
        }
        return (low + high) / 2;
    }

    static getEscalatingSchedule(firstInstallment, annualIncrease, years, increaseYearsLimit) {
        const schedule = [];
        for (let year = 1; year <= years; year++) {
            const growthYears = Math.min(year - 1, increaseYearsLimit);
            schedule.push({ year, monthlyInstallment: firstInstallment * Math.pow(1 + annualIncrease, growthYears) });
        }
        return schedule;
    }

    // ─── MAIN CALCULATION ────────────────────────────────────────────────────────
    static calculateMortgage(inputs) {
        const { unitPrice, monthlyIncome, incomeType, termYears, segment,
            installmentType, monthlyObligations, creditCardLimit } = inputs;

        const initiativeData = this.getInitiative(unitPrice, monthlyIncome, incomeType, segment);
        if (initiativeData.errors) return { errors: initiativeData.errors };

        // ── DBR: subtract existing obligations from available capacity ────────
        const creditCardObligation = (creditCardLimit || 0) * 0.05;
        const totalObligations = (monthlyObligations || 0) + creditCardObligation;
        const maxMonthlyBurden = monthlyIncome * this.MAX_DBR_RATIO;
        const availableForMortgage = maxMonthlyBurden - totalObligations;

        if (availableForMortgage <= 0) {
            return {
                errors: [this.t(
                    'Existing obligations exceed the DBR limit. No capacity available for a new mortgage.',
                    'الالتزامات الحالية تتجاوز حد عبء الدين. لا توجد قدرة متاحة لتمويل جديد.'
                )]
            };
        }

        const cappedTermYears = Math.min(termYears, initiativeData.maxTermYears);
        const maxLoanByLtv = unitPrice * initiativeData.ltv;
        const monthlyRate = initiativeData.annualRate / 12;
        const months = cappedTermYears * 12;
        const increaseYearsLimit = initiativeData.increaseLimitFn(cappedTermYears);
        const { annualIncrease } = initiativeData;

        const maxLoanByDbrFixed = this.calculatePresentValueFromInstallment(
            availableForMortgage, monthlyRate, months
        );
        const maxLoanByDbrEscalating = this.calculateEscalatingPresentValue(
            availableForMortgage,
            initiativeData.annualRate,
            cappedTermYears,
            annualIncrease,
            increaseYearsLimit
        );
        const maxLoanByDbr = installmentType === 'fixed' ? maxLoanByDbrFixed : maxLoanByDbrEscalating;
        const maxLoanAmount = Math.min(maxLoanByLtv, initiativeData.maxLoanCap, maxLoanByDbr);

        const fixedInstallment = FinancialCalculator.PMT(monthlyRate, months, maxLoanAmount);
        const escalatingFirstInstallment = this.calculateEscalatingFirstInstallment(
            maxLoanAmount, initiativeData.annualRate, cappedTermYears, annualIncrease, increaseYearsLimit
        );

        const instNorm = installmentType === 'escalating' ? 'variable' : installmentType;
        const productRecord = this.getProduct(segment, unitPrice, instNorm);
        const ubsCode = productRecord?.ubs_code ?? null;

        // Determine what's constraining the loan
        const limitingFactor =
            maxLoanAmount < Math.min(maxLoanByLtv, initiativeData.maxLoanCap) - 0.5 ? 'dbr' :
                maxLoanAmount < maxLoanByLtv - 0.5 ? 'cap' : 'ltv';

        return {
            ...initiativeData,
            cappedTermYears,
            dbrRatio: this.MAX_DBR_RATIO,
            maxMonthlyBurden,
            creditCardObligation,
            totalObligations,
            availableForMortgage,
            ubsCode,
            maxLoanByLtv,
            maxLoanByDbr,
            maxLoanAmount,
            limitingFactor,
            fixedInstallment,
            escalatingFirstInstallment,
            totalPaymentFixed: fixedInstallment * months,
            totalInterestFixed: (fixedInstallment * months) - maxLoanAmount,
            escalatingSchedule: this.getEscalatingSchedule(
                escalatingFirstInstallment, annualIncrease, cappedTermYears, increaseYearsLimit
            ),
        };
    }

    // ─── FORMAT HELPERS ──────────────────────────────────────────────────────────
    static fmt(n) { return n != null ? `${i18n.formatNumber(n, 0)} EGP` : '—'; }
    static pct(n) { return n != null ? `${(n * 100).toFixed(0)}%` : '—'; }

    // ─── RENDER RESULTS ──────────────────────────────────────────────────────────
    static renderResults(result, inputs, showSchedule = false) {

        // ── Error state ──────────────────────────────────────────────────────
        if (result.errors) {
            return `
                <div class="card">
                    <div class="card-body">
                        <div class="info-box" style="border-color:var(--danger);">
                            <i class="fas fa-exclamation-circle" style="color:var(--danger);"></i>
                            <div>
                                <strong style="color:var(--danger);">${this.t('Not Eligible', 'غير مؤهل')}</strong>
                                <ul style="margin:var(--spacing-sm) 0 0 var(--spacing-lg);">
                                    ${result.errors.map(e => `<li>${e}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>`;
        }

        const termCapped = result.cappedTermYears < Number(inputs.termYears);
        const trancheLabel = result.initiative === '8'
            ? `${this.t('Tranche', 'الشريحة')} ${result.tranche}`
            : this.t('Single tranche', 'شريحة موحدة');

        const limitBadgeMap = {
            dbr: `<span class="badge badge-warning">${this.t('DBR limited', 'مقيّد بعبء الدين')}</span>`,
            ltv: `<span class="badge badge-info">${this.t('LTV limited', 'مقيّد بنسبة التمويل')}</span>`,
            cap: `<span class="badge badge-info">${this.t('Product cap', 'مقيّد بحد المنتج')}</span>`,
        };
        const limitBadge = limitBadgeMap[result.limitingFactor] || '';
        const chosenInst = inputs.installmentType === 'fixed'
            ? result.fixedInstallment
            : result.escalatingFirstInstallment;
        const adminFeeAmt = result.adminFeeRate > 0
            ? result.maxLoanAmount * result.adminFeeRate : 0;

        return `

            <!-- ── Notices ── -->
            ${termCapped ? `
            <div class="info-box" style="margin-bottom:var(--spacing-md);">
                <i class="fas fa-info-circle"></i>
                <span>${this.t(
            `Term capped at ${result.cappedTermYears} years (program maximum).`,
            `تم تقليص المدة تلقائيًا إلى ${result.cappedTermYears} سنة (الحد الأقصى للبرنامج).`
        )}</span>
            </div>` : ''}

            ${result.creditCardObligation > 0 ? `
            <div class="info-box" style="margin-bottom:var(--spacing-md);">
                <i class="fas fa-credit-card"></i>
                <span>
                    <strong data-i18n="credit-card-obligation">${this.t('Credit card obligation:', 'التزام البطاقة:')}</strong>
                    ${this.fmt(inputs.creditCardLimit)} × 5% = <strong>${this.fmt(result.creditCardObligation)}</strong>
                    <span data-i18n="credit-card-obligation-note">${this.t('added to monthly obligations', 'مضافة للالتزامات الشهرية')}</span>
                </span>
            </div>` : ''}

            <!-- ── Metric summary cards ── -->
            <div class="grid grid-4" style="margin-bottom:var(--spacing-lg);">
                <div class="metric-card">
                    <div class="metric-label">${this.t('Max Loan Amount', 'قيمة التمويل القصوى')}</div>
                    <div class="metric-value primary">${this.fmt(result.maxLoanAmount)}</div>
                    <div class="metric-sub">${limitBadge}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">
                        ${inputs.installmentType === 'fixed'
                ? this.t('Monthly Installment', 'القسط الشهري')
                : this.t('Year 1 Installment', 'قسط السنة الأولى')}
                    </div>
                    <div class="metric-value">${this.fmt(chosenInst)}</div>
                    <div class="metric-sub">
                        ${inputs.installmentType === 'escalating'
                ? this.t('escalating', 'متزايد')
                : this.t('fixed', 'ثابت')}
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">${this.t('Initiative / Rate', 'المبادرة / السعر')}</div>
                    <div class="metric-value">${result.initiative}%</div>
                    <div class="metric-sub">${trancheLabel}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">${this.t('Loan Term', 'مدة التمويل')}</div>
                    <div class="metric-value">${result.cappedTermYears}</div>
                    <div class="metric-sub">${this.t('years', 'سنة')}</div>
                </div>
            </div>

            <!-- ── Full detail card ── -->
            <div class="card" style="margin-bottom:var(--spacing-lg);">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-receipt"></i>
                        ${this.t('Full Breakdown', 'التفاصيل الكاملة')}
                    </h3>
                </div>
                <div class="card-body">
                    <div class="grid grid-2" style="gap:var(--spacing-lg);">

                        <!-- Product info -->
                        <div>
                            <h4 style="margin-bottom:var(--spacing-sm); font-size:0.85em; text-transform:uppercase; color:var(--text-muted); letter-spacing:.06em;">
                                ${this.t('Product', 'المنتج')}
                            </h4>
                            <table class="detail-table" style="width:100%; font-size:0.9em; border-collapse:collapse;">
                                <tr><td class="dt-label">${this.t('Program', 'البرنامج')}</td>             <td class="dt-value"><strong>${result.programName}</strong></td></tr>
                                <tr><td class="dt-label">${this.t('UBS Code', 'كود المنتج')}</td>          <td class="dt-value"><strong>${result.ubsCode ?? '—'}</strong></td></tr>
                                <tr><td class="dt-label">${this.t('Interest Rate', 'سعر العائد')}</td>     <td class="dt-value">${this.pct(result.annualRate)}</td></tr>
                                <tr><td class="dt-label">${this.t('LTV', 'نسبة التمويل')}</td>             <td class="dt-value">${this.pct(result.ltv)}</td></tr>
                                <tr><td class="dt-label">${this.t('Max Age', 'الحد الأقصى للسن')}</td>     <td class="dt-value">${result.maxAge ?? '—'}</td></tr>
                                <tr><td class="dt-label">${this.t('Admin Fees', 'المصاريف الإدارية')}</td> <td class="dt-value">${result.adminFeeRate > 0 ? this.pct(result.adminFeeRate) : this.t('None', 'لا يوجد')}</td></tr>
                                ${adminFeeAmt > 0 ? `<tr><td class="dt-label">${this.t('Fee Amount', 'قيمة الرسوم')}</td><td class="dt-value">${this.fmt(adminFeeAmt)}</td></tr>` : ''}
                            </table>
                        </div>

                        <!-- DBR breakdown -->
                        <div>
                            <h4 style="margin-bottom:var(--spacing-sm); font-size:0.85em; text-transform:uppercase; color:var(--text-muted); letter-spacing:.06em;">
                                ${this.t('DBR Breakdown', 'تفاصيل عبء الدين')}
                            </h4>
                            <table class="detail-table" style="width:100%; font-size:0.9em; border-collapse:collapse;">
                                <tr><td class="dt-label">${this.t('Monthly Income', 'الدخل الشهري')}</td>                           <td class="dt-value">${this.fmt(inputs.monthlyIncome)}</td></tr>
                                <tr><td class="dt-label">${this.t('DBR Ratio', 'نسبة عبء الدين')}</td>                             <td class="dt-value">${this.pct(result.dbrRatio)}</td></tr>
                                <tr><td class="dt-label">${this.t('Max Monthly Burden', 'الحد الأقصى للأعباء')}</td>               <td class="dt-value">${this.fmt(result.maxMonthlyBurden)}</td></tr>
                                <tr style="border-top:1px solid var(--border-color);">
                                    <td class="dt-label">${this.t('Existing Installments', 'الأقساط الحالية')}</td>               <td class="dt-value">${this.fmt(inputs.monthlyObligations || 0)}</td></tr>
                                ${result.creditCardObligation > 0 ? `
                                <tr><td class="dt-label">${this.t('Credit Card Obligation', 'التزام البطاقة')}</td>                 <td class="dt-value">${this.fmt(result.creditCardObligation)}</td></tr>` : ''}
                                <tr><td class="dt-label">${this.t('Total Obligations', 'إجمالي الالتزامات')}</td>                  <td class="dt-value">${this.fmt(result.totalObligations)}</td></tr>
                                <tr style="background:var(--bg-highlight, var(--card-bg));">
                                    <td class="dt-label"><strong>${this.t('Available for Mortgage', 'المتاح للرهن العقاري')}</strong></td>
                                    <td class="dt-value"><strong>${this.fmt(result.availableForMortgage)}</strong></td>
                                </tr>
                            </table>
                        </div>

                        <!-- Loan limits -->
                        <div>
                            <h4 style="margin-bottom:var(--spacing-sm); font-size:0.85em; text-transform:uppercase; color:var(--text-muted); letter-spacing:.06em;">
                                ${this.t('Loan Limits', 'حدود التمويل')}
                            </h4>
                            <table class="detail-table" style="width:100%; font-size:0.9em; border-collapse:collapse;">
                                <tr><td class="dt-label">${this.t('Max by LTV', 'الحد بنسبة التمويل')}</td>          <td class="dt-value">${this.fmt(result.maxLoanByLtv)}</td></tr>
                                <tr><td class="dt-label">${this.t('Product Cap', 'الحد الأقصى للمنتج')}</td>         <td class="dt-value">${this.fmt(result.maxLoanCap)}</td></tr>
                                <tr><td class="dt-label">${this.t('Max by DBR', 'الحد وفق عبء الدين')}</td>          <td class="dt-value">${this.fmt(result.maxLoanByDbr)}</td></tr>
                                <tr style="background:var(--bg-highlight, var(--card-bg));">
                                    <td class="dt-label"><strong>${this.t('Final Loan Amount', 'قيمة القرض النهائية')}</strong></td>
                                    <td class="dt-value"><strong>${this.fmt(result.maxLoanAmount)}</strong></td>
                                </tr>
                            </table>
                        </div>

                        <!-- Installment comparison -->
                        <div>
                            <h4 style="margin-bottom:var(--spacing-sm); font-size:0.85em; text-transform:uppercase; color:var(--text-muted); letter-spacing:.06em;">
                                ${this.t('Installment Comparison', 'مقارنة الأقساط')}
                            </h4>
                            <table class="detail-table" style="width:100%; font-size:0.9em; border-collapse:collapse;">
                                <tr><td class="dt-label">${this.t('Fixed Monthly', 'القسط الثابت')}</td>                          <td class="dt-value">${this.fmt(result.fixedInstallment)}</td></tr>
                                <tr><td class="dt-label">${this.t('Total Payment (Fixed)', 'إجمالي السداد (ثابت)')}</td>           <td class="dt-value">${this.fmt(result.totalPaymentFixed)}</td></tr>
                                <tr><td class="dt-label">${this.t('Total Interest (Fixed)', 'إجمالي الفائدة (ثابت)')}</td>         <td class="dt-value">${this.fmt(result.totalInterestFixed)}</td></tr>
                                <tr style="border-top:1px solid var(--border-color);">
                                    <td class="dt-label">${this.t('Escalating Year 1', 'المتزايد - سنة 1')}</td>                  <td class="dt-value">${this.fmt(result.escalatingFirstInstallment)}</td></tr>
                                <tr><td class="dt-label">${this.t('Annual Increase Rate', 'نسبة الزيادة السنوية')}</td>            <td class="dt-value">${this.pct(result.annualIncrease)}</td></tr>
                                <tr><td class="dt-label">${this.t('Increase Period', 'فترة الزيادة')}</td>                         <td class="dt-value">${result.initiative === '12'
                ? this.t('First 10 years', 'أول 10 سنوات')
                : this.t('Full term', 'طوال المدة')}</td>
                                </tr>
                            </table>
                        </div>

                    </div>
                </div>
            </div>

            <!-- ── Escalating schedule ── -->
            ${showSchedule ? `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-table"></i>
                        ${this.t('Yearly Escalating Installment Schedule', 'جدول القسط المتزايد السنوي')}
                    </h3>
                </div>
                <div class="card-body" style="overflow-x:auto;">
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th>${this.t('Year', 'السنة')}</th>
                                <th>${this.t('Monthly Installment', 'القسط الشهري')}</th>
                                <th>${this.t('Annual Total', 'الإجمالي السنوي')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${result.escalatingSchedule.map(row => `
                                <tr>
                                    <td>${row.year}</td>
                                    <td class="number-display">${this.fmt(row.monthlyInstallment)}</td>
                                    <td class="number-display">${this.fmt(row.monthlyInstallment * 12)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>` : ''}
        `;
    }

    // ─── EVENT LISTENERS ─────────────────────────────────────────────────────────
    static attachEventListeners() {
        const form = document.getElementById('mortgage-form');
        const results = document.getElementById('mortgage-results');
        if (!form || !results) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = {
                unitPrice: Number(document.getElementById('unit-price').value),
                monthlyIncome: Number(document.getElementById('monthly-income').value),
                incomeType: document.getElementById('income-type').value,
                termYears: Number(document.getElementById('loan-term-years').value),
                segment: document.getElementById('customer-segment').value,
                installmentType: document.getElementById('installment-type').value,
                monthlyObligations: Number(document.getElementById('monthly-installments').value) || 0,
                creditCardLimit: Number(document.getElementById('credit-card-limit').value) || 0,
            };
            const showSchedule = document.getElementById('show-schedule').checked;
            const result = this.calculateMortgage(inputs);
            results.innerHTML = this.renderResults(result, inputs, showSchedule);
        });

        form.addEventListener('reset', () => { results.innerHTML = ''; });
    }

    // ─── INIT ────────────────────────────────────────────────────────────────────
    static async init() {
        const router = window.app?.router;
        if (router) {
            router.render(this.render());
            this.attachEventListeners();
        }
    }
}
// mortgage.js - CBE Mortgage Initiative Calculator

import { i18n } from '../i18n.js';
import { FinancialCalculator } from '../services/financial-calculator.js';

export class MortgagePage {
    static MAX_DBR_RATIO = 0.40;

    static t(en, ar) {
        return i18n.currentLanguage === 'ar' ? ar : en;
    }

    static PROGRAMS = {
        '8': {
            'Payroll Transfer': 'CBE Mid Payroll 8% LTV 85/80-30y',
            'Income Proof': 'CBE Mid Income Proof 8% LTV 85/80-30y',
            Freelancers: 'CBE Mid 8% Professional-30y',
            'Self-Employed': 'CBE MID Self Employed 8%-30y',
            'Uncoded Companies': 'CBE Mid Un Coded Company 8%-30y',
            Pension: 'CBE Mid Pension 8%-30y'
        },
        '12': {
            'Payroll Transfer': 'CBE Mid Payroll 12%-25y',
            'Income Proof': 'CBE Mid Income Proof 12%-25y',
            Freelancers: 'CBE Mid Professional 12%-25y',
            'Self-Employed': 'CBE Mid Self Employed 12%-25y',
            'Uncoded Companies': 'CBE MID UN Coded 12%-25y',
            Pension: 'CBE MID Pension 12%-25y'
        }
    };

    static PRODUCT_CODES = {
        '8-fixed': '1035',
        '8-escalating': '1034',
        '12-fixed': '1032',
        '12-escalating': '1033'
    };

    static render() {
        return `
            <div class="container">
                <div style="margin-bottom: var(--spacing-2xl);">
                    <h1><i class="fas fa-house" style="color: var(--primary);"></i> ${this.t('Mortgage Initiative Calculator', 'حاسبة مبادرة التمويل العقاري')}</h1>
                    <p class="text-muted">${this.t('Estimate eligibility, max loan amount, and fixed/escalating installments for CBE 8% and 12% initiatives.', 'احسب الأهلية وقيمة التمويل القصوى والأقساط الثابتة والمتزايدة لمبادرتي البنك المركزي 8% و12%.')}</p>
                </div>

                <div class="card" style="margin-bottom: var(--spacing-lg);">
                    <div class="card-body">
                        <form id="mortgage-form">
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label">${this.t('Unit Price (EGP)', 'سعر الوحدة (جنيه)')}</label>
                                    <input id="unit-price" type="number" class="form-input" min="1" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">${this.t('Monthly Net Income (EGP)', 'صافي الدخل الشهري (جنيه)')}</label>
                                    <input id="monthly-income" type="number" class="form-input" min="1" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">${this.t('Income Type', 'نوع الدخل')}</label>
                                    <select id="income-type" class="form-select" required>
                                        <option value="individual">${this.t('Individual', 'فرد')}</option>
                                        <option value="family">${this.t('Family', 'أسرة')}</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">${this.t('Preferred Loan Term (Years)', 'مدة القرض المطلوبة (بالسنوات)')}</label>
                                    <input id="loan-term-years" type="number" class="form-input" min="1" max="30" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">${this.t('Customer Segment', 'شريحة العميل')}</label>
                                    <select id="customer-segment" class="form-select" required>
                                        <option>Payroll Transfer</option>
                                        <option>Income Proof</option>
                                        <option>Freelancers</option>
                                        <option>Self-Employed</option>
                                        <option>Uncoded Companies</option>
                                        <option>Pension</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">${this.t('Installment Type', 'نوع القسط')}</label>
                                    <select id="installment-type" class="form-select" required>
                                        <option value="fixed">${this.t('Fixed', 'ثابت')}</option>
                                        <option value="escalating">${this.t('Escalating', 'متزايد')}</option>
                                    </select>
                                </div>
                            </div>
                            <div style="display:flex; gap: var(--spacing-sm);">
                                <button class="btn-primary" type="submit"><i class="fas fa-calculator"></i> ${this.t('Calculate', 'احسب')}</button>
                                <label style="display:flex; align-items:center; gap:8px;"><input id="show-schedule" type="checkbox"> ${this.t('Show yearly escalating schedule', 'عرض جدول القسط المتزايد سنويًا')}</label>
                            </div>
                        </form>
                    </div>
                </div>

                <div id="mortgage-results"></div>
            </div>
        `;
    }

    static getInitiative(unitPrice, income, incomeType) {
        if (unitPrice <= 0 || income <= 0) return { errors: [this.t('Please provide valid unit price and income.', 'يرجى إدخال سعر وحدة ودخل صحيحين.')] };

        if (unitPrice <= 1400000) {
            if ((incomeType === 'individual' && income <= 13000) || (incomeType === 'family' && income <= 18000)) {
                const tranche = unitPrice <= 1100000 ? 1 : 2;
                return {
                    initiative: '8',
                    tranche,
                    ltv: tranche === 1 ? 0.85 : 0.8,
                    maxLoanCap: 1120000,
                    maxTermYears: 30,
                    annualRate: 0.08,
                    adminFeeRate: 0.01
                };
            }
            return { errors: [this.t('Not eligible for 8% initiative due to income cap.', 'غير مؤهل لمبادرة 8% بسبب حد الدخل.')] };
        }

        if (unitPrice <= 2500000) {
            const is12IncomeEligible = (incomeType === 'individual' && income <= 40000)
                || (incomeType === 'family' && income <= 50000);

            if (is12IncomeEligible) {
                return {
                    initiative: '12',
                    tranche: null,
                    ltv: 0.8,
                    maxLoanCap: 2000000,
                    maxTermYears: 25,
                    annualRate: 0.12,
                    adminFeeRate: 0
                };
            }

            return {
                errors: [this.t(
                    'Not eligible for 12% initiative due to income cap (max 40,000 individual / 50,000 family).',
                    'غير مؤهل لمبادرة 12% بسبب حد الدخل (الحد الأقصى 40,000 للفرد / 50,000 للأسرة).'
                )]
            };
        }

        return { errors: [this.t('Unit price is outside the initiative range (max 2,500,000 EGP).', 'سعر الوحدة خارج نطاق المبادرة (الحد الأقصى 2,500,000 جنيه).')] };
    }


    static calculatePresentValueFromInstallment(monthlyInstallment, monthlyRate, months) {
        if (monthlyRate === 0) return monthlyInstallment * months;
        return monthlyInstallment * ((1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate);
    }

    static calculateEscalatingPresentValue(firstInstallment, annualRate, years, annualIncrease, increaseYearsLimit = years) {
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

    static calculateEscalatingFirstInstallment(loanAmount, annualRate, years, annualIncrease, increaseYearsLimit = years) {
        const monthlyRate = annualRate / 12;
        const months = years * 12;

        let low = 0;
        let high = FinancialCalculator.PMT(monthlyRate, months, loanAmount);

        while (this.calculateEscalatingPresentValue(high, annualRate, years, annualIncrease, increaseYearsLimit) < loanAmount) {
            high *= 1.2;
        }

        for (let i = 0; i < 60; i++) {
            const mid = (low + high) / 2;
            const pv = this.calculateEscalatingPresentValue(mid, annualRate, years, annualIncrease, increaseYearsLimit);
            if (pv > loanAmount) {
                high = mid;
            } else {
                low = mid;
            }
        }

        return (low + high) / 2;
    }

    static getEscalatingSchedule(firstInstallment, annualIncrease, years, increaseYearsLimit) {
        const schedule = [];
        for (let year = 1; year <= years; year++) {
            const growthYears = Math.min(year - 1, increaseYearsLimit);
            schedule.push({
                year,
                monthlyInstallment: firstInstallment * Math.pow(1 + annualIncrease, growthYears)
            });
        }
        return schedule;
    }

    static calculateMortgage(inputs) {
        const { unitPrice, monthlyIncome, incomeType, termYears, segment, installmentType } = inputs;
        const initiativeData = this.getInitiative(unitPrice, monthlyIncome, incomeType);

        if (initiativeData.errors) {
            return { errors: initiativeData.errors };
        }

        const cappedTermYears = Math.min(termYears, initiativeData.maxTermYears);
        const maxLoanByLtv = unitPrice * initiativeData.ltv;
        const monthlyRate = initiativeData.annualRate / 12;
        const months = cappedTermYears * 12;

        const annualIncrease = initiativeData.initiative === '8' ? 0.05 : 0.07;
        const increaseYearsLimit = initiativeData.initiative === '8' ? cappedTermYears : Math.min(10, cappedTermYears);

        const maxMonthlyInstallment = monthlyIncome * this.MAX_DBR_RATIO;
        const maxLoanByDbrFixed = this.calculatePresentValueFromInstallment(maxMonthlyInstallment, monthlyRate, months);
        const maxLoanByDbrEscalating = this.calculateEscalatingPresentValue(
            maxMonthlyInstallment,
            initiativeData.annualRate,
            cappedTermYears,
            annualIncrease,
            increaseYearsLimit
        );
        const maxLoanByDbr = installmentType === 'fixed' ? maxLoanByDbrFixed : maxLoanByDbrEscalating;

        const maxLoanAmount = Math.min(maxLoanByLtv, initiativeData.maxLoanCap, maxLoanByDbr);

        const fixedInstallment = FinancialCalculator.PMT(monthlyRate, months, maxLoanAmount);
        const escalatingFirstInstallment = this.calculateEscalatingFirstInstallment(
            maxLoanAmount,
            initiativeData.annualRate,
            cappedTermYears,
            annualIncrease,
            increaseYearsLimit
        );

        return {
            ...initiativeData,
            cappedTermYears,
            dbrRatio: this.MAX_DBR_RATIO,
            maxMonthlyInstallment,
            programName: this.PROGRAMS[initiativeData.initiative][segment],
            productCode: this.PRODUCT_CODES[`${initiativeData.initiative}-${installmentType}`],
            maxLoanByLtv,
            maxLoanByDbr,
            maxLoanAmount,
            dbrLimited: maxLoanAmount + 0.5 < Math.min(maxLoanByLtv, initiativeData.maxLoanCap),
            fixedInstallment,
            escalatingFirstInstallment,
            escalatingSchedule: this.getEscalatingSchedule(escalatingFirstInstallment, annualIncrease, cappedTermYears, increaseYearsLimit)
        };
    }

    static formatAmount(amount) {
        return `${i18n.formatNumber(amount, 0)} EGP`;
    }

    static renderResults(result, showSchedule = false) {
        if (result.errors) {
            return `
                <div class="card"><div class="card-body">
                    <h3 style="color:var(--danger);">${this.t('Missing / Ineligible Data', 'بيانات ناقصة / غير مؤهل')}</h3>
                    <ul>${result.errors.map(error => `<li>${error}</li>`).join('')}</ul>
                </div></div>
            `;
        }

        const trancheText = result.initiative === '8'
            ? `${this.t('Tranche', 'الشريحة')} ${result.tranche}`
            : this.t('Single range tranche', 'شريحة موحدة');

        const termNote = result.cappedTermYears < Number(document.getElementById('loan-term-years')?.value || result.cappedTermYears)
            ? `<p class="text-muted">${this.t('Requested term exceeded program limit and was capped automatically.', 'المدة المطلوبة تجاوزت حد البرنامج وتم تقليلها تلقائيًا.')}</p>`
            : '';

        return `
            <div class="card">
                <div class="card-body">
                    <h3>${this.t('Mortgage Result Summary', 'ملخص نتيجة التمويل العقاري')}</h3>
                    ${termNote}
                    ${result.dbrLimited ? `<p class="text-muted">${this.t('DBR limit reduced the final loan amount.', 'حد عبء الدين خفّض قيمة التمويل النهائية.')}</p>` : ''}
                    <div class="grid grid-2" style="margin-top:var(--spacing-md);">
                        <div><strong>${this.t('Initiative', 'المبادرة')}:</strong> ${result.initiative}% (${trancheText})</div>
                        <div><strong>${this.t('Program', 'البرنامج')}:</strong> ${result.programName}</div>
                        <div><strong>${this.t('Product Code', 'كود المنتج')}:</strong> ${result.productCode}</div>
                        <div><strong>${this.t('Interest Rate', 'سعر العائد')}:</strong> ${(result.annualRate * 100).toFixed(0)}%</div>
                        <div><strong>${this.t('Max Financing %', 'نسبة التمويل القصوى')}:</strong> ${(result.ltv * 100).toFixed(0)}%</div>
                        <div><strong>${this.t('Loan Term', 'مدة التمويل')}:</strong> ${result.cappedTermYears} ${this.t('years', 'سنة')}</div>
                        <div><strong>${this.t('Max Loan by LTV', 'الحد الأقصى حسب LTV')}:</strong> ${this.formatAmount(result.maxLoanByLtv)}</div>
                        <div><strong>${this.t('DBR Cap', 'الحد الأقصى لنسبة عبء الدين')}:</strong> ${(result.dbrRatio * 100).toFixed(0)}%</div>
                        <div><strong>${this.t('Max Installment by DBR', 'الحد الأقصى للقسط وفق عبء الدين')}:</strong> ${this.formatAmount(result.maxMonthlyInstallment)}</div>
                        <div><strong>${this.t('Max Loan by DBR', 'الحد الأقصى للتمويل وفق عبء الدين')}:</strong> ${this.formatAmount(result.maxLoanByDbr)}</div>
                        <div><strong>${this.t('Final Max Loan (after cap)', 'قيمة القرض النهائية بعد الحد الأقصى')}:</strong> ${this.formatAmount(result.maxLoanAmount)}</div>
                        <div><strong>${this.t('Admin Fees', 'المصاريف الإدارية')}:</strong> ${result.adminFeeRate > 0 ? `${(result.adminFeeRate * 100).toFixed(0)}%` : this.t('None', 'لا يوجد')}</div>
                        <div><strong>${this.t('Fixed Monthly Installment (est.)', 'القسط الشهري الثابت (تقديري)')}:</strong> ${this.formatAmount(result.fixedInstallment)}</div>
                        <div><strong>${this.t('Escalating Installment Year 1 (est.)', 'القسط المتزايد - السنة الأولى (تقديري)')}:</strong> ${this.formatAmount(result.escalatingFirstInstallment)}</div>
                    </div>
                </div>
            </div>
            ${showSchedule ? `
                <div class="card" style="margin-top: var(--spacing-lg);">
                    <div class="card-body">
                        <h3>${this.t('Yearly Escalating Installment Schedule', 'جدول القسط المتزايد السنوي')}</h3>
                        <div style="overflow-x:auto;">
                            <table style="width:100%; border-collapse: collapse;">
                                <thead>
                                    <tr>
                                        <th style="text-align:start; border-bottom:1px solid var(--border-color); padding:8px;">${this.t('Year', 'السنة')}</th>
                                        <th style="text-align:start; border-bottom:1px solid var(--border-color); padding:8px;">${this.t('Monthly Installment', 'القسط الشهري')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${result.escalatingSchedule.map(item => `
                                        <tr>
                                            <td style="padding:8px; border-bottom:1px solid var(--border-color);">${item.year}</td>
                                            <td style="padding:8px; border-bottom:1px solid var(--border-color);">${this.formatAmount(item.monthlyInstallment)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    }

    static attachEventListeners() {
        const form = document.getElementById('mortgage-form');
        const results = document.getElementById('mortgage-results');
        if (!form || !results) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const unitPrice = Number(document.getElementById('unit-price').value);
            const monthlyIncome = Number(document.getElementById('monthly-income').value);
            const incomeType = document.getElementById('income-type').value;
            const termYears = Number(document.getElementById('loan-term-years').value);
            const segment = document.getElementById('customer-segment').value;
            const installmentType = document.getElementById('installment-type').value;
            const showSchedule = document.getElementById('show-schedule').checked;

            const result = this.calculateMortgage({
                unitPrice,
                monthlyIncome,
                incomeType,
                termYears,
                segment,
                installmentType
            });

            results.innerHTML = this.renderResults(result, showSchedule);
        });
    }

    static async init() {
        const router = window.app?.router;
        if (router) {
            router.render(this.render());
            this.attachEventListeners();
        }
    }
}

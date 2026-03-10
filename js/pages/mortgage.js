import { i18n } from '../i18n.js';

export class MortgagePage {
    static initiatives = {
        cbe8: {
            key: 'cbe8',
            rate: 0.08,
            dbr: 0.4,
            maxTenor: 30,
            adminFee: 0.01,
            maxIndividualIncome: 13000,
            maxFamilyIncome: 18000,
            escalatingLabel: 'escalating-policy-8',
            getTier(unitPrice) {
                if (unitPrice <= 1100000) return { name: 'tier-1', ltv: 0.85, maxLoan: 935000, range: '≤ 1,100,000' };
                if (unitPrice <= 1400000) return { name: 'tier-2', ltv: 0.8, maxLoan: 1120000, range: '1,100,001 - 1,400,000' };
                return null;
            }
        },
        cbe12: {
            key: 'cbe12',
            rate: 0.12,
            dbr: 0.4,
            maxTenor: 25,
            adminFee: 0,
            maxIndividualIncome: 40000,
            maxFamilyIncome: 50000,
            escalatingLabel: 'escalating-policy-12',
            getTier(unitPrice) {
                if (unitPrice < 1400001 || unitPrice > 2500000) return null;
                return { name: null, ltv: 0.8, maxLoan: 2000000, range: '1,400,001 - 2,500,000' };
            }
        }
    };

    static init() {
        const router = window.app?.router;
        if (!router) return;
        router.render(this.render());
        i18n.updatePageText();
        this.attachListeners();
    }

    static render() {
        return `
            <div class="container">
                <div style="margin-bottom: var(--spacing-xl);">
                    <h1><i class="fas fa-house" style="color: var(--primary);"></i> <span data-i18n="mortgage-title">Mortgage</span></h1>
                    <p class="text-muted" data-i18n="mortgage-desc">CBE housing initiatives calculators</p>
                </div>

                <div class="tabs" id="mortgage-main-tabs">
                    <button class="tab-btn active" data-main-tab="cbe8"><span data-i18n="tab-cbe-8">CBE 8% Initiative</span></button>
                    <button class="tab-btn" data-main-tab="cbe12"><span data-i18n="tab-cbe-12">CBE 12% Initiative</span></button>
                </div>

                ${['cbe8', 'cbe12'].map((initiative, idx) => this.renderInitiativeSection(initiative, idx === 0)).join('')}
            </div>
        `;
    }

    static renderInitiativeSection(initiativeKey, isActive) {
        const initiative = this.initiatives[initiativeKey];
        return `
            <div class="card tab-content ${isActive ? 'active' : ''}" data-main-content="${initiativeKey}" style="margin-top: var(--spacing-lg);">
                <div class="card-body" style="padding-bottom: 0;">
                    ${this.renderInitiativeDetails(initiative)}
                </div>
                <div class="tabs" style="padding: 0 var(--spacing-lg); margin-bottom: var(--spacing-md);">
                    <button class="tab-btn active" data-sub-tab="max-income" data-initiative="${initiativeKey}"><span data-i18n="tab-max-income">Max Loan by Income</span></button>
                    <button class="tab-btn" data-sub-tab="fixed" data-initiative="${initiativeKey}"><span data-i18n="tab-fixed">Fixed Installment</span></button>
                    <button class="tab-btn" data-sub-tab="escalating" data-initiative="${initiativeKey}"><span data-i18n="tab-escalating">Escalating Installment</span></button>
                </div>
                ${this.renderMaxIncomeTab(initiativeKey, true)}
                ${this.renderFixedTab(initiativeKey)}
                ${this.renderEscalatingTab(initiativeKey)}
            </div>
        `;
    }

    static renderInitiativeDetails(initiative) {
        const rows = [
            ['rate-annual', `${(initiative.rate * 100).toFixed(0)}%`],
            ['dbr-limit', `${(initiative.dbr * 100).toFixed(0)}%`],
            ['max-tenor-years', `${initiative.maxTenor}`],
            ['escalating-policy', i18n.t(initiative.escalatingLabel)],
            ['max-income-individual', this.currency(initiative.maxIndividualIncome)],
            ['max-income-family', this.currency(initiative.maxFamilyIncome)],
            ['admin-fee-rate', initiative.adminFee ? `${(initiative.adminFee * 100).toFixed(0)}%` : i18n.t('none')]
        ];

        if (initiative.key === 'cbe12') rows.push(['unit-range', '1,400,001 - 2,500,000']);

        return `
            <h3 style="margin-bottom: var(--spacing-md);" data-i18n="initiative-details">Initiative Details</h3>
            <div class="grid grid-3" style="margin-bottom: var(--spacing-md);">
                ${rows.map(([k, v]) => `<div class="card" style="padding: var(--spacing-md);"><div class="text-muted" data-i18n="${k}"></div><strong>${v}</strong></div>`).join('')}
            </div>
        `;
    }

    static renderMaxIncomeTab(initiativeKey, active = false) {
        return `
            <div class="tab-content ${active ? 'active' : ''}" data-inner-content="max-income" data-initiative="${initiativeKey}">
                <div class="card-body">
                    <form data-form="max-income" data-initiative="${initiativeKey}">
                        <div class="grid grid-2">
                            ${this.input('income', 'net-monthly-income', 20000)}
                            ${this.select('income-type', 'income-type', [{ value: 'individual', label: 'individual' }, { value: 'family', label: 'family' }], 'individual')}
                            ${this.input('obligations', 'monthly-installments', 0)}
                            ${this.input('unit-price', 'unit-price', 1200000)}
                            ${this.input('tenor', 'tenor-years', 20, 1)}
                        </div>
                        <button class="btn-primary" type="submit"><span data-i18n="calculate">Calculate</span></button>
                    </form>
                    <div data-results="max-income" data-initiative="${initiativeKey}" style="margin-top: var(--spacing-lg);"></div>
                </div>
            </div>
        `;
    }

    static renderFixedTab(initiativeKey) {
        return `
            <div class="tab-content" data-inner-content="fixed" data-initiative="${initiativeKey}">
                <div class="card-body">
                    <form data-form="fixed" data-initiative="${initiativeKey}">
                        <div class="grid grid-2">
                            ${this.input('unit-price', 'unit-price', 1200000)}
                            ${this.input('loan-amount', 'loan-amount-auto', 900000)}
                            ${this.input('tenor', 'tenor-years', 20, 1)}
                        </div>
                        <button class="btn-primary" type="submit"><span data-i18n="calculate">Calculate</span></button>
                    </form>
                    <div data-results="fixed" data-initiative="${initiativeKey}" style="margin-top: var(--spacing-lg);"></div>
                </div>
            </div>
        `;
    }

    static renderEscalatingTab(initiativeKey) {
        return `
            <div class="tab-content" data-inner-content="escalating" data-initiative="${initiativeKey}">
                <div class="card-body">
                    <form data-form="escalating" data-initiative="${initiativeKey}">
                        <div class="grid grid-2">
                            ${this.input('unit-price', 'unit-price', 1200000)}
                            ${this.input('loan-amount', 'loan-amount-auto', 900000)}
                            ${this.input('tenor', 'tenor-years', 20, 1)}
                        </div>
                        <button class="btn-primary" type="submit"><span data-i18n="calculate">Calculate</span></button>
                    </form>
                    <div data-results="escalating" data-initiative="${initiativeKey}" style="margin-top: var(--spacing-lg);"></div>
                </div>
            </div>
        `;
    }

    static input(name, labelKey, value = '', min = 0) {
        return `<div class="form-group"><label data-i18n="${labelKey}"></label><input type="number" name="${name}" min="${min}" value="${value}" required></div>`;
    }

    static select(name, labelKey, options, selectedValue) {
        return `<div class="form-group"><label data-i18n="${labelKey}"></label><select name="${name}">${options.map((o) => `<option value="${o.value}" ${o.value === selectedValue ? 'selected' : ''} data-i18n="${o.label}">${i18n.t(o.label)}</option>`).join('')}</select></div>`;
    }

    static attachListeners() {
        document.querySelectorAll('[data-main-tab]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.mainTab;
                document.querySelectorAll('[data-main-tab]').forEach((b) => b.classList.toggle('active', b === btn));
                document.querySelectorAll('[data-main-content]').forEach((c) => c.classList.toggle('active', c.dataset.mainContent === tab));
            });
        });

        document.querySelectorAll('[data-sub-tab]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const initiative = btn.dataset.initiative;
                const tab = btn.dataset.subTab;
                document.querySelectorAll(`[data-sub-tab][data-initiative="${initiative}"]`).forEach((b) => b.classList.toggle('active', b === btn));
                document.querySelectorAll(`[data-inner-content][data-initiative="${initiative}"]`).forEach((c) => c.classList.toggle('active', c.dataset.innerContent === tab));
            });
        });

        document.querySelectorAll('form[data-form]').forEach((form) => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculate(form);
            });
        });

        document.querySelectorAll('form[data-form="fixed"], form[data-form="escalating"]').forEach((form) => {
            const unitPriceInput = form.querySelector('input[name="unit-price"]');
            const loanInput = form.querySelector('input[name="loan-amount"]');
            const initiative = this.initiatives[form.dataset.initiative];

            const syncLoanByLtv = () => {
                const unitPrice = Number(unitPriceInput.value || 0);
                const tier = initiative.getTier(unitPrice);
                if (!tier) return;
                loanInput.value = Math.floor(Math.min(unitPrice * tier.ltv, tier.maxLoan));
            };

            unitPriceInput.addEventListener('input', syncLoanByLtv);
            syncLoanByLtv();
        });
    }

    static calculate(form) {
        const type = form.dataset.form;
        const initiative = this.initiatives[form.dataset.initiative];
        const data = Object.fromEntries(new FormData(form).entries());
        const requestedTenor = Number(data.tenor);
        const tenor = Math.min(requestedTenor, initiative.maxTenor);
        const unitPrice = Number(data['unit-price']);
        const tier = initiative.getTier(unitPrice);
        const limitByLtv = tier ? unitPrice * tier.ltv : 0;
        const limitByPolicy = tier ? tier.maxLoan : 0;
        const cap = Math.max(0, Math.min(limitByLtv, limitByPolicy));

        let html = requestedTenor > initiative.maxTenor ? `<div class="warning-box">${i18n.t('tenor-capped-warning').replace('{max}', initiative.maxTenor)}</div>` : '';

        if (type === 'max-income') {
            const income = Number(data.income);
            const obligations = Number(data.obligations);
            const incomeType = data['income-type'] || 'individual';
            const incomeCap = incomeType === 'family' ? initiative.maxFamilyIncome : initiative.maxIndividualIncome;
            const dbrCapacity = income * initiative.dbr;
            const available = Math.max(0, dbrCapacity - obligations);
            const n = tenor * 12;
            const r = initiative.rate / 12;
            const fixedPotential = this.pvAnnuity(available, r, n);
            const maxFixed = Math.min(fixedPotential, cap);
            const fixedInstallment = maxFixed > 0 ? this.pmt(maxFixed, r, n) : 0;
            const factor = this.getEscalatingFactor(initiative.key, r, n);
            const escalatingPotential = available * factor;
            const maxEsc = Math.min(escalatingPotential, cap);
            const escYear1 = maxEsc > 0 ? maxEsc / factor : 0;
            const warnings = this.getEligibilityWarnings({ initiative, unitPrice, income, incomeCap, tier, fixedPotential, escalatingPotential, limitByLtv, limitByPolicy });

            html += this.metrics([
                ['dbr-capacity', dbrCapacity],
                ['obligations-used', obligations],
                ['available-installment', available],
                ['max-fixed-loan', maxFixed],
                ['fixed-installment', fixedInstallment],
                ['max-escalating-loan', maxEsc],
                ['year-1-installment', escYear1],
                ...(initiative.adminFee ? [['admin-fee-amount', maxFixed * initiative.adminFee]] : []),
                ...(tier?.name ? [['detected-tier', i18n.t(tier.name)]] : [])
            ]);

            if (warnings.length) html += `<div class="warning-box">${warnings.map((w) => `<div>${w}</div>`).join('')}</div>`;
        }

        if (type === 'fixed') {
            const loanAmount = Number(data['loan-amount']);
            const n = tenor * 12;
            const r = initiative.rate / 12;
            const monthly = this.pmt(loanAmount, r, n);
            const total = monthly * n;
            const interest = total - loanAmount;
            html += this.metrics([
                ['fixed-installment', monthly],
                ['total-payment', total],
                ['total-interest', interest],
                ...(initiative.adminFee ? [['admin-fee-amount', loanAmount * initiative.adminFee]] : [])
            ]);
            if (tier && loanAmount > cap) html += `<div class="warning-box"><div>${i18n.t('eligibility-ltv-cap')}</div></div>`;
            if (!tier) html += `<div class="warning-box"><div>${i18n.t('eligibility-unit-range')}</div></div>`;
            html += this.renderScheduleTable(this.buildFixedSchedule(loanAmount, monthly, r, tenor), 'fixed-installment');
        }

        if (type === 'escalating') {
            const loanAmount = Number(data['loan-amount']);
            const result = this.solveEscalating(initiative.key, loanAmount, tenor, initiative.rate / 12);
            html += this.metrics([
                ['year-1-installment', result.year1],
                ['total-payment', result.totalPayment],
                ['total-interest', result.totalPayment - loanAmount],
                ...(initiative.adminFee ? [['admin-fee-amount', loanAmount * initiative.adminFee]] : [])
            ]);
            if (tier && loanAmount > cap) html += `<div class="warning-box"><div>${i18n.t('eligibility-ltv-cap')}</div></div>`;
            if (!tier) html += `<div class="warning-box"><div>${i18n.t('eligibility-unit-range')}</div></div>`;
            html += this.renderScheduleTable(result.schedule, 'escalating-installment');
        }

        const out = document.querySelector(`[data-results="${type}"][data-initiative="${initiative.key}"]`);
        out.innerHTML = html;
        i18n.updatePageText();
    }

    static getEligibilityWarnings({ initiative, unitPrice, income, incomeCap, tier, fixedPotential, escalatingPotential, limitByLtv, limitByPolicy }) {
        const warnings = [];
        if (!tier) warnings.push(i18n.t('eligibility-unit-range'));
        if (income > incomeCap) warnings.push(i18n.t('eligibility-income-max'));
        if (fixedPotential > limitByLtv || escalatingPotential > limitByLtv) warnings.push(i18n.t('eligibility-ltv-cap'));
        if (fixedPotential > limitByPolicy || escalatingPotential > limitByPolicy) warnings.push(i18n.t('eligibility-loan-cap'));
        if (unitPrice <= 0) warnings.push(i18n.t('eligibility-unit-range'));
        return warnings;
    }

    static getEscalatingFactor(type, r, n) {
        let factor = 0;
        for (let m = 1; m <= n; m++) {
            let stepUp = 1;
            if (type === 'cbe8') stepUp = Math.pow(1 + 0.05 / 12, m - 1);
            if (type === 'cbe12') stepUp = m <= 120 ? Math.pow(1 + 0.07, Math.floor((m - 1) / 12)) : Math.pow(1 + 0.07, 9);
            factor += stepUp / Math.pow(1 + r, m);
        }
        return factor;
    }

    static solveEscalating(type, pv, tenor, r) {
        const n = tenor * 12;
        const factor = this.getEscalatingFactor(type, r, n);
        const year1 = pv / factor;
        let balance = pv;
        const schedule = [];
        let totalPayment = 0;

        for (let year = 1; year <= tenor; year++) {
            let annualPayment = 0;
            for (let month = 1; month <= 12; month++) {
                const m = (year - 1) * 12 + month;
                if (m > n) break;
                let payment = year1;
                if (type === 'cbe8') payment = year1 * Math.pow(1 + 0.05 / 12, m - 1);
                if (type === 'cbe12') payment = m <= 120 ? year1 * Math.pow(1 + 0.07, year - 1) : year1 * Math.pow(1 + 0.07, 9);
                const interest = balance * r;
                balance = Math.max(0, balance + interest - payment);
                annualPayment += payment;
            }
            totalPayment += annualPayment;
            schedule.push({ year, monthly: annualPayment / 12, annual: annualPayment, balance });
        }
        return { year1, totalPayment, schedule };
    }

    static buildFixedSchedule(pv, payment, r, tenor) {
        let balance = pv;
        const schedule = [];
        for (let year = 1; year <= tenor; year++) {
            let annualPayment = 0;
            for (let m = 1; m <= 12; m++) {
                const interest = balance * r;
                balance = Math.max(0, balance + interest - payment);
                annualPayment += payment;
            }
            schedule.push({ year, monthly: payment, annual: annualPayment, balance });
        }
        return schedule;
    }

    static metrics(rows) {
        return `<div class="grid grid-2">${rows.map(([k, v]) => `<div class="card"><strong data-i18n="${k}"></strong><div>${typeof v === 'number' ? this.currency(v) : v}</div></div>`).join('')}</div>`;
    }

    static renderScheduleTable(schedule, paymentLabelKey) {
        return `<div class="results-table-wrapper"><table class="results-table"><thead><tr><th data-i18n="year"></th><th data-i18n="${paymentLabelKey}"></th><th data-i18n="annual-payment"></th><th data-i18n="remaining-balance"></th></tr></thead><tbody>${schedule.map((s) => `<tr><td>${s.year}</td><td>${this.currency(s.monthly)}</td><td>${this.currency(s.annual)}</td><td>${this.currency(s.balance)}</td></tr>`).join('')}</tbody></table></div>`;
    }

    static currency(v) { return `${Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 })} EGP`; }
    static pvAnnuity(payment, r, n) { return payment * (1 - Math.pow(1 + r, -n)) / r; }
    static pmt(pv, r, n) { return (pv * r) / (1 - Math.pow(1 + r, -n)); }
}

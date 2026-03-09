// cash-loans.js - Cash Loans Section Landing Page

import { i18n } from '../i18n.js';
import { LoansPage } from './loans.js';

export class CashLoansPage {
    static render() {
        return `
            <div class="container">
                <div style="margin-bottom: var(--spacing-2xl); text-align: center;">
                    <h1><i class="fas fa-wallet" style="color: var(--secondary);"></i> <span data-i18n="cash-loans-title">Cash Loans</span></h1>
                    <p class="text-muted" data-i18n="cash-loans-desc">Choose the cash loan type that fits your profile</p>
                </div>

                <div class="grid grid-2 loans-sections-grid" style="margin-top: var(--spacing-lg);">
                    ${LoansPage.renderLoanCard({
                        route: 'secured-loans',
                        icon: 'fa-shield-alt',
                        gradient: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        titleKey: 'secured-loans-title',
                        titleFallback: 'Secured Loans',
                        descKey: 'secured-loans-desc',
                        descFallback: 'Calculate loans backed by certificates of deposit',
                        items: [
                            { key: 'smart-investment', fallback: 'Smart Investment Tool' },
                            { key: 'smart-optimizer', fallback: 'Smart Loan Optimizer' },
                            { key: 'loan-calculator', fallback: 'Loan Calculator' },
                            { key: 'max-loan-calc', fallback: 'Max Loan Calculator' }
                        ]
                    })}

                    ${LoansPage.renderLoanCard({
                        route: 'unsecured-loans',
                        icon: 'fa-handshake',
                        gradient: 'linear-gradient(135deg, var(--secondary), var(--secondary-dark))',
                        titleKey: 'unsecured-loans-title',
                        titleFallback: 'Unsecured Loans',
                        descKey: 'unsecured-loans-desc',
                        descFallback: 'Personal loans based on income and employment',
                        items: [
                            { key: 'salary-transfer-loans', fallback: 'Salary Transfer Loans' },
                            { key: 'income-proof-loans', fallback: 'Income Proof Loans' },
                            { key: 'business-owner-loans', fallback: 'Business Owner Loans' },
                            { key: 'pension-loans', fallback: 'Pension Loans' }
                        ]
                    })}
                </div>
            </div>
        `;
    }

    static async init() {
        const router = window.app?.router;
        if (router) {
            router.render(this.render());
            i18n.updatePageText();
        }
    }
}

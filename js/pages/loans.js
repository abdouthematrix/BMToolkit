// loans.js - Loans Landing Page

import { i18n } from '../i18n.js';

export class LoansPage {
    static renderLoanCard({ route, icon, gradient, titleKey, titleFallback, descKey, descFallback, items }) {
        return `
            <div class="card" style="cursor: pointer; transition: var(--transition);" onclick="window.location.hash='${route}'">
                <div class="card-header">
                    <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                        <div style="width: 60px; height: 60px; background: ${gradient}; border-radius: var(--border-radius); display: flex; align-items: center; justify-content: center;">
                            <i class="fas ${icon}" style="font-size: 1.75rem; color: white;"></i>
                        </div>
                        <div>
                            <h3 class="card-title mb-0" data-i18n="${titleKey}">${titleFallback}</h3>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <p data-i18n="${descKey}">${descFallback}</p>
                    <ul style="list-style: none; padding: 0; margin-top: var(--spacing-md);">
                        ${items.map((item, index) => `
                            <li style="padding: var(--spacing-sm) 0; ${index < items.length - 1 ? 'border-bottom: 1px solid var(--border-color);' : ''}">
                                <i class="fas fa-check-circle" style="color: var(--secondary); margin-right: var(--spacing-sm);"></i>
                                <span data-i18n="${item.key}">${item.fallback}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div class="card-footer">
                    <button class="btn-primary" style="width: 100%;">
                        <span data-i18n="get-started">Get Started</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    static render() {
        return `
            <div class="container">
                <div style="margin-bottom: var(--spacing-2xl); text-align: center;">
                    <h1><i class="fas fa-landmark" style="color: var(--primary);"></i> <span data-i18n="loans-title">Loans</span></h1>
                    <p class="text-muted" data-i18n="loans-desc">Choose your loan type to start calculating</p>
                </div>

                <div class="grid grid-3 loans-sections-grid" style="margin-top: var(--spacing-lg);">
                    ${this.renderLoanCard({
                        route: 'loans/cash',
                        icon: 'fa-hand-holding-dollar',
                        gradient: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        titleKey: 'unsecured-loans-title',
                        titleFallback: 'Cash Loans',
                        descKey: 'unsecured-loans-desc',
                        descFallback: 'Secured + unsecured cash loan tools',
                        items: [
                            { key: 'secured-loans-title', fallback: 'Secured Loans' },
                            { key: 'unsecured-loans-title', fallback: 'Cash Loans' },
                            { key: 'max-loan-by-income', fallback: 'Max Loan by Income' },
                            { key: 'loan-schedule', fallback: 'Loan Schedule' }
                        ]
                    })}

                    ${this.renderLoanCard({
                        route: 'loans/mortgage',
                        icon: 'fa-house',
                        gradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                        titleKey: 'mortgage-title',
                        titleFallback: 'Mortgage',
                        descKey: 'mortgage-desc',
                        descFallback: 'CBE initiatives with fixed and escalating plans',
                        items: [
                            { key: 'tab-cbe-8', fallback: 'CBE 8% Initiative' },
                            { key: 'tab-cbe-12', fallback: 'CBE 12% Initiative' },
                            { key: 'tab-fixed', fallback: 'Fixed Installment' },
                            { key: 'tab-escalating', fallback: 'Escalating Installment' }
                        ]
                    })}

                    ${this.renderLoanCard({
                        route: 'loans/advanced',
                        icon: 'fa-puzzle-piece',
                        gradient: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                        titleKey: 'advancedtools-title',
                        titleFallback: 'Advanced Tools',
                        descKey: 'advancedtools-desc',
                        descFallback: 'Deep-dive calculations for specialized scenarios',
                        items: [
                            { key: 'first-month-interest', fallback: 'First Month Interest' },
                            { key: 'amortization-schedule', fallback: 'Amortization Schedule' },
                            { key: 'loan-term-months', fallback: 'Loan Term (Months)' },
                            { key: 'payment-date', fallback: 'Payment Date' }
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

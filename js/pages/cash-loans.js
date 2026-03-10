import { i18n } from '../i18n.js';

export class CashLoansPage {
    static activeTab = 'secured';

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
                    <h1><i class="fas fa-hand-holding-dollar" style="color: var(--primary);"></i> <span data-i18n="unsecured-loans-title">Cash Loans</span></h1>
                    <p class="text-muted">Secured + Unsecured</p>
                </div>

                <div class="tabs">
                    <button class="tab-btn active" data-tab="secured"><span data-i18n="secured-loans-title">Secured Loans</span></button>
                    <button class="tab-btn" data-tab="unsecured"><span data-i18n="unsecured-loans-title">Cash Loans</span></button>
                </div>

                <div class="tab-content active" data-tab-content="secured">
                    <div class="card" style="margin-top: var(--spacing-lg);">
                        <div class="card-body">
                            <p data-i18n="secured-loans-desc">Leverage your Certificates of Deposit (CDs) for funding</p>
                            <button class="btn-primary" onclick="window.location.hash='secured-loans'">
                                <span data-i18n="get-started">Start Calculation</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="tab-content" data-tab-content="unsecured">
                    <div class="card" style="margin-top: var(--spacing-lg);">
                        <div class="card-body">
                            <p data-i18n="unsecured-loans-desc">Personal loans based on income and employment</p>
                            <button class="btn-primary" onclick="window.location.hash='unsecured-loans'">
                                <span data-i18n="get-started">Start Calculation</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static attachListeners() {
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                document.querySelectorAll('[data-tab]').forEach(el => el.classList.toggle('active', el === btn));
                document.querySelectorAll('[data-tab-content]').forEach(c => c.classList.toggle('active', c.dataset.tabContent === tab));
            });
        });
    }
}

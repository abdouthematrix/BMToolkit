// home.js - Home Page

import { i18n } from '../i18n.js';

export class HomePage {
    static render() {
        return `
            <div class="container">
                <!-- Hero Section -->
                <div style="text-align: center; padding: var(--spacing-2xl) 0;">
                    <h1 data-i18n="home-title">Welcome to BMToolkit</h1>
                    <p class="text-muted" data-i18n="home-subtitle" style="font-size: 1.25rem; max-width: 600px; margin: 0 auto;">
                        Your financial calculator for smart decisions
                    </p>
                </div>

                <!-- Feature Cards -->
                <div class="grid grid-2" style="margin-top: var(--spacing-2xl);">
                    <!-- Secured Loans -->
                    <div class="card" style="cursor: pointer; transition: var(--transition);" onclick="window.location.hash='secured-loans'">
                        <div class="card-header">
                            <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); border-radius: var(--border-radius); display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-shield-alt" style="font-size: 1.75rem; color: white;"></i>
                                </div>
                                <div>
                                    <h3 class="card-title mb-0" data-i18n="secured-loans-title">Secured Loans</h3>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <p data-i18n="secured-loans-desc">Calculate loans backed by certificates of deposit</p>
                            
                            <ul style="list-style: none; padding: 0; margin-top: var(--spacing-md);">
                                <li style="padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-color);">
                                    <i class="fas fa-check-circle" style="color: var(--secondary); margin-right: var(--spacing-sm);"></i>
                                    <span data-i18n="smart-investment">Smart Investment Tool</span>
                                </li>
                                <li style="padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-color);">
                                    <i class="fas fa-check-circle" style="color: var(--secondary); margin-right: var(--spacing-sm);"></i>
                                    <span data-i18n="smart-optimizer">Smart Loan Optimizer</span>
                                </li>
                                <li style="padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-color);">
                                    <i class="fas fa-check-circle" style="color: var(--secondary); margin-right: var(--spacing-sm);"></i>
                                    <span data-i18n="loan-calculator">Loan Calculator</span>
                                </li>
                                <li style="padding: var(--spacing-sm) 0;">
                                    <i class="fas fa-check-circle" style="color: var(--secondary); margin-right: var(--spacing-sm);"></i>
                                    <span data-i18n="max-loan-calc">Max Loan Calculator</span>
                                </li>
                            </ul>
                        </div>
                        <div class="card-footer">
                            <button class="btn-primary" style="width: 100%;">
                                <span data-i18n="get-started">Get Started</span>
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Unsecured Loans -->
                    <div class="card" style="cursor: pointer; transition: var(--transition);" onclick="window.location.hash='unsecured-loans'">
                        <div class="card-header">
                            <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--secondary), var(--secondary-dark)); border-radius: var(--border-radius); display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-handshake" style="font-size: 1.75rem; color: white;"></i>
                                </div>
                                <div>
                                    <h3 class="card-title mb-0" data-i18n="unsecured-loans-title">Unsecured Loans</h3>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <p data-i18n="unsecured-loans-desc">Personal loans based on income and employment</p>
                            
                            <ul style="list-style: none; padding: 0; margin-top: var(--spacing-md);">
                                <li style="padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-color);">
                                    <i class="fas fa-check-circle" style="color: var(--secondary); margin-right: var(--spacing-sm);"></i>
                                    Salary Transfer Loans
                                </li>
                                <li style="padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-color);">
                                    <i class="fas fa-check-circle" style="color: var(--secondary); margin-right: var(--spacing-sm);"></i>
                                    Income Proof Loans
                                </li>
                                <li style="padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-color);">
                                    <i class="fas fa-check-circle" style="color: var(--secondary); margin-right: var(--spacing-sm);"></i>
                                    Business Owner Loans
                                </li>
                                <li style="padding: var(--spacing-sm) 0;">
                                    <i class="fas fa-check-circle" style="color: var(--secondary); margin-right: var(--spacing-sm);"></i>
                                    Pension Loans
                                </li>
                            </ul>
                        </div>
                        <div class="card-footer">
                            <button class="btn-primary" style="width: 100%;">
                                <span data-i18n="get-started">Get Started</span>
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Info Section -->
                <div style="margin-top: var(--spacing-2xl); text-align: center;">
                    <div class="info-box" style="max-width: 800px; margin: 0 auto;">
                        <i class="fas fa-info-circle" style="font-size: 1.5rem; color: var(--secondary);"></i>
                        <p style="margin: var(--spacing-md) 0 0 0;">
                            ${i18n.currentLanguage === 'ar' 
                                ? 'استخدم حاسباتنا المالية لاتخاذ قرارات مستنيرة. جميع الحسابات دقيقة وتعتمد على أحدث المعدلات من البنك.'
                                : 'Use our financial calculators to make informed decisions. All calculations are accurate and based on the latest bank rates.'}
                        </p>
                    </div>
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

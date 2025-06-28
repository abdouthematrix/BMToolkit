// calculators/loan-calculator.js
import { BaseCalculator } from './base-calculator.js';
import { FinancialCalculator } from '../financial-calculations.js';
import { translate } from '../translations.js';

export class LoanCalculator extends BaseCalculator {
    async calculate() {
        try {
            // Validate inputs
            const inputs = this.getInputs();
            if (!this.validateInputs(inputs)) {
                return;
            }

            this.showLoading();
            
            // Perform calculation
            const results = FinancialCalculator.calculateLoanSchedule(
                inputs.principal,
                inputs.annualRate,
                inputs.minTenor,
                inputs.maxTenor,
                this.appState.isYears
            );

            // Display results
            this.displayResults(results);
            
        } catch (error) {
            this.handleError(error);
        }
    }

    getInputs() {
        return {
            principal: this.getNumericValue('principal'),
            annualRate: this.getNumericValue('interestRate') / 100,
            minTenor: this.getNumericValue('minTenor'),
            maxTenor: this.getNumericValue('maxTenor')
        };
    }

    getNumericValue(id) {
        const element = document.getElementById(id);
        return element ? parseFloat(element.value) : 0;
    }

    validateInputs(inputs) {
        const { principal, annualRate, minTenor, maxTenor } = inputs;
        
        if (!principal || !annualRate || !minTenor || !maxTenor) {
            this.showError(translate('invalidInput', this.appState.currentLanguage));
            return false;
        }

        if (minTenor > maxTenor) {
            // Auto-fix: swap values
            [inputs.minTenor, inputs.maxTenor] = [maxTenor, minTenor];
        }

        return true;
    }

    displayResults(results) {
        const t = translate('', this.appState.currentLanguage);
        const resultsGrid = document.getElementById('resultsGrid');
        
        const html = this.generateResultsTable(results, t);
        resultsGrid.innerHTML = html;
        
        this.hideLoading();
        this.scrollToResults();
    }

    generateResultsTable(results, translations) {
        let html = `
            <div class="table-container">
                <table id="resultsTable">
                    <thead>
                        <tr>
                            <th>${translations.loanTerm}</th>
                            <th>${translations.monthlyPayment}</th>
                            <th>${translations.totalPayment}</th>
                            <th>${translations.totalInterest}</th>
                            <th>${translations.flatRate}</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        results.forEach(result => {
            html += `
                <tr>
                    <td>${result.tenor}</td>
                    <td>${this.formatCurrency(result.monthlyPayment)}</td>
                    <td>${this.formatCurrency(result.totalPayment)}</td>
                    <td>${this.formatCurrency(result.totalInterest)}</td>
                    <td>${result.flatRate.toFixed(2)}%</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }

    scrollToResults() {
        document.getElementById('results')?.scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    handleError(error) {
        console.error('Loan calculation error:', error);
        this.hideLoading();
        const message = this.appState.currentLanguage === 'ar' 
            ? 'حدث خطأ في العملية الحسابية' 
            : 'An error occurred during calculation';
        this.showError(message);
    }
}

// Export the calculate function for the main app
export function calculate(appState) {
    const calculator = new LoanCalculator(appState);
    return calculator.calculate();
}
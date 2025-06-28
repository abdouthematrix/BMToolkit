    // calculators/max-loan-calculator.js
import { BaseCalculator } from './base-calculator.js';
import { FinancialCalculator } from '../financial-calculations.js';
import { translate } from '../translations.js';

export class MaxLoanCalculator extends BaseCalculator {
    async calculate() {
        try {
            // Hide error frame
            this.hideError();

            // Validate inputs
            const inputs = this.getInputs();
            if (!this.validateInputs(inputs)) {
                return;
            }

            this.showLoading();
            
            // Perform calculation based on mode
            const results = this.appState.isIncomeMode 
                ? this.calculateByIncome(inputs)
                : this.calculateByPayment(inputs);

            if (results.length === 0) {
                const message = this.appState.currentLanguage === 'ar' 
                    ? 'لا توجد نتائج صالحة للعرض' 
                    : 'No valid results to display';
                this.showError(message);
                return;
            }

            // Display results
            this.displayResults(results);
            
        } catch (error) {
            this.handleError(error);
        }
    }

    getInputs() {
        const common = {
            annualRate: this.getNumericValue('interestRate') / 100,
            minTenor: parseInt(this.getNumericValue('minTenor')),
            maxTenor: parseInt(this.getNumericValue('maxTenor'))
        };

        if (this.appState.isIncomeMode) {
            return {
                ...common,
                monthlyIncome: this.getNumericValue('monthlyIncome'),
                monthlyInstallments: this.getNumericValue('monthlyInstallments') || 0,
                maxDTI: this.getNumericValue('maxDTI') / 100
            };
        } else {
            return {
                ...common,
                fixedPayment: this.getNumericValue('fixedPayment')
            };
        }
    }

    getNumericValue(id) {
        const element = document.getElementById(id);
        return element ? parseFloat(element.value) : 0;
    }

    validateInputs(inputs) {
        const { annualRate, minTenor, maxTenor } = inputs;
        
        if (!annualRate || annualRate <= 0 || !minTenor || !maxTenor || minTenor < 1 || maxTenor < 1) {
            this.showError(translate('errorInvalid', this.appState.currentLanguage));
            return false;
        }

        if (annualRate > 1) {
            const message = this.appState.currentLanguage === 'ar' 
                ? 'يرجى إدخال معدل الفائدة كنسبة مئوية'
                : 'Please enter interest rate as percentage';
            this.showError(message);
            return false;
        }

        // Auto-fix tenor order
        if (minTenor > maxTenor) {
            [inputs.minTenor, inputs.maxTenor] = [maxTenor, minTenor];
        }

        if (this.appState.isIncomeMode) {
            const { monthlyIncome, maxDTI } = inputs;
            if (!monthlyIncome || monthlyIncome <= 0 || !maxDTI || maxDTI <= 0 || maxDTI > 1) {
                this.showError(translate('errorInvalid', this.appState.currentLanguage));
                return false;
            }
        } else {
            const { fixedPayment } = inputs;
            if (!fixedPayment || fixedPayment <= 0) {
                this.showError(translate('errorInvalid', this.appState.currentLanguage));
                return false;
            }
        }

        return true;
    }

    calculateByIncome(inputs) {
        const { annualRate, minTenor, maxTenor, monthlyIncome, monthlyInstallments, maxDTI } = inputs;
        
        const maxMonthlyPayment = (monthlyIncome * maxDTI) - monthlyInstallments;
        
        if (maxMonthlyPayment <= 0) {
            const message = this.appState.currentLanguage === 'ar' 
                ? 'القدرة على السداد سالبة أو صفر'
                : 'Payment capacity is negative or zero';
            this.showError(message);
            return [];
        }

        return this.generateLoanResults(annualRate, minTenor, maxTenor, maxMonthlyPayment);
    }

    calculateByPayment(inputs) {
        const { annualRate, minTenor, maxTenor, fixedPayment } = inputs;
        return this.generateLoanResults(annualRate, minTenor, maxTenor, fixedPayment);
    }

    generateLoanResults(annualRate, minTenor, maxTenor, monthlyPayment) {
        const results = [];
        
        for (let tenor = minTenor; tenor <= maxTenor; tenor++) {
            const tenorMonths = this.appState.isYears ? tenor * 12 : tenor;
            const monthlyRate = annualRate / 12;
            const maxLoan = FinancialCalculator.PV(monthlyRate, tenorMonths, monthlyPayment);
            
            if (maxLoan > 0) {
                const totalPayment = monthlyPayment * tenorMonths;
                const totalInterest = totalPayment - maxLoan;
                const flatRate = (totalInterest / maxLoan / (tenorMonths / 12)) * 100;
                
                results.push({
                    tenor,
                    maxLoan,
                    monthlyPayment,
                    totalPayment,
                    totalInterest,
                    flatRate
                });
            }
        }

        return results;
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
                            <th>${translations.maxLoanAmount}</th>
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
                    <td>${this.formatCurrency(result.maxLoan.toFixed(0))}</td>
                    <td>${this.formatCurrency(result.monthlyPayment.toFixed(0))}</td>
                    <td>${this.formatCurrency(result.totalPayment.toFixed(0))}</td>
                    <td>${this.formatCurrency(result.totalInterest.toFixed(0))}</td>
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

    hideError() {
        const errorFrame = document.getElementById('errorFrame');
        if (errorFrame) errorFrame.style.display = 'none';
    }

    scrollToResults() {
        document.getElementById('results')?.scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    handleError(error) {
        console.error('Max loan calculation error:', error);
        this.hideLoading();
        const message = this.appState.currentLanguage === 'ar' 
            ? 'حدث خطأ في العملية الحسابية' 
            : 'An error occurred during calculation';
        this.showError(message);
    }
}

// Export the calculate function for the main app
export function calculate(appState) {
    const calculator = new MaxLoanCalculator(appState);
    return calculator.calculate();
}
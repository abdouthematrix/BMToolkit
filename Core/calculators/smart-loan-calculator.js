// calculators/smart-loan-calculator.js
import { BaseCalculator } from './base-calculator.js';
import { FinancialCalculator } from '../financial-calculations.js';
import { translate } from '../translations.js';

export class SmartLoanCalculator extends BaseCalculator {
    async calculate() {
        try {
            // Validate inputs
            const inputs = this.getInputs();
            if (!this.validateInputs(inputs)) {
                return;
            }

            this.showLoading();
            
            // Simulate processing delay for better UX
            await new Promise(resolve => setTimeout(resolve, 300));

            // Perform calculation
            const results = await this.calculateSmartLoan(inputs);

            // Display results
            this.displayResults(results);
            
        } catch (error) {
            this.handleError(error);
        }
    }

    getInputs() {
        let loanTerm = parseFloat(this.getNumericValue('loanTerm'));
        
        // Convert to months if in years
        if (this.appState.isYears) {
            loanTerm = loanTerm * 12;
        }

        return {
            principal: this.getNumericValue('principal'),
            cdRate: this.getNumericValue('cdRate') / 100,
            loanRate: this.getNumericValue('interestRate') / 100,
            loanTerm
        };
    }

    getNumericValue(id) {
        const element = document.getElementById(id);
        return element ? parseFloat(element.value) : 0;
    }

    validateInputs(inputs) {
        const { principal, cdRate, loanRate, loanTerm } = inputs;
        
        if (!principal || principal <= 0 || !cdRate || cdRate <= 0 || 
            !loanRate || loanRate <= 0 || !loanTerm || loanTerm <= 0) {
            const message = this.appState.currentLanguage === 'ar'
                ? 'يرجى إدخال قيم صحيحة وموجبة في جميع الحقول'
                : 'Please enter valid positive values in all fields';
            this.showError(message);
            return false;
        }

        if (loanRate <= cdRate) {
            const message = this.appState.currentLanguage === 'ar'
                ? 'معدل القرض يجب أن يكون أعلى من معدل الوديعة لتحقيق ربح'
                : 'Loan rate should be higher than CD rate to make profit';
            this.showError(message);
            return false;
        }

        return true;
    }

    async calculateSmartLoan(inputs) {
        const { principal, cdRate, loanRate, loanTerm } = inputs;
        
        const maxLoan = principal * 0.9;
        const monthlyRate = loanRate / 12;
        const cdMonthlyRate = cdRate / 12;

        let results = [];
        let bestResult = null;
        let bestGrandTotal = -Infinity;
        let zeroLoanTotal = 0;

        // Optimized calculation with adaptive step size
        const baseStepSize = Math.max(1000, Math.floor(maxLoan / 100));
        let stepSize = baseStepSize;
        
        for (let loanAmount = 0; loanAmount <= maxLoan; loanAmount += stepSize) {
            // Monthly CD income from principal
            const monthlyCDIncome = principal * cdMonthlyRate;

            // Monthly CD income from reinvested loan (if any)
            const roundedLoanAmount = Math.floor(loanAmount / 1000) * 1000;
            const reinvestedIncome = roundedLoanAmount * cdMonthlyRate;

            // Total monthly income
            const totalMonthlyIncome = monthlyCDIncome + reinvestedIncome;

            // Monthly loan payment
            const monthlyPayment = loanAmount > 0 
                ? FinancialCalculator.PMT(monthlyRate, loanTerm, loanAmount) 
                : 0;

            // Net monthly profit
            const netMonthlyProfit = totalMonthlyIncome - monthlyPayment;

            // Adaptive optimization: if we're losing money, reduce step size for precision
            if (loanAmount > 0 && netMonthlyProfit < 0 && stepSize > 100) {
                stepSize = 100;
                loanAmount -= baseStepSize - 100; // Backtrack with smaller steps
                continue;
            }

            // Stop if consistently losing money
            if (loanAmount > maxLoan * 0.5 && netMonthlyProfit < 0) {
                break;
            }

            // Total over the loan term
            const totalCDIncome = totalMonthlyIncome * loanTerm;
            const totalLoanPayments = monthlyPayment * loanTerm;
            const netProfit = totalCDIncome - totalLoanPayments;

            // Grand total
            const grandTotal = principal + loanAmount + netProfit;

            // Store zero loan scenario for comparison
            if (loanAmount === 0) {
                zeroLoanTotal = grandTotal;
            }

            results.push({
                loanAmount,
                totalMonthlyIncome,
                monthlyPayment,
                netMonthlyProfit,
                grandTotal,
                netProfit
            });

            // Track best result
            if (netMonthlyProfit >= 0 && grandTotal > bestGrandTotal) {
                bestGrandTotal = grandTotal;
                bestResult = results[results.length - 1];
            }
        }

        // Filter results to show only meaningful data points
        results = results.filter((result, index) => {
            return index === 0 || // Always include zero loan
                   index === results.length - 1 || // Always include last
                   result.netMonthlyProfit >= 0 || // Include profitable scenarios
                   index % Math.ceil(results.length / 20) === 0; // Sample every nth result
        });

        return {
            results,
            bestResult,
            zeroLoanTotal,
            principal,
            loanTerm
        };
    }

    displayResults(data) {
        const { results, bestResult, zeroLoanTotal, principal, loanTerm } = data;
        
        this.displaySummaryCards(bestResult, zeroLoanTotal, principal, loanTerm);
        this.displayResultsTable(results, bestResult);
        
        this.hideLoading();
        this.scrollToResults();
    }

    displaySummaryCards(bestResult, zeroLoanTotal, principal, loanTerm) {
        const summaryCards = document.getElementById('summaryCards');
        if (!summaryCards) return;

        summaryCards.innerHTML = '';

        if (bestResult) {
            const advantageOverZero = bestResult.grandTotal - zeroLoanTotal;
            const totalAdvantageOverZero = bestResult.grandTotal - principal;
            const percentageGain = (totalAdvantageOverZero / principal) * 100 / (loanTerm / 12);

            const t = translate('summaryCards', this.appState.currentLanguage);

            summaryCards.innerHTML = `
                <div class="summary-card">
                    <h3>${t.optimalLoan}</h3>
                    <div class="value">${this.formatCurrency(bestResult.loanAmount)}</div>
                </div>
                <div class="summary-card">
                    <h3>${t.monthlyProfit}</h3>
                    <div class="value">${this.formatCurrency(bestResult.netMonthlyProfit)}</div>
                </div>
                <div class="summary-card">
                    <h3>${t.maxTotal}</h3>
                    <div class="value">${this.formatCurrency(bestResult.grandTotal)}</div>
                    <div style="font-size: 0.8rem; color: #6b7280; margin-top: 5px;">+${percentageGain.toFixed(2)}${t.gainSuffix}</div>
                </div>
                <div class="summary-card">
                    <h3>${t.advantage}</h3>
                    <div class="value" style="color: #059669">${this.formatCurrency(advantageOverZero)}</div>
                </div>
            `;
        }
    }

    displayResultsTable(results, bestResult) {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        results.forEach(result => {
            const row = document.createElement('tr');
            const isBest = bestResult && Math.abs(result.loanAmount - bestResult.loanAmount) < 1;

            if (isBest) {
                row.classList.add('best-row');
            }

            row.innerHTML = `
                <td>${this.formatCurrency(result.loanAmount)}</td>
                <td>${this.formatCurrency(result.totalMonthlyIncome)}</td>
                <td>${this.formatCurrency(result.monthlyPayment)}</td>
                <td style="color: ${result.netMonthlyProfit >= 0 ? '#059669' : '#dc2626'}">${this.formatCurrency(result.netMonthlyProfit)}</td>
                <td><strong>${this.formatCurrency(result.grandTotal)}</strong></td>
            `;

            tableBody.appendChild(row);
        });
    }

    scrollToResults() {
        document.getElementById('results')?.scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    handleError(error) {
        console.error('Smart loan calculation error:', error);
        this.hideLoading();
        const message = this.appState.currentLanguage === 'ar' 
            ? 'حدث خطأ في العملية الحسابية' 
            : 'An error occurred during calculation';
        this.showError(message);
    }
}

// Export the calculate function for the main app
export function calculate(appState) {
    const calculator = new SmartLoanCalculator(appState);
    return calculator.calculate();
}
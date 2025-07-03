// calculators/amortization-schedule-calculator.js
import { BaseCalculator } from './base-calculator.js';
import { FinancialCalculator } from '../financial-calculations.js';
export class AmortizationScheduleCalculator extends BaseCalculator {
    async calculate() {
        try {
            // Validate inputs
            const inputs = this.getInputs();
            if (!this.validateInputs(inputs)) {
                return;
            }

            this.showLoading();
            
            // Perform calculation
            const results = this.calculateAmortizationSchedule(inputs);

            // Display results
            this.displayResults(results);
            
        } catch (error) {
            this.handleError(error);
        }
    }

    getInputs() {
        return {
            principal: this.getNumericValue('principal'),
            annualRate: this.getNumericValue('interestRate'),
            startDate: this.getDateValue('startDate'),
            loanTerm: this.getNumericValue('loanTerm'),
            stampDutyRate: this.getNumericValue('stampDutyRate'),
        };
    }

    getNumericValue(id) {
        const element = document.getElementById(id);
        return element ? parseFloat(element.value) : 0;
    }

    getDateValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    }

    validateInputs(inputs) {
        const { principal, annualRate, startDate, loanTerm, stampDutyRate } = inputs;
        
        if (!principal || principal <= 0 || !annualRate || annualRate <= 0 || !startDate || !loanTerm || loanTerm <= 0) {
            const message = this.appState.currentLanguage === 'ar' 
                ? 'يرجى إدخال جميع القيم بشكل صحيح وأن تكون أكبر من الصفر'
                : 'Please enter all values correctly and ensure they are greater than zero';
            this.showError(message);
            return false;
        }

        if (annualRate > 100) {
            const message = this.appState.currentLanguage === 'ar' 
                ? 'معدل الفائدة يبدو مرتفعاً جداً'
                : 'Interest rate seems too high';
            this.showError(message);
            return false;
        }
        if (stampDutyRate > annualRate) {
            const message = this.appState.currentLanguage === 'ar'
                ? 'معدل الدمغة يبدو مرتفعاً جداً'
                : 'Stamp rate seems too high';
            this.showError(message);
            return false;
        }
        return true;
    }

    calculateAmortizationSchedule(inputs) {
        const { principal, annualRate, startDate, loanTerm, stampDutyRate } = inputs;

        const startDateObj = new Date(startDate);
        const tempDate = new Date(startDateObj);
        tempDate.setMonth(tempDate.getMonth() + 2);
        const firstPaymentDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), 5);

        const daysBetween = Math.floor((firstPaymentDate - startDateObj) / (1000 * 60 * 60 * 24)) + 1;
        const monthlyRate = annualRate / 100;
        const dailyRate = monthlyRate / (12 * 30);
        const calculationDays = Math.max(0, daysBetween - 30 - 1);
        const interestFactor = dailyRate * calculationDays;
        const firstMonthInterest = principal * interestFactor;

        const numberOfPayments = this.appState.isYears ? loanTerm * 12 : loanTerm;
        const loanMonthlyRate = annualRate / 100 / 12;
        const monthlyPayment = FinancialCalculator.PMT(loanMonthlyRate, numberOfPayments, principal);


        // Generate amortization schedule
        const schedule = [];
        let remainingBalance = principal;
        let totalInterest = 0;
        let totalStampDuty = 0;       

        for (let i = 1; i <= numberOfPayments; i++) {
            const paymentDate = new Date(firstPaymentDate);
            paymentDate.setMonth(paymentDate.getMonth() + (i - 1));           
            const interestPayment = remainingBalance * loanMonthlyRate;
            const principalPayment = monthlyPayment - interestPayment;
            const beginningBalance = remainingBalance;

            remainingBalance -= principalPayment;
            totalInterest += interestPayment;

            let stampDutyAmount = 0; 
            const pmonth = paymentDate.getMonth();
            if (pmonth == 3 - 1 || pmonth == 6 - 1 || pmonth == 9 - 1 || pmonth == 12 - 1)
                stampDutyAmount = remainingBalance * (stampDutyRate / 1000);

            totalStampDuty += stampDutyAmount;

            if (i == 1) {  
                totalInterest += firstMonthInterest;
            }
               

            schedule.push({
                paymentNumber: i,
                paymentDate: paymentDate,
                beginningBalance: beginningBalance,
                monthlyPayment: i === 1 ? monthlyPayment + firstMonthInterest : monthlyPayment,
                interestPayment: i === 1 ? interestPayment + firstMonthInterest : interestPayment,
                principalPayment: principalPayment,
                remainingBalance: Math.max(0, remainingBalance),
                totalInterest: totalInterest,
                stampDutyAmount: stampDutyAmount,
            });
        }


        return {
            results : schedule,
            monthlyPayment,
            totalInterest,
            totalStampDuty,
        };
    }

    displayResults(data) {
        const { results, monthlyPayment, totalInterest, totalStampDuty } = data;

        this.displaySummaryCards(monthlyPayment, totalInterest, totalStampDuty);
        this.displayResultsTable(results);

        this.hideLoading();
        this.scrollToResults();
    }

    displaySummaryCards(monthlyPayment, totalInterest, totalStampDuty) {
        const summaryCards = document.getElementById('summaryCards');
        if (!summaryCards) return;

        const t = this.appState.translate('loan');

        summaryCards.innerHTML = '';
        summaryCards.innerHTML = `
                <div class="summary-card">
                    <h3 data-en="Monthly Payment" data-ar="إجمالي القسط"">${t.monthlyPayment}</h3>
                    <div class="value">${this.formatCurrency(monthlyPayment)}</div>
                </div>
                <div class="summary-card">
                    <h3 data-en="Total Interest" data-ar="اجمالي الفوائد المدفوعة">${t.totalInterest}</h3>
                    <div class="value">${this.formatCurrency(totalInterest)}</div>
                </div>
                <div class="summary-card">
                    <h3 data-en="Total Stamp Duty Amount" data-ar="اجمالي الدمغة النسبية المدفوعة">${t.totalStampDuty}</h3>
                    <div class="value">${this.formatCurrency(totalStampDuty)}
                    </div>                  
                </div>               
            `;

    }

    displayResultsTable(results) {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        results.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.paymentNumber}</td>
                <td>${result.paymentDate.toLocaleDateString()}</td>
                <td>${this.formatCurrency(result.beginningBalance)}</td>
                <td><strong>${this.formatCurrency(result.monthlyPayment)}</strong></td>
                <td>${this.formatCurrency(result.interestPayment)}</td>
                <td>${this.formatCurrency(result.principalPayment)}</td>
                <td><strong>${this.formatCurrency(result.remainingBalance)}</strong></td>
            `;
            if (result.stampDutyAmount > 0) {
                row.innerHTML += `
                <td><strong>${this.formatCurrency(result.stampDutyAmount)}</strong></td>`;
            }
            else {
                row.innerHTML += `
                <td></td>`;
            }


            tableBody.appendChild(row);
        });
    }

    scrollToResults() {
        document.getElementById('results')?.scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    handleError(error) {
        console.error('First month interest calculation error:', error);
        this.hideLoading();
        const message = this.appState.currentLanguage === 'ar' 
            ? 'حدث خطأ في العملية الحسابية' 
            : 'An error occurred during calculation';
        this.showError(message);
    }
}

// Export the calculate function for the main app
export function calculate(appState) {
    const calculator = new AmortizationScheduleCalculator(appState);
    return calculator.calculate();
}
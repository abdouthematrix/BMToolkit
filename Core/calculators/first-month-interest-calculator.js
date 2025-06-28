// calculators/first-month-interest-calculator.js
import { BaseCalculator } from './base-calculator.js';
import { FinancialCalculator } from '../financial-calculations.js';
import { translate } from '../translations.js';

export class FirstMonthInterestCalculator extends BaseCalculator {
    async calculate() {
        try {
            // Validate inputs
            const inputs = this.getInputs();
            if (!this.validateInputs(inputs)) {
                return;
            }

            this.showLoading();
            
            // Perform calculation
            const results = this.calculateFirstMonthInterest(inputs);

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
            tenor: this.getNumericValue('tenor')
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
        const { principal, annualRate, startDate, tenor } = inputs;
        
        if (!principal || principal <= 0 || !annualRate || annualRate <= 0 || !startDate) {
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

        return true;
    }

    calculateFirstMonthInterest(inputs) {
        const { principal, annualRate, startDate, tenor } = inputs;
        
        const startDateObj = new Date(startDate);
        const tempDate = new Date(startDateObj);
        tempDate.setMonth(tempDate.getMonth() + 2);
        const endDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), 5);

        const daysBetween = Math.floor((endDate - startDateObj) / (1000 * 60 * 60 * 24)) + 1;
        const monthlyRate = annualRate / 100;
        const dailyRate = monthlyRate / (12 * 30);
        const calculationDays = Math.max(0, daysBetween - 30 - 1);
        const interestFactor = dailyRate * calculationDays;
        const firstMonthInterest = principal * interestFactor;

        let monthlyPayment = 0;
        let totalFirstMonthlyPayment = 0;
        
        if (tenor > 0) {
            const numberOfPayments = this.appState.isYears ? tenor * 12 : tenor;
            const loanMonthlyRate = annualRate / 100 / 12;
            monthlyPayment = FinancialCalculator.PMT(loanMonthlyRate, numberOfPayments, principal);
            totalFirstMonthlyPayment = firstMonthInterest + monthlyPayment;
        }

        return {
            endDate,
            firstMonthInterest,
            daysBetween,
            calculationDays,
            monthlyPayment,
            totalFirstMonthlyPayment,
            tenor
        };
    }

    displayResults(results) {
        const { endDate, firstMonthInterest, daysBetween, calculationDays, 
                monthlyPayment, totalFirstMonthlyPayment, tenor } = results;

        // Update UI elements
        const endDateEl = document.getElementById('endDate');
        const firstMonthInterestEl = document.getElementById('firstMonthInterest');
        const daysBetweenEl = document.getElementById('daysBetween');
        const calculationDaysEl = document.getElementById('calculationDays');

        if (endDateEl) {
            const locale = this.appState.currentLanguage === 'ar' ? 'ar-EG' : 'en-EG';
            endDateEl.textContent = endDate.toLocaleDateString(locale);
        }
        
        if (firstMonthInterestEl) {
            const valueEl = firstMonthInterestEl.querySelector('.result-value');
            if (valueEl) valueEl.textContent = this.formatCurrency(firstMonthInterest);
        }
        
        if (daysBetweenEl) daysBetweenEl.textContent = daysBetween;
        if (calculationDaysEl) calculationDaysEl.textContent = calculationDays;

        // Show/hide monthly payment sections
        const monthlyPaymentEl = document.getElementById('monthlyPayment');
        const totalFirstMonthlyPaymentEl = document.getElementById('totalFirstMonthlyPayment');
        
        if (tenor > 0 && monthlyPaymentEl && totalFirstMonthlyPaymentEl) {
            monthlyPaymentEl.style.display = '';
            const monthlyValueEl = monthlyPaymentEl.querySelector('.result-value');
            if (monthlyValueEl) monthlyValueEl.textContent = this.formatCurrency(monthlyPayment);
            
            totalFirstMonthlyPaymentEl.style.display = '';
            const totalValueEl = totalFirstMonthlyPaymentEl.querySelector('.result-value');
            if (totalValueEl) totalValueEl.textContent = this.formatCurrency(totalFirstMonthlyPayment);
        } else {
            if (monthlyPaymentEl) monthlyPaymentEl.style.display = 'none';
            if (totalFirstMonthlyPaymentEl) totalFirstMonthlyPaymentEl.style.display = 'none';
        }

        this.hideLoading();
        this.scrollToResults();
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
    const calculator = new FirstMonthInterestCalculator(appState);
    return calculator.calculate();
}
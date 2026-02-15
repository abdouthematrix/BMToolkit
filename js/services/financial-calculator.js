// financial-calculator.js - Financial Calculation Service

export class FinancialCalculator {
    // PMT - Calculate monthly payment
    static PMT(rate, nper, pv) {
        if (rate === 0) return pv / nper;
        return (pv * rate) / (1 - Math.pow(1 + rate, -nper));
    }

    // PV - Calculate present value (loan amount from payment)
    static PV(rate, nper, pmt) {
        if (rate === 0) return pmt * nper;
        return pmt * (1 - Math.pow(1 + rate, -nper)) / rate;
    }

    // Round to nearest 100
    static roundTo100(value) {
        return Math.floor(value / 100) * 100;
    }

    // Round to nearest 1000
    static roundTo1000(value) {
        return Math.floor(value / 1000) * 1000;
    }

    // ===== SECURED LOANS =====

    // Smart Investment Tool - Calculate single scenario
    static calculateScenario(tdAmount, tdRate, years, loanPercent = 0, reinvest = false, constants = {}) {
        const months = years * 12;
        const monthlyCertInterest = (tdAmount * tdRate) / 12;
        const totalCertInterest = tdAmount * tdRate * years;

        let loan = this.roundTo100(tdAmount * loanPercent / 100);

        // Use constants with fallback defaults
        const tdMargin = constants.TD_MARGIN !== undefined ? constants.TD_MARGIN : 0.02;
        const minRate = constants.MIN_RATE !== undefined ? constants.MIN_RATE : 0.18;
        const loanAnnualRate = Math.max(tdRate + tdMargin, minRate);

        const monthlyLoanRate = loanAnnualRate / 12;
        const monthlyInstallment = loan > 0 ? this.PMT(monthlyLoanRate, months, loan) : 0;
        const loanInterest = (monthlyInstallment * months) - loan;

        if (loanPercent === 0) {
            return {
                loan: 0,
                monthlyInterest: monthlyCertInterest,
                monthlyInstallment: 0,
                netMonthlyPay: 0,
                totalInterest: totalCertInterest,
                loanInterest: 0,
                finalAmount: tdAmount + totalCertInterest
            };
        }

        if (reinvest) {
            const loanMonthlyCertInterest = (loan * tdRate) / 12;
            const totalInvest = tdAmount + loan;
            const totalInterest = totalInvest * tdRate * years;
            return {
                loan,
                monthlyInterest: (totalInvest * tdRate) / 12,
                monthlyInstallment,
                netMonthlyPay: monthlyInstallment - loanMonthlyCertInterest - monthlyCertInterest,
                totalInterest,
                loanInterest,
                finalAmount: tdAmount + totalInterest - loanInterest
            };
        }

        return {
            loan,
            monthlyInterest: monthlyCertInterest,
            monthlyInstallment,
            netMonthlyPay: monthlyInstallment - monthlyCertInterest,
            totalInterest: totalCertInterest,
            loanInterest,
            finalAmount: tdAmount + totalCertInterest - loanInterest
        };
    }

    // Smart Investment Tool - All 4 scenarios
    static calculateAllScenarios(tdAmount, tdRate, years, constants = {}) {
        // Use constants with fallback defaults
        const maxLoanPercent = constants.MAX_LOAN_PERCENT !== undefined
            ? constants.MAX_LOAN_PERCENT * 100
            : 90;

        const scenarios = constants.SCENARIOS || {
            INTEREST_UPFRONT_PERCENT: 36,
            LOAN_CERTIFICATE_PERCENT: 58
        };

        const scenariosList = [
            {
                title: 'شهادة فقط',
                titleEn: 'Certificate Only',
                loanPercent: 0,
                reinvest: false
            },
            {
                title: 'الحد الاقصى للقرض',
                titleEn: 'Maximum Loan',
                loanPercent: maxLoanPercent,
                reinvest: false
            },
            {
                title: 'الفائدة مقدماً',
                titleEn: 'Interest Upfront',
                loanPercent: scenarios.INTEREST_UPFRONT_PERCENT,
                reinvest: false
            },
            {
                title: 'قرض وشهادة',
                titleEn: 'Loan + Certificate',
                loanPercent: scenarios.LOAN_CERTIFICATE_PERCENT,
                reinvest: true
            }
        ];

        return scenariosList.map(scenario => ({
            ...scenario,
            ...this.calculateScenario(tdAmount, tdRate, years, scenario.loanPercent, scenario.reinvest, constants)
        }));
    }

    // Smart Loan Investment Optimizer (0-90%)
    static async calculateSmartLoan(inputs, constants = {}) {
        const { principal, cdRate, loanTerm } = inputs;

        // Use constants with fallback defaults
        const maxLoanPercent = constants.MAX_LOAN_PERCENT !== undefined
            ? constants.MAX_LOAN_PERCENT
            : 0.9;
        const tdMargin = constants.TD_MARGIN !== undefined ? constants.TD_MARGIN : 0.02;
        const minRate = constants.MIN_RATE !== undefined ? constants.MIN_RATE : 0.18;

        // Calculate loan rate from CD rate using constants
        const loanRate = Math.max(cdRate + tdMargin, minRate);

        const maxLoan = principal * maxLoanPercent;
        const monthlyRate = loanRate / 12;
        const cdMonthlyRate = cdRate / 12;

        let results = [];
        let bestResult = null;
        let bestGrandTotal = -Infinity;
        let zeroLoanTotal = 0;

        // Optimized calculation with adaptive step size
        const baseStepSize = Math.max(1000, Math.floor(principal / 200));
        let stepSize = baseStepSize;
        const steps = Math.floor(maxLoan / stepSize);

        for (let i = 0; i <= steps; i++) {
            const loanAmount = i * stepSize;

            // Monthly CD income from principal
            const monthlyCDIncome = principal * cdMonthlyRate;

            // Monthly CD income from reinvested loan (if any)
            const roundedLoanAmount = Math.floor(loanAmount / 1000) * 1000;
            const reinvestedIncome = roundedLoanAmount * cdMonthlyRate;

            // Total monthly income
            const totalMonthlyIncome = monthlyCDIncome + reinvestedIncome;

            // Monthly loan payment
            const monthlyPayment = loanAmount > 0
                ? this.PMT(monthlyRate, loanTerm, loanAmount)
                : 0;

            // Net monthly profit
            const netMonthlyProfit = totalMonthlyIncome - monthlyPayment;

            // Stop calculating if we start losing money monthly
            if (loanAmount > 0 && netMonthlyProfit < 0 && i !== steps) {
                i = steps - 1;
                continue;
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
                i += Math.floor((grandTotal - principal) / stepSize) - 1;
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

    // Loan Calculator - Multiple tenors
    static calculateLoanSchedule(principal, annualRate, minTenor, maxTenor, isYears, installmentFrequency = 'monthly') {
        const results = [];
        const paymentsPerYear = installmentFrequency === 'quarterly' ? 4 : 12;
        for (let tenor = minTenor; tenor <= maxTenor; tenor++) {
            const tenorMonths = isYears ? tenor * 12 : tenor;
            const numberOfPayments = tenorMonths * paymentsPerYear / 12;
            const periodicRate = annualRate / paymentsPerYear;

            const installmentAmount = this.PMT(periodicRate, numberOfPayments, principal);
            const totalPayment = installmentAmount * numberOfPayments;
            const totalInterest = totalPayment - principal;
            const flatRate = (totalInterest / principal / (tenorMonths / 12)) * 100;

            results.push({
                tenor,
                tenorMonths,
                installmentAmount,
                monthlyPayment: installmentAmount,
                numberOfPayments,
                paymentsPerYear,
                installmentFrequency,
                totalPayment,
                totalInterest,
                flatRate
            });
        }
        return results;
    }

    // TD Secured Loan - with TD interest frequency and reinvest option
    static calculateTdSecuredLoanResults(inputs, constants = {}) {
        const {
            deposits,
            loanAmount,
            minTenor,
            maxTenor,
            isYears,
            installmentFrequency,
            reinvestLoan
        } = inputs;

        const highestTdRate = Math.max(...deposits.map(d => d.rate));
        const tdMargin = constants.TD_MARGIN !== undefined ? constants.TD_MARGIN : 0.02;
        const minRate = constants.MIN_RATE !== undefined ? constants.MIN_RATE : 0.18;
        const loanRate = Math.max(highestTdRate + tdMargin, minRate);

        const totalTdAmount = deposits.reduce((sum, d) => sum + d.amount, 0);
        const paymentsPerYear = installmentFrequency === 'quarterly' ? 4 : 12;
        const tdPrincipal = reinvestLoan ? totalTdAmount + loanAmount : totalTdAmount;

        const tdDetails = deposits.map(td => {
            const periodicInterest = td.interestFrequency === 'quarterly'
                ? (td.amount * td.rate) / 4
                : (td.amount * td.rate) / 12;
            return {
                ...td,
                periodicInterest
            };
        });

        if (reinvestLoan) {
            const reinvestedPeriodicInterest = installmentFrequency === 'quarterly'
                ? (loanAmount * highestTdRate) / 4
                : (loanAmount * highestTdRate) / 12;

            tdDetails.push({
                amount: loanAmount,
                rate: highestTdRate,
                interestFrequency: installmentFrequency,
                periodicInterest: reinvestedPeriodicInterest,
                isReinvested: true
            });
        }

        const totalTdInterestPerPeriod = tdDetails.reduce((sum, td) => {
            const normalizedMonthly = td.interestFrequency === 'quarterly'
                ? td.periodicInterest / 3
                : td.periodicInterest;
            return sum + (installmentFrequency === 'quarterly' ? normalizedMonthly * 3 : normalizedMonthly);
        }, 0);

        const results = [];
        for (let tenor = minTenor; tenor <= maxTenor; tenor++) {
            const tenorMonths = isYears ? tenor * 12 : tenor;
            const numberOfPayments = tenorMonths * paymentsPerYear / 12;
            const periodicRate = loanRate / paymentsPerYear;
            const installmentAmount = this.PMT(periodicRate, numberOfPayments, loanAmount);
            const totalPayment = installmentAmount * numberOfPayments;

            const tdEarnings = tdPrincipal * highestTdRate * (tenorMonths / 12);
            const paidAmount = installmentAmount - totalTdInterestPerPeriod;
            const totalInterest = totalPayment - loanAmount;
            const flatRate = (totalInterest / loanAmount / (tenorMonths / 12)) * 100;

            results.push({
                tenor,
                tenorMonths,
                installmentAmount,
                paidAmount,
                totalPayment,
                tdEarnings,
                flatRate
            });
        }

        return {
            highestTdRate,
            loanRate,
            tdDetails,
            totalTdInterestPerPeriod,
            results
        };
    }

    // ===== UNSECURED LOANS =====

    // Max Loan by Income
    static calculateByIncome(inputs, constants = {}) {
        const { annualRate, minTenor, maxTenor, monthlyIncome, monthlyInstallments, isYears } = inputs;

        // Use constants with fallback defaults
        const maxDTI = inputs.maxDTI !== undefined
            ? inputs.maxDTI
            : (constants.MAX_DBR_RATIO !== undefined ? constants.MAX_DBR_RATIO : 0.50);

        const maxMonthlyPayment = (monthlyIncome * maxDTI) - monthlyInstallments;

        if (maxMonthlyPayment <= 0) {
            return {
                error: true,
                message: 'Payment capacity is negative or zero'
            };
        }

        return this.generateLoanResults(annualRate, minTenor, maxTenor, maxMonthlyPayment, isYears);
    }

    // Generate loan results for multiple tenors
    static generateLoanResults(annualRate, minTenor, maxTenor, monthlyPayment, isYears, installmentFrequency = 'monthly') {
        const results = [];
        const paymentsPerYear = installmentFrequency === 'quarterly' ? 4 : 12;

        for (let tenor = minTenor; tenor <= maxTenor; tenor++) {
            const tenorMonths = isYears ? tenor * 12 : tenor;
            const numberOfPayments = tenorMonths * paymentsPerYear / 12;
            const periodicRate = annualRate / paymentsPerYear;
            const maxLoan = this.PV(periodicRate, numberOfPayments, monthlyPayment);

            if (maxLoan > 0) {
                const totalPayment = monthlyPayment * numberOfPayments;
                const totalInterest = totalPayment - maxLoan;
                const flatRate = (totalInterest / maxLoan / (tenorMonths / 12)) * 100;

                results.push({
                    tenor,
                    tenorMonths,
                    numberOfPayments,
                    paymentsPerYear,
                    installmentFrequency,
                    maxLoan,
                    installmentAmount: monthlyPayment,
                    monthlyPayment,
                    totalPayment,
                    totalInterest,
                    flatRate
                });
            }
        }

        return results;
    }

    // First Month Interest Calculator
    static calculateFirstMonthInterest(inputs) {
        const { principal, annualRate, startDate, loanTerm, isYears } = inputs;

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

        if (loanTerm > 0) {
            const numberOfPayments = isYears ? loanTerm * 12 : loanTerm;
            const loanMonthlyRate = annualRate / 100 / 12;
            monthlyPayment = this.PMT(loanMonthlyRate, numberOfPayments, principal);
            totalFirstMonthlyPayment = firstMonthInterest + monthlyPayment;
        }

        return {
            endDate,
            firstMonthInterest,
            daysBetween,
            calculationDays,
            monthlyPayment,
            totalFirstMonthlyPayment,
            loanTerm
        };
    }

    // Amortization Schedule with Stamp Duty
    static calculateAmortizationSchedule(inputs) {
        const { principal, annualRate, startDate, loanTerm, stampDutyRate, isYears } = inputs;

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

        const numberOfPayments = isYears ? loanTerm * 12 : loanTerm;
        const loanMonthlyRate = annualRate / 100 / 12;
        const monthlyPayment = this.PMT(loanMonthlyRate, numberOfPayments, principal);

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
            if (pmonth === 2 || pmonth === 5 || pmonth === 8 || pmonth === 11) { // Mar, Jun, Sep, Dec
                stampDutyAmount = remainingBalance * (stampDutyRate);
            }

            totalStampDuty += stampDutyAmount;

            if (i === 1) {
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
            results: schedule,
            monthlyPayment,
            totalInterest,
            totalStampDuty,
        };
    }
}

export class FinancialCalculator {
     /**
     * Calculate monthly payment (Excel PMT equivalent)
     * @param {number} monthlyRate - Monthly interest rate (annual rate / 12)
     * @param {number} numberOfPayments - Number of payments
     * @param {number} principal - Principal amount
     * @returns {number} Monthly payment amount
     */
    static PMT(monthlyRate, numberOfPayments, principal) {
        if (monthlyRate === 0) {
            return principal / numberOfPayments;
        }
        const numerator = principal * monthlyRate;
        const denominator = (1 - Math.pow(1 + monthlyRate, -numberOfPayments));
        return numerator / denominator;
    }
     /**
     * Calculate present value (Excel PV equivalent)
     * @param {number} rate - Interest rate per period
     * @param {number} nper - Number of periods
     * @param {number} pmt - Payment per period
     * @returns {number} Present value
     */
    static PV(rate, nper, pmt) {
        if (rate === 0) {
            return pmt * nper;
        }
        const numerator = 1 - Math.pow(1 + rate, -nper);
        const denominator = rate;
        return pmt * (numerator / denominator);
    }
    /**
     * Calculate loan schedule for multiple tenors
     * @param {number} principal - Loan amount
     * @param {number} annualRate - Annual interest rate (as decimal)
     * @param {number} minTenor - Minimum tenor
     * @param {number} maxTenor - Maximum tenor
     * @param {boolean} isYears - Whether tenor is in years or months
     * @returns {Array} Array of loan schedule objects
     */
    static calculateLoanSchedule(principal, annualRate, minTenor, maxTenor, isYears) {
        const results = [];
        for (let tenor = minTenor; tenor <= maxTenor; tenor++) {
            const tenorMonths = isYears ? tenor * 12 : tenor;
            const monthlyRate = annualRate / 12;
            
            const monthlyPayment = this.PMT(monthlyRate, tenorMonths, principal);
            const totalPayment = monthlyPayment * tenorMonths;
            const totalInterest = totalPayment - principal;
            const flatRate = (totalInterest / principal / (tenorMonths / 12)) * 100;

            results.push({
                tenor,
                tenorMonths,
                monthlyPayment,
                totalPayment,
                totalInterest,
                flatRate
            });
        }
        return results;
    }
}
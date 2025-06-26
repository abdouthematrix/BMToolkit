// Translations
const translations = {
    en: {
        summaryCards: {
            optimalLoan: "Recommended Loan Amount",
            monthlyProfit: "Monthly Net Profit",
            maxTotal: "Maximum Total Return",
            advantage: "Strategy Advantage",
            gainSuffix: "% annual return"
        },
        loanTerm: "Loan Term",
        monthlyPayment: "Monthly Payment",
        totalPayment: "Total Payment",
        totalInterest: "Total Interest",
        flatRate: "Flat Rate",
        invalidInput: "Please enter valid values for all fields",
        loanTerm: "Loan Term",
        incomeMode: "Max Loan by Income",
        paymentMode: "Max Loan by Payment",
        switchToPayment: "Switch to Payment Mode",
        switchToIncome: "Switch to Income Mode",
        calculate: "Calculate",
        reset: "Reset",
        errorInvalid: "Please enter valid values for all fields.",
        maxLoanAmount: "Max Loan Amount",
        monthlyPayment: "Monthly Payment",
        totalPayment: "Total Payment",
        totalInterest: "Total Interest",
        flatRate: "Flat Rate",
        tenor: "Tenor",
        payment: "Payment",
        interest: "Interest",
        min: "Min",
        private: "Private",
        digital: "Digital",
        years: "Years",
        months: "Months",
        maxDBR: "Max DBR",
        minRate: "Min Rate",
    },
    ar: {
        summaryCards: {
            optimalLoan: "المبلغ الأمثل للاقتراض",
            monthlyProfit: "صافي الربح الشهري",
            maxTotal: "أقصى عائد إجمالي",
            advantage: "الفائدة من الاستراتيجية",
            gainSuffix: "% عائد"
        },
        loanTerm: "مدة القرض",
        monthlyPayment: "القسط الشهري",
        totalPayment: "إجمالي المدفوعات",
        totalInterest: "إجمالي الفائدة",
        flatRate: "المعدل الثابت",
        invalidInput: "يرجى إدخال قيم صحيحة في جميع الحقول",
        loanTerm: "مدة القرض",
        incomeMode: "الحد الأقصى للقرض حسب الدخل",
        paymentMode: "الحد الأقصى للقرض حسب القسط",
        switchToPayment: "التبديل إلى وضع القسط",
        switchToIncome: "التبديل إلى وضع الدخل",
        calculate: "احسب",
        reset: "إعادة تعيين",
        errorInvalid: "يرجى إدخال قيم صحيحة في جميع الحقول.",
        maxLoanAmount: "الحد الأقصى لمبلغ القرض",
        monthlyPayment: "القسط الشهري",
        totalPayment: "إجمالي السداد",
        totalInterest: "إجمالي الفائدة",
        flatRate: "المعدل الثابت",
        tenor: "المدة",
        payment: "القسط",
        interest: "الفائدة",
        min: "الحد الأدنى",
        private: "الخاص",
        digital: "الرقمي",
        years: "سنوات",
        months: "أشهر",
        maxDBR: "أقصى DBR",
        minRate: "أقل معدل",
    }
};
function t(key) {
    return translations[currentLanguage][key] || key;
}

// PMT function (like Excel)
function PMT(monthlyRate, numberOfPayments, principal)
{
    if (monthlyRate == 0)
        return principal / numberOfPayments;

    var numerator = principal * monthlyRate;
    var denominator = (1 - Math.pow(1 + monthlyRate, -numberOfPayments));

    return numerator / denominator;
}
// Calculation logic
function PV(rate, nper, pmt) {
    if (rate == 0)
        return pmt * nper;

    var numerator = 1 - Math.pow(1 + rate, -nper);
    var denominator = rate;

    return pmt * (numerator / denominator);
}

// Main calculation
function first_calculate() {
    const principal = parseFloat(document.getElementById('principal').value);
    const annualRate = parseFloat(document.getElementById('interestRate').value);
    const startDateStr = document.getElementById('startDate').value;
    const tenor = parseInt(document.getElementById('tenor').value, 10) || 0;

    if (!principal || !annualRate || !startDateStr) {
        alert(currentLanguage === "ar" ? "يرجى إدخال جميع القيم بشكل صحيح" : "Please enter all values correctly");
        return;
    }

    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';

    setTimeout(function () {
        const startDate = new Date(startDateStr);
        const tempDate = new Date(startDate);
        tempDate.setMonth(tempDate.getMonth() + 2);
        const endDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), 5);

        const daysBetween = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const monthlyRate = annualRate / 100;
        const dailyRate = monthlyRate / (12 * 30);
        const calculationDays = daysBetween - 30 - 1;
        const interestFactor = dailyRate * calculationDays;
        const firstMonthInterest = principal * interestFactor;

        let monthlyPayment = 0;
        let totalFirstMonthlyPayment = 0;
        if (tenor > 0) {
            const numberOfPayments = isYears ? tenor * 12 : tenor;
            const loanMonthlyRate = annualRate / 100 / 12;
            monthlyPayment = PMT(loanMonthlyRate, numberOfPayments, principal);
            totalFirstMonthlyPayment = firstMonthInterest + monthlyPayment; // You can adjust this if you have a different logic
        }

        // Update UI
        document.getElementById('endDate').textContent = endDate.toLocaleDateString(currentLanguage === "ar" ? "ar-EG" : "en-EG");
        document.getElementById('firstMonthInterest').querySelector('.result-value').textContent = formatCurrency(firstMonthInterest);
        document.getElementById('daysBetween').textContent = daysBetween;
        document.getElementById('calculationDays').textContent = calculationDays;

        // Show/hide monthly payment and total first monthly payment
        if (tenor > 0) {
            document.getElementById('monthlyPayment').style.display = '';
            document.getElementById('monthlyPayment').querySelector('.result-value').textContent = formatCurrency(monthlyPayment);
            document.getElementById('totalFirstMonthlyPayment').style.display = '';
            document.getElementById('totalFirstMonthlyPayment').querySelector('.result-value').textContent = formatCurrency(totalFirstMonthlyPayment);
        } else {
            document.getElementById('monthlyPayment').style.display = 'none';
            document.getElementById('totalFirstMonthlyPayment').style.display = 'none';
        }

        document.getElementById('loading').style.display = 'none';
        document.getElementById('results').style.display = 'block';
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }, 500);
}

// Replace the calculateLoan and displayResults functions with these updated versions
function Loan_calculate() {
    const principal = parseFloat(document.getElementById('principal').value);
    const annualRate = parseFloat(document.getElementById('interestRate').value) / 100;
    let minTenor = parseFloat(document.getElementById('minTenor').value);
    let maxTenor = parseFloat(document.getElementById('maxTenor').value);


    // Validate inputs
    if (!principal || !annualRate || !minTenor || !maxTenor) {
        alert(translations[currentLanguage].invalidInput);
        return;
    }

    if (minTenor > maxTenor) {
        [minTenor, maxTenor] = [maxTenor, minTenor]; // Swap if min is greater than max
    }

    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';

    const results = [];
    for (let tenor = minTenor; tenor <= maxTenor; tenor++) {
        // Convert tenor to months if in years
        const tenorMonths = isYears ? tenor * 12 : tenor;
        const monthlyRate = annualRate / 12;

        // Calculate monthly payment using PMT
        const monthlyPayment = PMT(monthlyRate, tenorMonths, principal);
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

    Loan_displayResults(results);
}

function Loan_displayResults(results) {
    const resultsGrid = document.getElementById('resultsGrid');
    const t = translations[currentLanguage];

    let html = `
        <div class="table-container">
            <table id="resultsTable">
                <thead>
                    <tr>
                    <th data-en="Loan Term" data-ar="مدة القرض">${t.loanTerm}</th>
                    <th data-en="Monthly Payment" data-ar="القسط الشهري">${t.monthlyPayment}</th>
                    <th data-en="Total Payment" data-ar="إجمالي السداد">${t.totalPayment}</th>
                    <th data-en="Total Interest" data-ar="إجمالي الفائدة">${t.totalInterest}</th>
                    <th data-en="Flat Rate" data-ar="إجمالي العائد">${t.flatRate}</th>
                    </tr>
                </thead>
                <tbody>
    `;

    results.forEach(result => {
        html += `
            <tr>
                <td>${result.tenor}</td>
                <td>${formatCurrency(result.monthlyPayment)}</td>
                <td>${formatCurrency(result.totalPayment)}</td>
                <td>${formatCurrency(result.totalInterest)}</td>
                <td>${result.flatRate.toFixed(2)}%</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    resultsGrid.innerHTML = html;
    // Hide loading and show results
    document.getElementById('loading').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function maxLoan_calculate() {
    // Hide error
    document.getElementById('errorFrame').style.display = 'none';

    // Get common inputs
    const annualRate = parseFloat(document.getElementById('interestRate').value) / 100;
    let minTenor = parseInt(document.getElementById('minTenor').value, 10);
    let maxTenor = parseInt(document.getElementById('maxTenor').value, 10);

    if (!annualRate || !minTenor || !maxTenor || minTenor < 1 || maxTenor < 1) {
        showmaxError(t('errorInvalid'));
        return;
    }
    if (minTenor > maxTenor) [minTenor, maxTenor] = [maxTenor, minTenor];

    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';

    let results = [];
    if (isIncomeMode) {
        const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value);
        const monthlyInstallments = parseFloat(document.getElementById('monthlyInstallments').value);
        const maxDTI = parseFloat(document.getElementById('maxDTI').value) / 100;
        if (!monthlyIncome || !maxDTI) {
            showmaxError(t('errorInvalid'));
            return;
        }
        const maxMonthlyPayment = (monthlyIncome * maxDTI) - (monthlyInstallments || 0);
        if (maxMonthlyPayment <= 0) {
            showmaxError(t('errorInvalid'));
            return;
        }
        for (let tenor = minTenor; tenor <= maxTenor; tenor++) {
            const tenorMonths = isYears ? tenor * 12 : tenor;
            const monthlyRate = annualRate / 12;
            const maxLoan = PV(monthlyRate, tenorMonths, maxMonthlyPayment);
            const totalPayment = maxMonthlyPayment * tenorMonths;
            const totalInterest = totalPayment - maxLoan;
            const flatRate = (totalInterest / maxLoan / (tenorMonths / 12)) * 100;
            results.push({
                tenor,
                maxLoan,
                monthlyPayment: maxMonthlyPayment,
                totalPayment,
                totalInterest,
                flatRate
            });
        }
    } else {
        const fixedPayment = parseFloat(document.getElementById('fixedPayment').value);
        if (!fixedPayment) {
            showmaxError(t('errorInvalid'));
            return;
        }
        for (let tenor = minTenor; tenor <= maxTenor; tenor++) {
            const tenorMonths = isYears ? tenor * 12 : tenor;
            const monthlyRate = annualRate / 12;
            const maxLoan = PV(monthlyRate, tenorMonths, fixedPayment);
            const totalPayment = fixedPayment * tenorMonths;
            const totalInterest = totalPayment - maxLoan;
            const flatRate = (totalInterest / maxLoan / (tenorMonths / 12)) * 100;
            results.push({
                tenor,
                maxLoan,
                monthlyPayment: fixedPayment,
                totalPayment,
                totalInterest,
                flatRate
            });
        }
    }
    displaymaxResults(results);
}

function showmaxError(msg) {
    document.getElementById('errorMessage').textContent = msg;
    document.getElementById('errorFrame').style.display = '';
    document.getElementById('resultsSection').style.display = 'none';
}

function displaymaxResults(results) {
    const resultsGrid = document.getElementById('resultsGrid');
    const t = translations[currentLanguage];

    let html = `
            <div class="table-container">
                <table id="resultsTable">
                    <thead>
                        <tr>
                         <th data-en="Loan Term" data-ar="مدة القرض">${t.loanTerm}</th>
                          <th data-en="Max Loan Amount" data-ar="الحد الأقصى للقرض">${t.maxLoanAmount}</th>
                         <th data-en="Monthly Payment" data-ar="القسط الشهري">${t.monthlyPayment}</th>
                         <th data-en="Total Payment" data-ar="إجمالي السداد">${t.totalPayment}</th>
                         <th data-en="Total Interest" data-ar="إجمالي الفائدة">${t.totalInterest}</th>
                         <th data-en="Flat Rate" data-ar="إجمالي العائد">${t.flatRate}</th>
                         </tr>
                    </thead>
                    <tbody>
`;

    results.forEach(result => {
        html += `
                <tr>
                     <td>${result.tenor}</td>
                     <td>${formatCurrency(result.maxLoan.toFixed(0))}</td>
                     <td>${formatCurrency(result.monthlyPayment.toFixed(0))}</td>
                     <td>${formatCurrency(result.totalPayment.toFixed(0))}</td>
                     <td>${formatCurrency(result.totalInterest.toFixed(0))}</td>
                     <td>${result.flatRate.toFixed(2)}%</td>
                </tr>
            `;
    });

    html += `
                    </tbody>
                </table>
            </div>
`;

    resultsGrid.innerHTML = html;
    // Hide loading and show results
    document.getElementById('loading').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

async function smart_calculate() {
    const principal = parseFloat(document.getElementById('principal').value);
    const cdRate = parseFloat(document.getElementById('cdRate').value) / 100;
    const loanRate = parseFloat(document.getElementById('interestRate').value) / 100;
    let loanTerm = parseFloat(document.getElementById('loanTerm').value);

    // Convert to months if in years
    if (isYears) {
        loanTerm = loanTerm * 12;
    }

    if (!principal || !cdRate || !loanRate || !loanTerm) {
        const alertMessage = currentLanguage === 'ar'
            ? 'يرجى إدخال قيم صحيحة في جميع الحقول'
            : 'Please enter valid values in all fields';
        alert(alertMessage);
        return;
    }

    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';

    // Simulate processing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const maxLoan = principal * 0.9;
    const monthlyRate = loanRate / 12;
    const cdMonthlyRate = cdRate / 12;

    let results = [];
    let bestResult = null;
    let bestGrandTotal = -Infinity;
    let zeroLoanTotal = 0;

    // Calculate for loan amounts from 0 to 90% in steps
    const stepSize = 1000;
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
        const monthlyPayment = loanAmount > 0 ? PMT(monthlyRate, loanTerm, loanAmount) : 0;

        // Net monthly profit
        const netMonthlyProfit = totalMonthlyIncome - monthlyPayment;

        // Stop calculating if we start losing money monthly
        if (loanAmount > 0 && netMonthlyProfit < 0 && i != steps) {
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
            i += Math.floor((grandTotal - principal) / stepSize);
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

    smart_displayResults(results, bestResult, zeroLoanTotal, principal, loanTerm);
}

function smart_displayResults(results, bestResult, zeroLoanTotal, principal, loanTerm) {
    const tableBody = document.getElementById('tableBody');
    const summaryCards = document.getElementById('summaryCards');

    // Clear previous results
    tableBody.innerHTML = '';
    summaryCards.innerHTML = '';

    // Create summary cards
    if (bestResult) {
        const advantageOverZero = bestResult.grandTotal - zeroLoanTotal;
        const totaladvantageOverZero = bestResult.grandTotal - principal;
        const percentageGain = (totaladvantageOverZero / principal) * 100 / (loanTerm / 12);

        const t = translations[currentLanguage].summaryCards;

        summaryCards.innerHTML = `
                        <div class="summary-card">
                            <h3>${t.optimalLoan}</h3>
                            <div class="value">${formatCurrency(bestResult.loanAmount)}</div>
                        </div>
                        <div class="summary-card">
                            <h3>${t.monthlyProfit}</h3>
                            <div class="value">${formatCurrency(bestResult.netMonthlyProfit)}</div>
                        </div>
                        <div class="summary-card">
                            <h3>${t.maxTotal}</h3>
                            <div class="value">${formatCurrency(bestResult.grandTotal)}</div>
                            <div style="font-size: 0.8rem; color: #6b7280; margin-top: 5px;">+${percentageGain.toFixed(2)}${t.gainSuffix}</div>
                        </div>
                        <div class="summary-card">
                            <h3>${t.advantage}</h3>
                            <div class="value" style="color: #059669">${formatCurrency(advantageOverZero)}</div>
                        </div>
                    `;
    }

    // Populate table
    results.forEach(result => {
        const row = document.createElement('tr');
        const isBest = bestResult && Math.abs(result.loanAmount - bestResult.loanAmount) < 1;

        if (isBest) {
            row.classList.add('best-row');
        }

        row.innerHTML = `
                        <td>${formatCurrency(result.loanAmount)}</td>
                        <td>${formatCurrency(result.totalMonthlyIncome)}</td>
                        <td>${formatCurrency(result.monthlyPayment)}</td>
                        <td style="color: ${result.netMonthlyProfit >= 0 ? '#059669' : '#dc2626'}">${formatCurrency(result.netMonthlyProfit)}</td>
                        <td><strong>${formatCurrency(result.grandTotal)}</strong></td>
                    `;

        tableBody.appendChild(row);
    });

    // Hide loading and show results
    document.getElementById('loading').style.display = 'none';
    document.getElementById('results').style.display = 'block';

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// Settings (could be loaded from user settings)
let maxDBRRatio = 50;
let minInterestRate = 22.75;
let isIncomeMode = true;
function resetInputs() {
    document.getElementById('monthlyIncome').value = 10000;
    document.getElementById('monthlyInstallments').value = 0;
    document.getElementById('maxDTI').value = 50;
    document.getElementById('fixedPayment').value = 5000;
    document.getElementById('interestRate').value = 22.75;
    document.getElementById('minTenor').value = 1;
    document.getElementById('maxTenor').value = 10;
    document.getElementById('loading').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    document.getElementById('errorFrame').style.display = 'none';
}

const calculatebutton = document.querySelector('.calculate-btn');
if (calculatebutton) {
    // Allow Enter key to trigger calculation
    document.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            if (document.body.id === 'firstPage')
                first_calculate();
            else if (document.body.id === 'loanPage')
                Loan_calculate();
            else if (document.body.id === 'maxloanPage')
                maxLoan_calculate();
            else if (document.body.id === 'smartPage')
                smart_calculate();
        }
    });
}

const switchmode = document.getElementById('switchModeBtn');
if (switchmode)
{
    switchmode.onclick = function () {
        isIncomeMode = !isIncomeMode;
        updateUI();
        resetInputs();
    }
}

// UI update helpers
function updateUI() {
    document.getElementById('currentModeTitle').textContent = isIncomeMode ? t('incomeMode') : t('paymentMode');
    document.getElementById('switchModeBtn').textContent = isIncomeMode ? t('switchToPayment') : t('switchToIncome');
    document.getElementById('calculateBtn').textContent = t('calculate');
    document.getElementById('resetBtn').textContent = t('reset');
    document.getElementById('maxDBRRatioLabel').textContent = `${t('maxDBR')}: ${maxDBRRatio}%`;
    document.getElementById('minInterestRateLabel').textContent = `${t('minRate')}: ${minInterestRate}%`;
    document.getElementById('incomeModeInputs').style.display = isIncomeMode ? '' : 'none';
    document.getElementById('paymentModeInputs').style.display = isIncomeMode ? 'none' : '';
}


// Tenor toggle logic
let isYears = true;
const toggle = document.getElementById('termToggle');
if (toggle) {
    toggle.addEventListener('click', function () {
        this.classList.toggle('active');
        isYears = this.classList.contains('active');
    });
}

const startDateInput = document.getElementById('startDate');
if (startDateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0
    const dd = String(today.getDate()).padStart(2, '0');
    startDateInput.value = `${yyyy}-${mm}-${dd}`;
}

// Navigation
function navigate(target) {
    window.location.href = `${target}.html`;
}

// App Information
function showAppInfo() {
    alert((currentLanguage === "ar" ? "BMToolkit الإصدار 1.0\n" : "BMToolkit v1.0\n") + "AbdouMatrix ®");
}
// Formatting utilities
function formatCurrency(amount) {
    const locale = currentLanguage === 'ar' ? 'ar-EG' : 'en-EG';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatPercent(value) {
    const formatted = (value * 100).toFixed(2);
    return `${formatted}%`;
}

// Preset rate buttons
function setPresetRate(type) {
    let rate = 0;
    if (type === 'min') rate = 22.75;
    if (type === 'private') rate = 24;
    if (type === 'digital') rate = 24.50;
    document.getElementById('interestRate').value = rate;
}

// Language toggle logic
let currentLanguage = "en";
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    const html = document.documentElement;
    const langSwitch = document.getElementById('langSwitch');

    if (currentLanguage === 'ar') {
        html.setAttribute('lang', 'ar');
        html.setAttribute('dir', 'rtl');
        langSwitch?.classList.add('arabic');
    } else {
        html.setAttribute('lang', 'en');
        html.setAttribute('dir', 'ltr');
        langSwitch?.classList.remove('arabic');
    }
    if (document.body.id === 'maxloanPage')
        updateUI();

    // Update all translatable elements
    const elements = document.querySelectorAll('[data-en][data-ar]');
    elements.forEach(element => {
        element.textContent = element.getAttribute(`data-${currentLanguage}`);
    });
}

// Initial language setup
toggleLanguage();
toggleLanguage();


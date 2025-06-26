# 🧮 BMToolkit: Bilingual Loan Calculator

BMToolkit is a Web Version of .NET MAUI application designed for calculating and modeling loan scenarios with precision and ease. 
The app supports both English and Arabic  and features multiple calculators including loan eligibility, monthly installments. 
Designed for flexibility and financial clarity.

---
## 🚧 Phase 1: Core Loan Calculator
### Features:
- 🌐 **Bilingual Support**: English and Arabic
- ⚙️ **App Settings Page** with configurable values:
  - Max DTI Ratio (e.g., 50%)
  - Min Interest Rate (e.g., 22.75%)
  - Unsecured Loan Interest Rates:
    - Private Sector: 24%
    - Digital: 24.5%
- 💰 **Loan Calculator (PMT Formula)**:
  - **Inputs**:
    - Principal
    - Interest Rate
    - Tenor (Years or Months: 1–10)
  - **Output (per tenor)**:
    - Monthly Payment
    - Total Payment
    - Total Interest
    - Flat Rate
- 🧼 Clean UI with validation & language toggle

---

## 📈 Phase 2: Maximum Loan Calculators (PV Formula)

### 1. **Max Loan by Income/Expenses**:
- **Inputs**:
  - Monthly Income, Monthly Expenses, Interest Rate
  - Tenor Range
- **Logic**:
  - Uses Max DTI to derive max eligible monthly payment
- **Output (per tenor)**:
  - Max Loan
  - Total Payment
  - Interest Paid
  - Flat Rate

### 2. **Max Loan by Monthly Payment**:
- **Inputs**:
  - Fixed Monthly Payment, Interest Rate, Tenor
- **Same Output Schema as Above**

♻️ Reuses consistent UI components  

---

## 🧮 Phase 3: First Month Interest Estimator

### Estimation Formula:
Principal × (Annual Interest Rate / 365) × Days Between Disbursement and First Installment

### Inputs:
- Principal
- Annual Interest Rate
- Start Date  
  _(End Date assumed to be Start Date + 2 months, due day = 5)_

### Output:
- Estimated First Month Interest
- Breakdown of calculation
- 📆 Localized Date Pickers in English/Arabic

---

## 📅 Phase 4: Amortization Schedule Viewer

TO DO LIST

---

## 🔧 Tech Stack
- .NET MAUI + C# / Web App using Html/JS
- Localization: with RTL layout support
- Architecture: MVVM with DI, modular UI design
---
## 📌 License
MIT License (or your preferred license)
---

## 📬 Feedback
We welcome contributions and suggestions! This toolkit is built for transparency and usefulness—feel free to fork, modify, and expand 🚀

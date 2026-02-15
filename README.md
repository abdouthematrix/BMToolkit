# BMToolkit - Bank Products Calculator

A user-friendly financial web application for calculating and comparing bank loan products. Built for non-technical users including bank customers and sales staff.

## Features

### 🏦 Secured Loans
- **Smart Investment Tool** - Compare 4 investment scenarios with certificates
- **Smart Loan Optimizer** - Find optimal loan amount (0-90% of certificate)
- **Loan Calculator** - Calculate payments for multiple tenors
- **Max Loan Calculator** - Find maximum loan based on monthly payment capacity
- **TD Secured Loan Calculator** - Multi-TD input with monthly/quarterly interest types, tenor range (years/months), reinvest toggle, and net paid view after TD interest offset

### 💼 Unsecured Loans
- **Product Selection** - Filter by sector, payroll type, and company segment
- **Max Loan by Income** - Calculate based on monthly income and DTI ratio
- **Max Loan by Installment** - Calculate maximum loan based on desired monthly payment
- **Loan Schedule** - Detailed payment breakdowns

### 💼 Advancded Tools
- **First Month Interest** - Calculate initial interest based on start date
- **Amortization Schedule** - Full payment schedule with stamp duty

### 🔧 Admin Panel
- Manage global rates and margins
- Update CD rates, TD margins, minimum rates
- Configure DTI ratios and stamp duty rates
- Product catalog management with CSV import
- Changes affect all users instantly

### 🌐 Features
- ✅ **Bilingual Support** - Full English/Arabic with RTL text direction
- ✅ **Mobile-First Design** - Responsive across all devices
- ✅ **Progressive Web App** - Works offline after first load
- ✅ **Dark/Light Theme** - User preference support
- ✅ **URL State Sharing** - Share calculations via URL parameters
- ✅ **Real-Time Updates** - Query parameters sync with form inputs
- ✅ **Pure JavaScript** - No frameworks, lightweight and fast
- ✅ **Advanced Calculations** - Stamp duty, interest calculations, amortization schedules

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Authentication + Firestore Database
- **Architecture**: Single Page Application (SPA) with hash-based routing
- **Design**: Component-based, mobile-first responsive
- **PWA**: Service Worker for offline support
- **Internationalization**: Custom i18n system with full RTL support

## Setup Instructions

### 1. Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** with Email/Password provider
3. Enable **Firestore Database** in production mode
4. Copy your Firebase config
5. Update `js/firebase-config.js` with your credentials:
```javascript
static config = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 2. Firestore Database Structure

Create the following collections in Firestore:

#### Collection: `constants`
Document ID: `global`
```json
{
  "CD_RATE": 0.16,
  "TD_MARGIN": 0.02,
  "MIN_RATE": 0.18,
  "MAX_LOAN_PERCENT": 0.90,
  "MAX_DBR_RATIO": 0.50,
  "STAMP_DUTY_RATE": 0.0005,
  SCENARIOS: {
    INTEREST_UPFRONT_PERCENT: 36,
    LOAN_CERTIFICATE_PERCENT: 58
    }
}
```


#### Collection: `products` (Optional)
Documents for each unsecured loan product:
```json
{
  "nameAr": "قروض نقدية بضمان تعهد للعاملين بالقطاع الحكومي",
  "nameEn": "PL Contracted Salary Transfer",
  "ubsCode": "3863",
  "sector": "Government/Public",
  "payrollType": "Contracted",
  "companySegment": "Not Specified",
  "rate1_5": "22.75%",
  "rate5_8": "22.25%",
  "rate8Plus": "21.75%"
}
```

### 3. Authentication Setup

1. In Firebase Console, go to Authentication > Users
2. Add admin user(s) manually with email and password
3. Use these credentials to login to the admin panel

### 4. Local Development
Serve the application using any local server
Python 3
python -m http.server 8000
Python 2
python -m SimpleHTTPServer 8000
Node.js (if you have http-server installed)
npx http-server -p 8000
Then open http://localhost:8000

### 5. Deployment

#### GitHub Pages
1. Push to GitHub repository
2. Go to Settings > Pages
3. Select branch and root folder
4. Your app will be available at `https://username.github.io/repo-name/`

#### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

#### Other Hosting
Upload all files to your web hosting service. Ensure the server supports:
- SPA routing (redirect all routes to `index.html`)
- HTTPS (required for PWA)
- CORS headers (if using external APIs)

## Usage

### For Users

#### Secured Loans
1. Navigate to **Secured Loans** from the home page
2. Select a calculator (Smart Investment, Optimizer, Loan Calculator, Max Loan, or TD Secured Loan)
3. Enter your certificate amount and rate
4. Specify loan duration in years or months
5. Click **Calculate Results** to see outputs
6. Compare scenarios to find the best option
7. Share results via URL parameters

##### TD Secured Loan workflow
1. Enter one or more TDs with amount, annual rate, and TD interest type (monthly/quarterly)
2. Enter the requested loan amount and tenor range
3. Choose tenor unit (years/months), installment frequency, and optional reinvest mode
4. Review result tables for tenor, installment, paid amount, total payment, flat rate, plus TD interest details and total TD interest per period

#### Unsecured Loans
1. Navigate to **Unsecured Loans**
2. Filter products by sector, payroll type, or company segment
3. Select a specific loan product
4. Choose calculator type:
   - **By Salary**: Based on monthly income and DTI ratio
   - **By Installment**: Based on desired monthly payment amount
   - **Calculator**: Detailed loan schedule and amortization
5. Enter your details
6. Get instant calculations with breakdowns
7. View detailed payment schedules

#### Advanced Tools
1. Navigate to **Advanced Tools**
2. **Broken Period Interest** - Calculate interest for partial first month based on loan start date
3. **Full Amortization** - Complete payment schedule including:
   - Interest breakdown per payment
   - Stamp duty calculations (quarterly)
   - Remaining balance tracking
   - Total cost analysis

### For Admins

1. Click **Login** in the header
2. Enter admin credentials
3. Navigate to **Settings**
4. Access sections:
   - **Rates & Margins** - Update CD rate, TD margin, minimum rate
   - **Secured Loan Settings** - Configure loan calculation constants
   - **Cash Loan Settings** - Update DTI ratios and caps
   - **Product Catalog** - Add/edit/delete unsecured loan products
5. For CSV import:
   - Download template or prepare CSV with columns: `nameAr`, `nameEn`, `ubsCode`, `sector`, `payrollType`, `companySegment`, `rate1_5`, `rate5_8`, `rate8Plus`
   - Click **Import from CSV**
   - Confirm import
6. Click **Update Settings** or **Save Product**
7. Changes apply globally to all users instantly

## URL Sharing & Parameters

BMToolkit supports URL parameters for sharing calculations. Use these to create shareable calculation links:
```
#secured-loans?amount=100000&rate=16&years=3
#unsecured-loans?income=10000&product=3863 
#unsecured-loans?income=5000&installment=500
```

### Available Parameters

**Secured Loans:**
- `amount` - Certificate/CD amount
- `rate` - CD return rate (%)
- `years` - Loan duration in years
- `months` - Loan duration in months

**Unsecured Loans:**
- `income` - Monthly income amount
- `product` - Product UBS code
- `installment` - Desired monthly payment amount
- `existingObligation` - Existing monthly obligations

**Advanced Tools:**
- `principal` - Loan principal amount
- `rate` - Interest rate (%)
- `startDate` - Loan start date (YYYY-MM-DD format)

Parameters update live as users interact with forms. Users can copy the updated URL to share their calculations.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)
- Requires JavaScript enabled
- PWA features require HTTPS

## File Structure
```
BMToolkit/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── css/
│   ├── style.css          # Main styles
│   └── rtl.css            # RTL overrides
└── js/
    ├── app.js             # Main application
    ├── router.js          # Hash-based router
    ├── i18n.js            # Internationalization
    ├── firebase-config.js # Firebase setup
    ├── services/
    │   ├── auth.js        # Authentication
    │   ├── firestore.js   # Database operations
    │   └── financial-calculator.js # Calculations
    └── pages/
        ├── home.js        # Home page
        ├── secured-loans.js    # Secured loans
        ├── unsecured-loans.js  # Unsecured loans
        ├── advancedtools.js  # Advanced Tools
        ├── login.js       # Login page
        └── admin.js       # Admin panel

```

## Customization

### Adding New Products

**Via Admin Panel (Recommended):**
1. Login to admin panel
2. Go to **Product Catalog**
3. Click **Create New Product** or **Import from CSV**
4. Fill in details in both English and Arabic
5. Enter UBS system code
6. Set interest rates for different tenor ranges
7. Click **Save Product**
8. Products appear automatically in user calculators

**Via Firebase Console:**
1. Open Firestore in Firebase Console
2. Create document in `products` collection
3. Add required fields: `nameAr`, `nameEn`, `ubsCode`, `sector`, `payrollType`, `companySegment`, `rate1_5`, `rate5_8`, `rate8Plus`
4. Changes visible immediately

### Changing Colors/Theme

Edit `css/style.css` CSS variables:
```
:root { 
    --primary: #2563eb;   /* Primary action color /
    --secondary: #10b981; / Secondary action color / 
    --accent: #f59e0b;    / Accent/warning color / 
    --danger: #ef4444;    / Error/danger color / 
    --background: #ffffff; / Main background /
    --surface: #f3f4f6;    / Card/surface background /
    --text-primary: #1f2937;         / Primary text color /
    --text-secondary: #6b7280;       / Secondary text color / 
    --border: #e5e7eb;               / Border color / 
    --spacing-sm: 0.5rem;            / Small spacing / 
    --spacing-md: 1rem;              / Medium spacing / 
    --spacing-lg: 1.5rem;            / Large spacing */ }
/* Dark theme overrides */
   @media (prefers-color-scheme: dark)
   { 
     :root 
     {
     --background: #1f2937;
     --surface: #111827;
     --text-primary: #f3f4f6;
     --text-secondary: #d1d5db;
     --border: #374151;
     }
}
```

### Adding New Calculators

1. Create calculator function in `js/services/financial-calculator.js`:
```
static calculateNewScenario(params) { // Your calculation logic return { result: value, // other properties }; }
```

2. Add form markup in respective page component (e.g., `js/pages/secured-loans.js`)

3. Add event listener to form:
```
form.addEventListener('submit', (e) => { e.preventDefault(); const result = FinancialCalculator.calculateNewScenario(formData); renderResults(result); });
```

4. Update routing in `js/app.js` if needed

### Internationalization

To add new translations:

1. Edit `js/i18n.js`
2. Add key-value pairs to both `en` and `ar` objects:
```
'new-key': 'English text', // Arabic version 'new-key': 'النص العربي',
```

3. Use in HTML:
```
<span data-i18n="new-key">English text</span>
```

4. Or in JavaScript:
```
const text = i18n.t('new-key');
```


## API Integration

### Financial Calculator Functions

The `FinancialCalculator` class provides the following methods:

- `calculateMaxLoan(cdAmount, rate)` - Maximum borrowing limit
- `calculateMonthlyPayment(principal, rate, months)` - Monthly installment
- `calculateLoanSchedule(principal, rate, startDate, months)` - Payment schedule
- `calculateFirstMonthInterest(principal, rate, startDate)` - Broken period interest
- `calculateAmortization(principal, rate, months, stampDutyRate)` - Full amortization
- `calculateMaxLoanByIncome(monthlyIncome, dtiRatio, existingObligations)` - Income-based limit
- `calculateMaxLoanByInstallment(monthlyPayment, rate, maxMonths)` - Payment-based limit

### Firestore Service

The `FirestoreService` class provides:

- `getConstants()` - Fetch global calculation constants
- `updateConstants(data)` - Update admin settings
- `getProducts(filters)` - Fetch loan products with optional filtering
- `addProduct(data)` - Create new product
- `updateProduct(id, data)` - Modify existing product
- `deleteProduct(id)` - Remove product

## Troubleshooting

### Common Issues

**Calculations Not Updating:**
- Clear browser cache (Ctrl+Shift+Del)
- Check that constants are loaded from Firestore
- Verify Firebase connection in browser console

**Products Not Appearing:**
- Confirm products collection exists in Firestore
- Check product document structure matches schema
- Verify security rules allow read access
- Ensure all required fields are populated

**Login Not Working:**
- Verify Firebase Authentication is enabled
- Check user exists in Firebase Console > Authentication > Users
- Confirm user has custom claim `admin: true` for admin access
- Check browser console for specific error messages

**PWA Not Installing:**
- Ensure site uses HTTPS
- Verify `manifest.json` is valid (use Chrome DevTools)
- Check service worker registration in Application tab
- Clear site data and reload

**Language/RTL Issues:**
- Verify `i18n.js` has complete translations
- Check `rtl.css` is loaded when language is Arabic
- Confirm `lang` and `dir` attributes update on language change

For additional debugging:
- Check Firebase Console for database/auth errors
- Review browser DevTools Console for JavaScript errors
- Verify network requests in Network tab
- Check Application tab for Service Worker status

## Support

For issues or questions:
- Check Firebase console for authentication/database errors
- Review error messages in browser console (F12)
- Verify all Firestore security rules allow appropriate access
- Ensure service worker is registered (check Application > Service Workers)
- Clear cache if updates aren't appearing (`Ctrl+Shift+Delete`)
- Verify JavaScript is enabled in browser

## Contributing

Please follow the coding standards in `CONTRIBUTING.md` when contributing to this project.

## License

MIT License - Feel free to use and modify for your needs.

## Changelog

### v1.0.0 - Initial Release
- ✅ Secured loans calculators (Smart Investment, Optimizer, Calculator, Max Loan)
- ✅ Unsecured loans with product selection
- ✅ Advanced tools (First Month Interest, Full Amortization)
- ✅ Admin panel with real-time updates
- ✅ Bilingual support (English/Arabic)
- ✅ PWA with offline support
- ✅ URL parameter sharing for calculations
- ✅ CSV product import/export

## Credits

Built with ❤️ for better financial transparency and education.
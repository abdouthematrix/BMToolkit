# BMToolkit - Bank Products Calculator

A user-friendly financial web application for calculating and comparing bank loan products. Built for non-technical users including bank customers and sales staff.

## Features

### 🏦 Secured Loans
- **Smart Investment Tool** - Compare 4 investment scenarios with certificates
- **Smart Loan Optimizer** - Find optimal loan amount (0-90% of certificate)
- **Loan Calculator** - Calculate payments for multiple tenors
- **Max Loan Calculator** - Find maximum loan based on monthly payment capacity

### 💼 Unsecured Loans
- **Product Selection** - Filter by sector, payroll type, and company segment
- **Max Loan by Income** - Calculate based on monthly income and DTI ratio
- **Loan Schedule** - Detailed payment breakdowns
- **First Month Interest** - Calculate initial interest based on start date
- **Amortization Schedule** - Full payment schedule with stamp duty

### 🔧 Admin Panel
- Manage global rates and margins
- Update CD rates, TD margins, minimum rates
- Configure DTI ratios and stamp duty rates
- Changes affect all users instantly

### 🌐 Features
- ✅ Bilingual (English/Arabic) with full RTL support
- ✅ Mobile-first responsive design
- ✅ PWA - Works offline after first load
- ✅ Dark/Light theme
- ✅ URL state sharing
- ✅ No frameworks - Pure JavaScript

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Backend**: Firebase Authentication + Firestore
- **Architecture**: SPA with hash-based routing
- **Design**: Component-based, mobile-first
- **PWA**: Service Worker for offline support

## Setup Instructions

### 1. Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** with Email/Password provider
3. Enable **Firestore Database**
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
  "STAMP_DUTY_RATE": 4
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

```bash
# Serve the application using any local server
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000

# Then open http://localhost:8000
```

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
- SPA routing (redirect all routes to index.html)
- HTTPS (required for PWA)

## Usage

### For Users

#### Secured Loans
1. Navigate to **Secured Loans** from the home page
2. Select a calculator (Smart Investment, Optimizer, etc.)
3. Enter your certificate amount and rate
4. Click **Calculate** to see results
5. Compare scenarios to find the best option

#### Unsecured Loans
1. Navigate to **Unsecured Loans**
2. Filter products by sector, payroll type, or segment
3. Select a specific product
4. Choose a calculator type
5. Enter your income or loan details
6. Get instant calculations with detailed breakdowns

### For Admins

1. Click **Login** in the header
2. Enter admin credentials
3. Navigate to **Admin Panel**
4. Update rates, margins, or constants
5. Click **Save Changes**
6. Changes apply globally to all users

## URL Sharing

BMToolkit supports URL parameters for sharing calculations:

```
#secured-loans?amount=100000&rate=16&years=3
#unsecured-loans?income=10000&product=3863
```

Parameters update live as users interact with forms.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## File Structure

```
BMToolkit/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── css/
│   ├── style.css          # Main styles
│   └── rtl.css            # RTL overrides
├── js/
│   ├── app.js             # Main application
│   ├── router.js          # Hash-based router
│   ├── i18n.js            # Internationalization
│   ├── firebase-config.js # Firebase setup
│   ├── services/
│   │   ├── auth.js        # Authentication
│   │   ├── firestore.js   # Database operations
│   │   └── financial-calculator.js # Calculations
│   └── pages/
│       ├── home.js        # Home page
│       ├── secured-loans.js    # Secured loans
│       ├── unsecured-loans.js  # Unsecured loans
│       ├── login.js       # Login page
│       └── admin.js       # Admin panel
└── data/
    └── products.csv       # Product data reference
```

## Customization

### Adding New Products

1. Login to admin panel
2. Add products to Firestore `products` collection
3. Products appear automatically in the UI

### Changing Colors/Theme

Edit `css/style.css` CSS variables:
```css
:root {
    --primary: #2563eb;      /* Primary color */
    --secondary: #10b981;    /* Secondary color */
    --accent: #f59e0b;       /* Accent color */
}
```

### Adding New Calculators

1. Create calculator function in `financial-calculator.js`
2. Add form in respective page component
3. Add event listener and result rendering

## Support

For issues or questions:
- Check Firebase console for authentication/database errors
- Verify all Firebase rules allow read/write access
- Ensure service worker is registered (check browser console)
- Clear cache if updates aren't appearing

## License

MIT License - Feel free to use and modify for your needs.

## Credits

Built with ❤️ for better financial transparency and education.

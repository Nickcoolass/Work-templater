# Ferie Kalkulator - Project Overview

## Purpose
A Danish vacation/holiday calculator web application for managing and tracking employee vacation days across multiple systems (SHIFTS, GEOLMS, and payslips). The app reconciles vacation data from different sources and generates reports showing discrepancies.

## Tech Stack
- **Pure HTML/CSS/JavaScript** - No frameworks or dependencies
- **localStorage** - All data persistence (client-side only)
- **No build process** - Open index.html directly in browser

## Project Structure

```
Work-templater/
├── index.html          # Main HTML with all UI components and modals
├── app.js              # All application logic (1061 lines)
├── styles.css          # All styling
├── data.xlsx           # Source Excel file with SHIFTS data
├── data-example.js     # Template for adding SHIFTS data
└── README.md           # User documentation (Danish)
```

## Key Features

### 1. Two Access Modes
- **Employee View** (default): Employees can view/edit their own data
- **Admin View**: Full access to all employees, import, reports
  - Username: `Isabella`
  - Password: `Kristina1`
  - Set in `app.js:10-11`

### 2. Data Input
- **SHIFTS data** (read-only): Pre-filled vacation days split into 3 periods
- **GEOLMS data** (editable): Total days + calendar date selection
- **Lønsedel data** (editable): Two payslip fields
- **Ferieoverførsel** (editable): Vacation transfer choice (max 5 days)

### 3. Time Off Import
- Admin can import historical time off data from CSV/Excel
- Supports file upload or paste from clipboard
- Groups data by employee and reason

### 4. Reporting
- Complete overview of all employees
- Color-coded status: ✓ Match, ⚠️ SHIFTS more, ❌ Input more
- Submission tracking (who submitted, when)
- CSV export functionality

## Data Model

### Employee Object Structure
```javascript
{
  navn: "AKLA (Allan Kjær Larsen)",

  // SHIFTS data (read-only, populated from data.xlsx)
  shifts_ferie_1: 19.0,    // Vacation 1/1 - 31/8 - 2025
  shifts_ferie_2: 0,       // Vacation 1/9 - 30/11 - 2025
  shifts_ferie_3: 2.0,     // Vacation 1/12 - 2025 onwards
  shifts_fridag_1: 2.0,    // Holiday 1/1 - 31/8 - 2025
  shifts_fridag_2: 0,      // Holiday 1/9 - 30/11 - 2025
  shifts_fridag_3: 0,      // Holiday 1/12 - 2025 onwards

  // Employee-editable fields
  geolms_total: 0,                    // Total vacation in GEOLMS
  geolms_dates: [],                   // Array of "YYYY-MM-DD" strings
  lonsedel_1: 0,                      // Payslip 1
  lonsedel_2: 0,                      // Payslip 2
  ferieOverforselValg: "",            // "Overfør til næste år" or "Udbetal med marts løn"
  ferieOverforselDage: 0,             // Number (max 5)

  // Time off records (imported by admin)
  timeOffRecords: [
    {
      reason: "Ferie",
      startDate: "2025-01-15",
      endDate: "2025-01-20",
      days: 6
    }
  ],

  // Submission tracking
  hasSubmitted: false,
  lastSubmitted: null                 // ISO date string
}
```

### localStorage Key
- `vacationEmployees` - JSON array of all employee objects

## Important Business Logic

### Vacation Period Splits (2025)
- **Period 1**: January 1 - August 31, 2025
- **Period 2**: September 1 - November 30, 2025
- **Period 3**: December 1, 2025 onwards

### Calculation Formula (app.js:453-476)
```javascript
Total SHIFTS Ferie = shifts_ferie_1 + shifts_ferie_2 + shifts_ferie_3
Total SHIFTS Fridag = shifts_fridag_1 + shifts_fridag_2 + shifts_fridag_3
Eget Input Total = geolms_total + lonsedel_1 + lonsedel_2
Forskel = Total SHIFTS Ferie - Eget Input Total
Estimeret ferie tilbage = Total SHIFTS Ferie - geolms_dates.length
```

### Status Logic (app.js:684-696)
- **Match** (green): `|forskel| ≤ 0.1`
- **Warning** (yellow): `forskel > 0.1` (SHIFTS has more)
- **Error** (red): `forskel < -0.1` (Input has more than SHIFTS)

### Validation Rules
1. Maximum 5 days for ferieoverførsel (app.js:425-431)
2. Calendar only shows January 1 - current month of 2025
3. Date format: YYYY-MM-DD (ISO 8601)

## Current Employee Count
45 employees with pre-loaded SHIFTS data (app.js:155-201)

## How to Run
1. Open `index.html` in a modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
2. JavaScript must be enabled
3. No server required - runs entirely client-side

## Common Tasks

### Adding/Updating SHIFTS Data
1. Edit `loadInitialData()` function in app.js (lines 153-227)
2. Update the `shiftsData` object with new employee codes and values
3. Clear localStorage: `localStorage.removeItem('vacationEmployees')`
4. Reload page

### Changing Admin Credentials
Edit constants in app.js:10-11:
```javascript
const ADMIN_USERNAME = 'Isabella';
const ADMIN_PASSWORD = 'Kristina1';
```

### Exporting All Data
Admin view → "Se Rapport" tab → "Eksporter til CSV" button
Generates: `ferie_rapport_YYYY-MM-DD.csv`

### Manual Data Backup
Browser console:
```javascript
console.log(localStorage.getItem('vacationEmployees'))
```

### Clearing All Data
Browser console:
```javascript
localStorage.removeItem('vacationEmployees')
location.reload()
```

## Code Organization

### app.js Structure
- **Lines 1-17**: Global state and initialization
- **Lines 19-110**: Login/logout functions
- **Lines 112-134**: Tab management
- **Lines 136-227**: Data loading/saving
- **Lines 229-298**: Time off import
- **Lines 309-369**: Employee selection and form loading
- **Lines 372-450**: Employee CRUD operations
- **Lines 452-476**: Calculation logic
- **Lines 478-622**: Calendar functionality
- **Lines 624-734**: Report generation
- **Lines 736-787**: Submission report
- **Lines 789-854**: CSV export
- **Lines 856-1061**: UI helpers and modals

### Key Functions to Know
- `loadInitialData()` - Populates employees with SHIFTS data
- `saveEmployeeData()` - Validates and saves employee form
- `calculateRemaining()` - Performs vacation calculations
- `refreshReport()` - Generates the main report table
- `importTimeOffData()` - Parses and imports CSV data

## UI Components

### Tabs
1. **Indtast Data**: Employee form with calendar picker
2. **Se Rapport**: Overview table with all employees (admin only)

### Modals
1. **Admin Login**: Username/password fields
2. **Calendar**: Multi-month date picker for GEOLMS dates
3. **Paste Data**: Text area for CSV import
4. **Custom Modal**: Dynamic modal for Time Off details and reports

## Data Flow

### Employee Submission Flow
1. Employee selects their name from dropdown
2. Fills in GEOLMS total, selects dates via calendar
3. Fills in lønsedel 1 & 2
4. Chooses vacation transfer option (if any)
5. Clicks "Gem Data"
6. `hasSubmitted` flag set to true, timestamp recorded

### Admin Report Flow
1. Admin logs in
2. Switches to "Se Rapport" tab
3. Clicks "Opdater Rapport"
4. Table shows all employees with calculations
5. Can view Time Off details per employee
6. Can export to CSV

## Browser Compatibility
- Requires modern browser with:
  - ES6 JavaScript support
  - localStorage API
  - FileReader API (for CSV import)
  - Flexbox and Grid CSS

## Known Limitations
1. **No server**: Data only stored locally in browser
2. **Single-browser**: Data not synced across devices/browsers
3. **No backup**: If browser data cleared, all data lost
4. **No authentication**: Admin password stored in plaintext in code
5. **No validation**: Employees can enter any values (no min/max enforcement except ferieoverførsel)
6. **Date calculation**: Simple day count, doesn't account for weekends/holidays
7. **Hard-coded year**: Calendar only shows 2025 (line 494)

## Security Considerations
- Admin password is in plaintext in app.js (line 11)
- No actual authentication - purely client-side check
- Anyone with browser dev tools can access/modify all data
- **Not suitable for sensitive data or production use without backend**

## Future Enhancement Ideas
- Backend API for true authentication and data persistence
- Email notifications for missing submissions
- Export to Excel with formatting
- Bulk import of SHIFTS data from Excel
- Multi-year support
- Weekend/holiday exclusion in date calculations
- Employee self-service password reset
- Data validation (min/max values)
- Audit log of changes

## Testing Checklist
- [ ] Employee can select name and see their data
- [ ] Employee can fill GEOLMS, lønsedel fields
- [ ] Calendar shows correct months for current year
- [ ] Date selection works (add/remove)
- [ ] "Gem Data" saves to localStorage
- [ ] Admin login works with correct credentials
- [ ] Admin can see all employees in report
- [ ] CSV export generates correct file
- [ ] Time off import works (file and paste)
- [ ] Status colors show correctly (green/yellow/red)
- [ ] Submission report shows who submitted
- [ ] Ferieoverførsel validation (max 5 days)

## Debugging Tips
- Open browser console (F12) to see any JavaScript errors
- Check localStorage: `localStorage.getItem('vacationEmployees')`
- Verify employee array: `console.log(employees)`
- Check current employee: `console.log(currentEmployee)`
- Test calculations: `calculateRemaining()` in console
- Force refresh report: `refreshReport()` in console

## Danish Terms Reference
- **Ferie**: Vacation
- **Feriefridag**: Holiday/Comp day
- **Lønsedel**: Payslip
- **Ferieoverførsel**: Vacation transfer/rollover
- **Indsendt**: Submitted
- **Mangler**: Missing
- **I alt**: In total
- **Holdt**: Taken (as in days taken)
- **Gem**: Save
- **Nulstil**: Reset

## Contact & Support
For questions, refer user to their system administrator.
Repository issues: https://github.com/Nickcoolass/Work-templater

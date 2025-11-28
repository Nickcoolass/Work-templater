# CLAUDE.md - AI Assistant Guide for Work-templater

## Project Overview

**Project Name:** Ferie Kalkulator (Vacation Calculator)
**Type:** Single-page web application
**Language:** Danish (da-DK)
**Tech Stack:** Vanilla JavaScript, HTML5, CSS3
**Storage:** Browser localStorage
**Purpose:** Employee vacation day tracking and reconciliation across multiple systems (SHIFTS, GEOLMS, payroll)

This application helps administrators and employees track, reconcile, and report vacation days by comparing data from:
- **SHIFTS system**: Pre-populated vacation/holiday data split into 3 date periods
- **GEOLMS system**: Employee-entered vacation totals with specific dates
- **Lønsedler (Payroll)**: Two payroll entries per employee
- **Time Off imports**: Historical vacation data from CSV/Excel files

## File Structure

```
Work-templater/
├── index.html          # Main HTML structure with modals and forms
├── app.js             # Core application logic (1061 lines)
├── styles.css         # Complete styling with CSS variables
├── data-example.js    # Example/template for SHIFTS data
├── data.xlsx          # Excel data file (source of truth for SHIFTS)
├── README.md          # User-facing documentation (Danish)
└── CLAUDE.md          # This file - AI assistant guide
```

## Architecture Overview

### Application Type
- **Pattern**: Single-page application (SPA) without frameworks
- **State Management**: Global JavaScript variables + localStorage persistence
- **UI Pattern**: Tab-based interface with modal dialogs
- **No Build Process**: Runs directly in browser without compilation

### Key Technologies
- **No dependencies**: Pure vanilla JavaScript (ES6+)
- **No frameworks**: No React, Vue, Angular, or jQuery
- **Responsive**: Mobile-friendly with CSS Grid and Flexbox
- **Modern browser required**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Data Model

### Employee Object Structure
```javascript
{
    navn: "AKLA (Allan Kjær Larsen)",           // Employee name with ID

    // SHIFTS data (read-only, pre-populated from data.xlsx)
    shifts_ferie_1: 19.0,      // Vacation 1/1 - 31/8 - 2025
    shifts_ferie_2: 0,         // Vacation 1/9 - 30/11 - 2025
    shifts_ferie_3: 2.0,       // Vacation 1/12 - 2025 onwards
    shifts_fridag_1: 2.0,      // Holiday 1/1 - 31/8 - 2025
    shifts_fridag_2: 0,        // Holiday 1/9 - 30/11 - 2025
    shifts_fridag_3: 0,        // Holiday 1/12 - 2025 onwards

    // GEOLMS data (editable by employees)
    geolms_total: 0,           // Total vacation days in GEOLMS
    geolms_dates: [],          // Array of date strings: ["2025-01-15", "2025-02-20"]

    // Payroll data (editable by employees)
    lonsedel_1: 0,             // Payroll 1 vacation days
    lonsedel_2: 0,             // Payroll 2 vacation days

    // Vacation transfer (editable by employees)
    ferieOverforselValg: '',   // "Overfør til næste år" or "Udbetal med marts løn"
    ferieOverforselDage: 0,    // Number of days (max 5)

    // Time Off import data
    timeOffRecords: [          // Array of imported Time Off records
        {
            reason: "Ferie",
            startDate: "2025-01-15",
            endDate: "2025-01-20",
            days: 6
        }
    ],

    // Submission tracking
    hasSubmitted: false,       // Whether employee has submitted their data
    lastSubmitted: null        // ISO timestamp of last submission
}
```

### Global State Variables
```javascript
// app.js:2-7
let employees = [];           // Main data array
let currentEmployee = null;   // Currently selected employee object
let selectedDates = [];       // Temporary calendar selection
let timeOffData = [];         // Imported time off data
let isAdmin = false;          // Admin login state
let currentUserName = null;   // Current user display name
```

### LocalStorage Keys
- `vacationEmployees`: JSON array of all employee objects

## Key Concepts

### 1. Date Periods
The application divides vacation tracking into 3 periods:
- **Period 1**: 1/1 - 31/8 - 2025
- **Period 2**: 1/9 - 30/11 - 2025
- **Period 3**: 1/12 - 2025 and onwards

### 2. Vacation Types
- **Ferie**: Standard vacation days
- **Feriefridage**: Holiday days (special vacation days)

### 3. User Roles
- **Employee View** (default): Limited access, can only edit their own data
- **Admin View**: Full access after login, can view/edit all employees, import data, view reports

### 4. Data Reconciliation
The app calculates:
- **Total SHIFTS Ferie**: Sum of shifts_ferie_1, shifts_ferie_2, shifts_ferie_3
- **Eget Input Total**: geolms_total + lonsedel_1 + lonsedel_2
- **Forskel (Difference)**: Total SHIFTS Ferie - Eget Input Total
- **Status**: Color-coded indicator (green=match, yellow=warning, red=error)

### 5. Calendar System
- Custom calendar widget for date selection (app.js:479-622)
- Shows months from January to current month of 2025
- Monday-based week start (Danish standard)
- Stores dates as ISO strings: "2025-01-15"

## Development Workflows

### Adding New Employees

**Method 1: Update loadInitialData() function**
```javascript
// app.js:153-227
function loadInitialData() {
    const shiftsData = {
        "NEWID (New Employee Name)": {
            "shifts_ferie_1": 10.0,
            "shifts_ferie_2": 5.0,
            "shifts_ferie_3": 2.0,
            "shifts_fridag_1": 2.0,
            "shifts_fridag_2": 0,
            "shifts_fridag_3": 0
        },
        // ... other employees
    };
    // Rest of function...
}
```

**Method 2: Admin UI (if admin is logged in)**
- Click "+ Tilføj Ny Medarbejder" button
- Enter name in prompt
- Manually enter SHIFTS data

### Updating SHIFTS Data

**Source**: data.xlsx file contains the master data

**Process**:
1. Update data.xlsx with new SHIFTS data
2. Calculate period-based totals (1/1-31/8, 1/9-30/11, 1/12+)
3. Update shiftsData object in loadInitialData() function (app.js:155-201)
4. Clear localStorage to reload: `localStorage.removeItem('vacationEmployees')`
5. Refresh browser

### Importing Time Off Data

**Supported Formats**: CSV, TSV (tab-separated), Excel paste

**Required Columns**:
- Employee Name / Time Off Employee Name
- Time Off Reason
- Start Date / Time Off Start Weekday
- End Date / Time Off Time Rounded

**Code Reference**: app.js:229-298 (importTimeOffData function)

### Admin Credentials

**Location**: app.js:10-11
```javascript
const ADMIN_USERNAME = 'Isabella';
const ADMIN_PASSWORD = 'Kristina1';
```

**IMPORTANT**: Change these before deployment for security!

## Core Functions Reference

### Data Management
- `loadEmployeesFromStorage()` - Load from localStorage (app.js:137-145)
- `saveEmployeesToStorage()` - Save to localStorage (app.js:148-150)
- `loadInitialData()` - Initialize with SHIFTS data (app.js:153-227)
- `saveEmployeeData()` - Save individual employee changes (app.js:407-440)

### Employee Operations
- `populateEmployeeSelect()` - Fill dropdown with employees (app.js:310-320)
- `loadEmployeeData()` - Load employee into form (app.js:323-369)
- `addNewEmployee()` - Create new employee (app.js:372-404)

### Calendar Functions
- `openCalendar()` - Show calendar modal (app.js:479-483)
- `generateCalendar()` - Build calendar UI (app.js:489-563)
- `toggleDate(element)` - Select/deselect date (app.js:565-576)
- `saveCalendarDates()` - Confirm selection (app.js:578-582)

### Calculations
- `calculateRemaining()` - Compute vacation totals (app.js:453-476)

### Reporting
- `refreshReport()` - Generate full employee report (app.js:625-734)
- `showMissingSubmissionsReport()` - Show who hasn't submitted (app.js:737-787)
- `exportToCSV()` - Export report to CSV file (app.js:790-854)

### Import/Export
- `importTimeOffData(csvText)` - Parse and import CSV (app.js:230-298)
- `handleFileUpload(event)` - File upload handler (app.js:888-898)
- `processPastedData()` - Paste dialog handler (app.js:909-917)

### Authentication
- `adminLogin()` - Admin login (app.js:58-72)
- `initializeAdminView()` - Setup admin UI (app.js:74-92)
- `initializeEmployeeView()` - Setup employee UI (app.js:20-39)
- `logout()` - Logout handler (app.js:96-110)

## Coding Conventions

### Naming Conventions
- **Functions**: camelCase (`loadEmployeeData`, `calculateRemaining`)
- **Variables**: camelCase (`currentEmployee`, `selectedDates`)
- **Constants**: UPPER_SNAKE_CASE (`ADMIN_USERNAME`, `ADMIN_PASSWORD`)
- **CSS Classes**: kebab-case (`calendar-day`, `time-off-group`)

### Danish Language
All user-facing text is in Danish:
- UI labels, buttons, messages
- Comments can be in English for technical clarity
- Variable names are in English
- Function names are in English

### Number Formatting
- Vacation days use 0.5 increments (half days allowed)
- Display format: `.toFixed(1)` for consistency
- Use `parseFloat()` for input parsing

### Date Handling
- **Storage format**: ISO strings "YYYY-MM-DD"
- **Display format**: Danish locale `toLocaleDateString('da-DK')`
- **Timezone handling**: Add 'T00:00:00' to prevent timezone issues
- Example: `new Date(date + 'T00:00:00')`

### HTML Structure
- Semantic HTML5 elements
- Modal dialogs for interactions
- Forms use native validation
- Accessibility: Labels for all inputs

### CSS Approach
- CSS custom properties (variables) defined in :root
- Mobile-first responsive design
- BEM-like naming for components
- Animations via CSS (@keyframes)

## Common Tasks

### Task: Add a New Data Field

**Example**: Add "Sick Days" tracking

1. **Update data model** (app.js employee object):
```javascript
{
    navn: "Name",
    // ... existing fields
    sick_days: 0,  // Add new field
}
```

2. **Update loadInitialData()** to include default value:
```javascript
emp = {
    // ... existing fields
    sick_days: 0,
};
```

3. **Add HTML input** (index.html):
```html
<div class="form-group">
    <label>Sygedage:</label>
    <input type="number" id="sick_days" step="0.5">
</div>
```

4. **Update loadEmployeeData()** to populate:
```javascript
document.getElementById('sick_days').value = currentEmployee.sick_days || 0;
```

5. **Update saveEmployeeData()** to save:
```javascript
employees[index].sick_days = parseFloat(document.getElementById('sick_days').value) || 0;
```

6. **Update report table** (refreshReport function) to display

### Task: Change Date Periods

To modify the 3 date periods:

1. Update labels in **index.html** (lines 108-138)
2. Update field names consistently across:
   - loadInitialData() shiftsData
   - Employee object structure
   - Form population/save functions
   - Report generation
3. Update README.md documentation

### Task: Export Additional Data Format

Example: Export to JSON

```javascript
function exportToJSON() {
    if (employees.length === 0) {
        alert('Ingen data at eksportere');
        return;
    }

    const jsonData = JSON.stringify(employees, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `ferie_data_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
```

### Task: Add Custom Validation

Example: Validate that GEOLMS total matches selected dates

```javascript
function validateGEOLMS() {
    const geolmsTotal = parseFloat(document.getElementById('geolms_total').value) || 0;
    const datesCount = selectedDates.length;

    if (Math.abs(geolmsTotal - datesCount) > 0.1) {
        showAlert(`ADVARSEL: GEOLMS total (${geolmsTotal}) matcher ikke antal valgte datoer (${datesCount})`, 'error');
        return false;
    }
    return true;
}

// Call in saveEmployeeData():
if (!validateGEOLMS()) {
    if (!confirm('Data matcher ikke. Gem alligevel?')) {
        return;
    }
}
```

## Styling Guide

### CSS Variables
All colors and common values are in CSS variables (styles.css:1-13):
```css
--primary-color: #2563eb
--secondary-color: #64748b
--success-color: #10b981
--danger-color: #ef4444
--background-color: #f8fafc
```

### Status Color System
- **Green** (.status-ok): Match, no discrepancy
- **Yellow** (.status-warning): SHIFTS has more than input
- **Red** (.status-error): Input has more than SHIFTS

### Responsive Breakpoints
- Mobile: max-width: 768px (styles.css:554-587)
- Grid layouts collapse to single column
- Tables use smaller fonts and padding

## Testing Checklist

### Manual Testing Steps

1. **Initial Load**
   - [ ] App loads without errors
   - [ ] Employee dropdown is populated
   - [ ] Employee view is shown by default
   - [ ] Admin login button visible

2. **Employee Flow**
   - [ ] Select employee from dropdown
   - [ ] Form displays with correct SHIFTS data (read-only)
   - [ ] Can edit GEOLMS total
   - [ ] Can select dates in calendar
   - [ ] Can edit lønsedel fields
   - [ ] Can select vacation transfer option
   - [ ] Calculations update correctly
   - [ ] Data saves to localStorage

3. **Admin Flow**
   - [ ] Admin login works with correct credentials
   - [ ] Admin login fails with incorrect credentials
   - [ ] Report tab becomes visible
   - [ ] Import section becomes visible
   - [ ] Can add new employee
   - [ ] Can view all employees in report

4. **Import Function**
   - [ ] CSV file upload works
   - [ ] Paste data dialog works
   - [ ] Data correctly parsed and grouped
   - [ ] Time Off records linked to employees
   - [ ] New employees created if needed

5. **Calendar**
   - [ ] Calendar shows current year (2025)
   - [ ] Can select/deselect dates
   - [ ] Selected dates display as tags
   - [ ] Can remove individual dates
   - [ ] Dates persist on save

6. **Report Generation**
   - [ ] Report displays all employees
   - [ ] Calculations are correct
   - [ ] Status colors are correct
   - [ ] Time Off button shows for employees with data
   - [ ] CSV export downloads correctly
   - [ ] Submission report shows correct counts

7. **Edge Cases**
   - [ ] Works with 0 employees
   - [ ] Works with 100+ employees
   - [ ] Handles missing data gracefully
   - [ ] Handles malformed CSV import
   - [ ] Works with localStorage disabled
   - [ ] Works on mobile devices

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Localization Notes

All text is in Danish (da-DK). Key translations:

| English | Danish |
|---------|--------|
| Vacation | Ferie |
| Holiday | Feriefridag |
| Payroll | Lønsedel |
| Transfer | Overførsel |
| Submit | Indsend |
| Save | Gem |
| Cancel | Annuller |
| Delete | Slet |
| Export | Eksporter |
| Import | Importer |
| Report | Rapport |
| Employee | Medarbejder |
| Administrator | Administrator |
| Login | Login |
| Logout | Log ud |

Date formatting uses Danish locale:
- Day names: Man, Tir, Ons, Tor, Fre, Lør, Søn
- Month names: januar, februar, marts, etc.

## Security Considerations

### Current Security Issues
⚠️ **WARNING**: This application has security vulnerabilities for production use:

1. **Hardcoded Credentials** (app.js:10-11)
   - Admin username/password in source code
   - Visible to anyone who views source
   - **Fix**: Move to secure backend authentication

2. **No Data Encryption**
   - All data stored in plain text in localStorage
   - Anyone with browser access can view/edit
   - **Fix**: Use backend API with authentication

3. **Client-Side Only**
   - No server-side validation
   - Data only exists locally
   - **Fix**: Implement proper backend

4. **No HTTPS Enforcement**
   - Can be served over HTTP
   - **Fix**: Use HTTPS only in production

### Recommended for Production

If deploying to production:
1. Implement proper backend with authentication
2. Use secure session management
3. Add server-side validation
4. Encrypt sensitive data
5. Use HTTPS only
6. Add audit logging
7. Implement rate limiting
8. Add CSRF protection

## Deployment

### Current Deployment Method
**Static File Hosting**: Simply serve the files from any web server

1. Copy all files to web server
2. Ensure index.html is the default document
3. No build step required
4. No server-side processing needed

### Recommended Setup
```
/var/www/ferie-kalkulator/
├── index.html
├── app.js
├── styles.css
├── data.xlsx (optional, for reference)
└── README.md (user documentation)
```

### Web Server Config (Nginx Example)
```nginx
server {
    listen 80;
    server_name ferie.example.com;
    root /var/www/ferie-kalkulator;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Pre-Deployment Checklist
- [ ] Update admin credentials (app.js:10-11)
- [ ] Load correct SHIFTS data in loadInitialData()
- [ ] Test with real data.xlsx file
- [ ] Verify all calculations
- [ ] Test on target browsers
- [ ] Clear any test data from localStorage
- [ ] Update README.md if needed
- [ ] Backup existing data if upgrading

## Data Migration

### Exporting Existing Data
```javascript
// Run in browser console
const data = localStorage.getItem('vacationEmployees');
console.log(data);
// Copy output to file
```

### Importing Data
```javascript
// Run in browser console
const data = `[{"navn":"..."}]`; // Paste JSON here
localStorage.setItem('vacationEmployees', data);
location.reload();
```

### Resetting Application
```javascript
// Run in browser console to clear all data
localStorage.removeItem('vacationEmployees');
location.reload();
```

## Troubleshooting

### Data Not Saving
1. Check browser console for errors
2. Verify localStorage is enabled
3. Check storage quota (browser limits)
4. Try different browser

### Calendar Not Showing
1. Verify modal CSS is loaded
2. Check JavaScript console for errors
3. Ensure date is within 2025 range

### Import Fails
1. Check CSV format matches requirements
2. Verify column headers are recognized
3. Try paste method instead of file upload
4. Check browser console for parsing errors

### Calculations Wrong
1. Verify SHIFTS data is correct
2. Check for NaN values (use parseFloat)
3. Ensure all fields have defaults (|| 0)
4. Review calculateRemaining() function

### Report Empty
1. Ensure employees array has data
2. Check refreshReport() is called
3. Verify report-container element exists
4. Check for JavaScript errors

## AI Assistant Guidelines

### When Making Changes

1. **Always read files first**
   - Use Read tool before editing
   - Understand context fully
   - Check for dependencies

2. **Preserve existing patterns**
   - Match naming conventions
   - Follow existing code style
   - Keep Danish language for UI
   - Maintain data structure

3. **Test implications**
   - Consider localStorage compatibility
   - Check all places data is used
   - Verify calculations still work
   - Test both admin and employee views

4. **Document changes**
   - Update this CLAUDE.md if architecture changes
   - Update README.md if user-facing changes
   - Add code comments for complex logic

### Common Pitfalls to Avoid

❌ **Don't**:
- Add npm packages (this is vanilla JS)
- Change from localStorage without migration plan
- Break backward compatibility with saved data
- Add build tools without explicit request
- Change Danish text to English
- Remove existing functionality without asking
- Modify SHIFTS data structure casually
- Add frameworks (React, Vue, etc.) without approval

✅ **Do**:
- Keep it simple and vanilla
- Maintain backward compatibility
- Test with existing localStorage data
- Follow existing patterns
- Preserve read-only fields
- Validate user input
- Use consistent date formats
- Keep responsive design working

### Making Safe Changes

**Low Risk**:
- Adding new calculated fields
- Adding new UI elements
- Improving validation
- Fixing bugs
- Updating styling

**Medium Risk**:
- Changing calculation logic
- Modifying data structure
- Adding new data fields
- Changing localStorage schema

**High Risk**:
- Changing employee object structure
- Modifying date handling
- Changing authentication
- Restructuring entire app

For medium/high risk changes:
1. Explain impact clearly
2. Provide migration path
3. Test thoroughly
4. Offer rollback plan

## Version History

### Current Version
- **Date**: Based on git commits through 2025-01-28
- **Features**: 45 employees, SHIFTS data integration, Time Off import, reporting
- **Last Major Change**: Removed login screen, direct employee view on load

### Key Milestones
- Initial upload (commit 29c63cf)
- Login redesign (commit fa86c7e)
- UI redesign with all 45 employees (commit 850db13)
- Email notification + submission report (commit 264d586)
- SHIFTS data period calculation (commit 6745381)

## Contact & Support

For questions about this codebase:
1. Check this CLAUDE.md file first
2. Review README.md for user documentation
3. Examine code comments in app.js
4. Check git history for context on changes

---

**Last Updated**: 2025-01-28
**Maintained By**: Development Team
**AI Assistant**: Use this document as authoritative source for all development decisions

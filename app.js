// Global state
let employees = [];
let currentEmployee = null;
let selectedDates = [];
let timeOffData = []; // Store imported time off data
let isAdmin = false;
let currentUserName = null;

// Admin credentials
const ADMIN_USERNAME = 'Isabella';
const ADMIN_PASSWORD = 'Kristina1';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadEmployeesFromStorage();
    showLoginScreen();
});

// Login Functions
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function showAdminLogin() {
    document.getElementById('adminLoginModal').style.display = 'block';
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminUsername').focus();
}

function closeAdminLogin() {
    document.getElementById('adminLoginModal').style.display = 'none';
}

function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isAdmin = true;
        currentUserName = 'Administrator';
        initializeApp();
        closeAdminLogin();
    } else {
        showAlert('Forkert brugernavn eller adgangskode!', 'error');
        document.getElementById('adminUsername').value = '';
        document.getElementById('adminPassword').value = '';
    }
}

function showEmployeeLogin() {
    const select = document.getElementById('employeeLoginSelect');
    select.innerHTML = '<option value="">Vælg dit navn...</option>';

    employees.forEach((emp, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = emp.navn;
        select.appendChild(option);
    });

    document.getElementById('employeeLoginModal').style.display = 'block';
}

function closeEmployeeLogin() {
    document.getElementById('employeeLoginModal').style.display = 'none';
}

function employeeLogin() {
    const select = document.getElementById('employeeLoginSelect');
    const index = select.value;

    if (index === '') {
        showAlert('Vælg venligst dit navn', 'error');
        return;
    }

    isAdmin = false;
    currentEmployee = employees[index];
    currentUserName = currentEmployee.navn;
    initializeApp();
    closeEmployeeLogin();

    // Automatically select the employee
    document.getElementById('employeeSelect').value = index;
    loadEmployeeData();
}

function initializeApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';

    // Update user display
    document.getElementById('userDisplay').textContent = isAdmin ? '🔐 Administrator' : `👤 ${currentUserName}`;

    // Show/hide elements based on role
    if (isAdmin) {
        document.getElementById('importSection').style.display = 'block';
        document.getElementById('reportTab').style.display = 'block';
        document.getElementById('addEmployeeBtn').style.display = 'inline-block';
        document.getElementById('selectEmployeeHeader').textContent = 'Vælg Medarbejder';
    } else {
        document.getElementById('importSection').style.display = 'none';
        document.getElementById('reportTab').style.display = 'none';
        document.getElementById('addEmployeeBtn').style.display = 'none';
        document.getElementById('selectEmployeeHeader').textContent = 'Din Profil';

        // Disable employee select for non-admin
        document.getElementById('employeeSelect').disabled = true;
    }

    populateEmployeeSelect();
    if (isAdmin) {
        refreshReport();
    }
}

function logout() {
    if (confirm('Er du sikker på at du vil logge ud?')) {
        isAdmin = false;
        currentEmployee = null;
        currentUserName = null;
        selectedDates = [];

        // Reset form
        document.getElementById('employeeForm').style.display = 'none';
        document.getElementById('employeeSelect').disabled = false;

        showLoginScreen();
    }
}

// Tab management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    // Refresh report when switching to report tab
    if (tabName === 'report') {
        refreshReport();
    }
}

// Load employees from localStorage
function loadEmployeesFromStorage() {
    const stored = localStorage.getItem('vacationEmployees');
    if (stored) {
        employees = JSON.parse(stored);
    } else {
        // Load from initial data if available
        loadInitialData();
    }
}

// Save employees to localStorage
function saveEmployeesToStorage() {
    localStorage.setItem('vacationEmployees', JSON.stringify(employees));
}

// Load initial data (this should be populated with your SHIFTS data)
function loadInitialData() {
    // This is a template - you'll add your actual data here
    employees = [
        {
            navn: "Medarbejder 1",
            shifts_ferie_1: 10,
            shifts_ferie_2: 5,
            shifts_ferie_3: 15,
            shifts_fridag_1: 2,
            shifts_fridag_2: 1,
            shifts_fridag_3: 3,
            geolms_total: 0,
            geolms_dates: [],
            lonsedel_1: 0,
            lonsedel_2: 0,
            ferieOverforselValg: '',
            ferieOverforselDage: 0,
            timeOffRecords: [] // Array of time off records
        }
    ];
    saveEmployeesToStorage();
}

// Import Time Off Data from CSV/Excel
function importTimeOffData(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(/[,;\t]/).map(h => h.trim());

    // Find column indexes
    const nameIdx = headers.findIndex(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('navn'));
    const reasonIdx = headers.findIndex(h => h.toLowerCase().includes('reason') || h.toLowerCase().includes('årsag'));
    const startIdx = headers.findIndex(h => h.toLowerCase().includes('start date'));
    const endIdx = headers.findIndex(h => h.toLowerCase().includes('end date'));

    // Group by employee
    const employeeTimeOff = {};

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/[,;\t]/).map(c => c.trim());
        if (cols.length < 4) continue;

        const name = cols[nameIdx];
        const reason = cols[reasonIdx];
        const startDate = cols[startIdx];
        const endDate = cols[endIdx];

        if (!name) continue;

        if (!employeeTimeOff[name]) {
            employeeTimeOff[name] = [];
        }

        employeeTimeOff[name].push({
            reason: reason,
            startDate: startDate,
            endDate: endDate,
            days: calculateDaysBetween(startDate, endDate)
        });
    }

    // Update employees with time off data
    Object.keys(employeeTimeOff).forEach(name => {
        let emp = employees.find(e => e.navn === name);
        if (!emp) {
            // Create new employee if not exists
            emp = {
                navn: name,
                shifts_ferie_1: 0,
                shifts_ferie_2: 0,
                shifts_ferie_3: 0,
                shifts_fridag_1: 0,
                shifts_fridag_2: 0,
                shifts_fridag_3: 0,
                geolms_total: 0,
                geolms_dates: [],
                lonsedel_1: 0,
                lonsedel_2: 0,
                ferieOverforselValg: '',
                ferieOverforselDage: 0,
                timeOffRecords: []
            };
            employees.push(emp);
        }
        emp.timeOffRecords = employeeTimeOff[name];
    });

    saveEmployeesToStorage();
    populateEmployeeSelect();
    refreshReport();
    showAlert('Time Off data importeret!', 'success');
}

// Calculate days between two dates
function calculateDaysBetween(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
    return diffDays;
}

// Populate employee select dropdown
function populateEmployeeSelect() {
    const select = document.getElementById('employeeSelect');
    select.innerHTML = '<option value="">Vælg medarbejder...</option>';

    employees.forEach((emp, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = emp.navn;
        select.appendChild(option);
    });
}

// Load employee data into form
function loadEmployeeData() {
    const select = document.getElementById('employeeSelect');
    const index = select.value;

    if (index === '') {
        document.getElementById('employeeForm').style.display = 'none';
        return;
    }

    currentEmployee = employees[index];
    document.getElementById('employeeForm').style.display = 'block';

    // Populate form fields
    document.getElementById('navn').value = currentEmployee.navn || '';
    document.getElementById('shifts_ferie_1').value = currentEmployee.shifts_ferie_1 || 0;
    document.getElementById('shifts_ferie_2').value = currentEmployee.shifts_ferie_2 || 0;
    document.getElementById('shifts_ferie_3').value = currentEmployee.shifts_ferie_3 || 0;
    document.getElementById('shifts_fridag_1').value = currentEmployee.shifts_fridag_1 || 0;
    document.getElementById('shifts_fridag_2').value = currentEmployee.shifts_fridag_2 || 0;
    document.getElementById('shifts_fridag_3').value = currentEmployee.shifts_fridag_3 || 0;
    document.getElementById('geolms_total').value = currentEmployee.geolms_total || 0;
    document.getElementById('lonsedel_1').value = currentEmployee.lonsedel_1 || 0;
    document.getElementById('lonsedel_2').value = currentEmployee.lonsedel_2 || 0;

    // Load ferieoverførsel fields
    const valg = currentEmployee.ferieOverforselValg || '';
    if (valg === 'Overfør til næste år') {
        document.getElementById('ferieOverforsel_overfør').checked = true;
    } else if (valg === 'Udbetal med marts løn') {
        document.getElementById('ferieOverforsel_udbetal').checked = true;
    } else {
        // Clear both radio buttons
        document.getElementById('ferieOverforsel_overfør').checked = false;
        document.getElementById('ferieOverforsel_udbetal').checked = false;
    }
    document.getElementById('ferieOverforselDage').value = currentEmployee.ferieOverforselDage || 0;

    // Load selected dates
    selectedDates = currentEmployee.geolms_dates || [];
    displaySelectedDates();

    // Display Time Off history
    displayTimeOffHistory();

    // Calculate totals
    calculateRemaining();
}

// Add new employee
function addNewEmployee() {
    const name = prompt('Indtast navn på ny medarbejder:');
    if (name && name.trim()) {
        const newEmployee = {
            navn: name.trim(),
            shifts_ferie_1: 0,
            shifts_ferie_2: 0,
            shifts_ferie_3: 0,
            shifts_fridag_1: 0,
            shifts_fridag_2: 0,
            shifts_fridag_3: 0,
            geolms_total: 0,
            geolms_dates: [],
            lonsedel_1: 0,
            lonsedel_2: 0,
            ferieOverforselValg: '',
            ferieOverforselDage: 0,
            timeOffRecords: []
        };

        employees.push(newEmployee);
        saveEmployeesToStorage();
        populateEmployeeSelect();

        // Select the new employee
        document.getElementById('employeeSelect').value = employees.length - 1;
        loadEmployeeData();

        showAlert('Ny medarbejder tilføjet!', 'success');
    }
}

// Save employee data
function saveEmployeeData() {
    if (!currentEmployee) return;

    const select = document.getElementById('employeeSelect');
    const index = select.value;

    // Get values from editable fields only
    employees[index].geolms_total = parseFloat(document.getElementById('geolms_total').value) || 0;
    employees[index].lonsedel_1 = parseFloat(document.getElementById('lonsedel_1').value) || 0;
    employees[index].lonsedel_2 = parseFloat(document.getElementById('lonsedel_2').value) || 0;
    employees[index].geolms_dates = selectedDates;

    // Save ferieoverførsel data
    const valgRadio = document.querySelector('input[name="ferieOverforselValg"]:checked');
    employees[index].ferieOverforselValg = valgRadio ? valgRadio.value : '';

    const dage = parseFloat(document.getElementById('ferieOverforselDage').value) || 0;
    // Validate max 5 days
    if (dage > 5) {
        showAlert('Du kan maksimalt vælge 5 dage!', 'error');
        document.getElementById('ferieOverforselDage').value = 5;
        employees[index].ferieOverforselDage = 5;
    } else {
        employees[index].ferieOverforselDage = dage;
    }

    saveEmployeesToStorage();
    showAlert('Data gemt!', 'success');
    calculateRemaining();
}

// Clear form
function clearForm() {
    if (confirm('Er du sikker på at du vil nulstille formularen?')) {
        document.getElementById('employeeSelect').value = '';
        document.getElementById('employeeForm').style.display = 'none';
        currentEmployee = null;
        selectedDates = [];
    }
}

// Calculate remaining vacation days
function calculateRemaining() {
    // Calculate totals
    const shifts_ferie_total =
        (parseFloat(document.getElementById('shifts_ferie_1').value) || 0) +
        (parseFloat(document.getElementById('shifts_ferie_2').value) || 0) +
        (parseFloat(document.getElementById('shifts_ferie_3').value) || 0);

    const shifts_fridag_total =
        (parseFloat(document.getElementById('shifts_fridag_1').value) || 0) +
        (parseFloat(document.getElementById('shifts_fridag_2').value) || 0) +
        (parseFloat(document.getElementById('shifts_fridag_3').value) || 0);

    const geolms_dates_count = selectedDates.length;

    // Display totals
    document.getElementById('total_shifts_ferie').textContent = shifts_ferie_total.toFixed(1);
    document.getElementById('total_shifts_fridag').textContent = shifts_fridag_total.toFixed(1);
    document.getElementById('total_geolms_dates').textContent = geolms_dates_count;

    // Calculate remaining
    // This is a simple calculation - you can adjust the logic based on your needs
    const remaining = shifts_ferie_total - geolms_dates_count;
    document.getElementById('remaining_vacation').textContent = remaining.toFixed(1) + ' dage';
}

// Calendar functions
function openCalendar() {
    const modal = document.getElementById('calendarModal');
    modal.style.display = 'block';
    generateCalendar();
}

function closeCalendar() {
    document.getElementById('calendarModal').style.display = 'none';
}

function generateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    const currentDate = new Date();
    const currentYear = 2025;
    const currentMonth = currentDate.getMonth();

    // Generate calendar for January to current month of 2025
    for (let month = 0; month <= currentMonth; month++) {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'calendar-month';

        const monthName = new Date(currentYear, month, 1).toLocaleDateString('da-DK', {
            month: 'long',
            year: 'numeric'
        });

        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        monthDiv.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        // Add day headers
        const dayNames = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });

        // Get first day of month and total days
        const firstDay = new Date(currentYear, month, 1);
        const lastDay = new Date(currentYear, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // Adjust for Monday start (getDay() returns 0 for Sunday)
        let startDay = firstDay.getDay() - 1;
        if (startDay === -1) startDay = 6;

        // Add empty cells for days before month starts
        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            grid.appendChild(emptyDay);
        }

        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            dayDiv.textContent = day;
            dayDiv.dataset.date = dateStr;

            // Check if date is selected
            if (selectedDates.includes(dateStr)) {
                dayDiv.classList.add('selected');
            }

            dayDiv.onclick = function() {
                toggleDate(this);
            };

            grid.appendChild(dayDiv);
        }

        monthDiv.appendChild(grid);
        calendar.appendChild(monthDiv);
    }
}

function toggleDate(element) {
    const date = element.dataset.date;
    const index = selectedDates.indexOf(date);

    if (index > -1) {
        selectedDates.splice(index, 1);
        element.classList.remove('selected');
    } else {
        selectedDates.push(date);
        element.classList.add('selected');
    }
}

function saveCalendarDates() {
    displaySelectedDates();
    calculateRemaining();
    closeCalendar();
}

function displaySelectedDates() {
    const container = document.getElementById('selected-dates');
    container.innerHTML = '';

    if (selectedDates.length === 0) {
        container.innerHTML = '<div class="help-text">Ingen datoer valgt</div>';
        return;
    }

    // Sort dates
    selectedDates.sort();

    selectedDates.forEach(date => {
        const tag = document.createElement('div');
        tag.className = 'date-tag';

        const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('da-DK', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        tag.innerHTML = `
            ${formattedDate}
            <span class="remove" onclick="removeDate('${date}')">×</span>
        `;

        container.appendChild(tag);
    });
}

function removeDate(date) {
    const index = selectedDates.indexOf(date);
    if (index > -1) {
        selectedDates.splice(index, 1);
        displaySelectedDates();
        calculateRemaining();
    }
}

// Report functions
function refreshReport() {
    const container = document.getElementById('report-container');

    if (employees.length === 0) {
        container.innerHTML = '<div class="report-empty">Ingen data tilgængelig. Tilføj medarbejdere for at se rapporten.</div>';
        return;
    }

    let html = '<div style="overflow-x: auto;">';
    html += '<table class="report-table">';
    html += '<thead><tr>';
    html += '<th rowspan="2">Navn</th>';
    html += '<th colspan="3" class="group-header">SHIFTS Ferie</th>';
    html += '<th colspan="3" class="group-header">SHIFTS Feriefridage</th>';
    html += '<th colspan="2" class="group-header">GEOLMS</th>';
    html += '<th colspan="2" class="group-header">Lønsedler</th>';
    html += '<th colspan="2" class="group-header">Ferieoverførsel</th>';
    html += '<th colspan="4" class="group-header">Beregninger</th>';
    html += '<th rowspan="2">Time Off</th>';
    html += '</tr>';
    html += '<tr>';
    // SHIFTS Ferie sub-headers
    html += '<th class="number sub-header">1/1-31/8</th>';
    html += '<th class="number sub-header">1/9-30/11</th>';
    html += '<th class="number sub-header">1/12+</th>';
    // SHIFTS Fridag sub-headers
    html += '<th class="number sub-header">1/1-31/8</th>';
    html += '<th class="number sub-header">1/9-30/11</th>';
    html += '<th class="number sub-header">1/12+</th>';
    // GEOLMS sub-headers
    html += '<th class="number sub-header">I alt</th>';
    html += '<th class="number sub-header">Holdt</th>';
    // Lønsedel sub-headers
    html += '<th class="number sub-header">Løns. 1</th>';
    html += '<th class="number sub-header">Løns. 2</th>';
    // Ferieoverførsel sub-headers
    html += '<th class="sub-header">Valg</th>';
    html += '<th class="number sub-header">Dage</th>';
    // Beregninger sub-headers
    html += '<th class="number sub-header">Total SHIFTS</th>';
    html += '<th class="number sub-header">Eget Input Total</th>';
    html += '<th class="number sub-header">Forskel</th>';
    html += '<th class="number sub-header">Status</th>';
    html += '</tr></thead><tbody>';

    employees.forEach((emp, idx) => {
        const total_shifts_ferie = (emp.shifts_ferie_1 || 0) + (emp.shifts_ferie_2 || 0) + (emp.shifts_ferie_3 || 0);
        const total_shifts_fridag = (emp.shifts_fridag_1 || 0) + (emp.shifts_fridag_2 || 0) + (emp.shifts_fridag_3 || 0);
        const geolms_holdt = (emp.geolms_dates || []).length;
        const geolms_total = (emp.geolms_total || 0);
        const lonsedel_total = (emp.lonsedel_1 || 0) + (emp.lonsedel_2 || 0);

        // Eget input = GEOLMS total + Lønsedler
        const eget_input_total = geolms_total + lonsedel_total;

        // Forskel = SHIFTS - Eget Input
        const forskel = total_shifts_ferie - eget_input_total;

        // Status baseret på forskel
        let statusClass = '';
        let statusText = '✓ Match';
        if (Math.abs(forskel) > 0.1) {
            if (forskel > 0) {
                statusClass = 'status-warning';
                statusText = `⚠️ SHIFTS har ${forskel.toFixed(1)} mere`;
            } else {
                statusClass = 'status-error';
                statusText = `❌ Input har ${Math.abs(forskel).toFixed(1)} mere`;
            }
        } else {
            statusClass = 'status-ok';
        }

        const hasTimeOff = emp.timeOffRecords && emp.timeOffRecords.length > 0;
        const timeOffCount = hasTimeOff ? emp.timeOffRecords.length : 0;

        html += '<tr>';
        html += `<td><strong>${emp.navn}</strong></td>`;
        // SHIFTS Ferie
        html += `<td class="number">${(emp.shifts_ferie_1 || 0).toFixed(1)}</td>`;
        html += `<td class="number">${(emp.shifts_ferie_2 || 0).toFixed(1)}</td>`;
        html += `<td class="number">${(emp.shifts_ferie_3 || 0).toFixed(1)}</td>`;
        // SHIFTS Fridag
        html += `<td class="number">${(emp.shifts_fridag_1 || 0).toFixed(1)}</td>`;
        html += `<td class="number">${(emp.shifts_fridag_2 || 0).toFixed(1)}</td>`;
        html += `<td class="number">${(emp.shifts_fridag_3 || 0).toFixed(1)}</td>`;
        // GEOLMS
        html += `<td class="number">${geolms_total.toFixed(1)}</td>`;
        html += `<td class="number">${geolms_holdt}</td>`;
        // Lønsedler
        html += `<td class="number">${(emp.lonsedel_1 || 0).toFixed(1)}</td>`;
        html += `<td class="number">${(emp.lonsedel_2 || 0).toFixed(1)}</td>`;
        // Ferieoverførsel
        const valgDisplay = (emp.ferieOverforselValg || '-').replace('Overfør til næste år', 'Overfør').replace('Udbetal med marts løn', 'Udbetal');
        html += `<td>${valgDisplay}</td>`;
        html += `<td class="number">${(emp.ferieOverforselDage || 0).toFixed(1)}</td>`;
        // Beregninger
        html += `<td class="number calc-cell"><strong>${total_shifts_ferie.toFixed(1)}</strong></td>`;
        html += `<td class="number calc-cell"><strong>${eget_input_total.toFixed(1)}</strong></td>`;
        html += `<td class="number calc-cell ${statusClass}"><strong>${forskel.toFixed(1)}</strong></td>`;
        html += `<td class="${statusClass}">${statusText}</td>`;
        // Time Off
        html += `<td>${hasTimeOff ? `<button onclick="showEmployeeTimeOff(${idx})" class="btn-view-small">📅 Se (${timeOffCount})</button>` : '-'}</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    html += '</div>';
    container.innerHTML = html;
}

// Export to CSV
function exportToCSV() {
    if (employees.length === 0) {
        alert('Ingen data at eksportere');
        return;
    }

    let csv = 'Navn;SHIFTS Ferie (1/1-31/8);SHIFTS Ferie (1/9-30/11);SHIFTS Ferie (1/12+);';
    csv += 'SHIFTS Fridag (1/1-31/8);SHIFTS Fridag (1/9-30/11);SHIFTS Fridag (1/12+);';
    csv += 'GEOLMS I alt;GEOLMS Holdt;Lønsedel 1;Lønsedel 2;';
    csv += 'Ferieoverførsel Valg;Ferieoverførsel Dage;';
    csv += 'Total SHIFTS Ferie;Total SHIFTS Fridag;Eget Input Total (GEOLMS+Lønsedler);Forskel (SHIFTS-Input);Status\n';

    employees.forEach(emp => {
        const total_shifts_ferie = (emp.shifts_ferie_1 || 0) + (emp.shifts_ferie_2 || 0) + (emp.shifts_ferie_3 || 0);
        const total_shifts_fridag = (emp.shifts_fridag_1 || 0) + (emp.shifts_fridag_2 || 0) + (emp.shifts_fridag_3 || 0);
        const geolms_holdt = (emp.geolms_dates || []).length;
        const geolms_total = (emp.geolms_total || 0);
        const lonsedel_total = (emp.lonsedel_1 || 0) + (emp.lonsedel_2 || 0);
        const eget_input_total = geolms_total + lonsedel_total;
        const forskel = total_shifts_ferie - eget_input_total;

        let status = 'Match';
        if (Math.abs(forskel) > 0.1) {
            if (forskel > 0) {
                status = `SHIFTS har ${forskel.toFixed(1)} mere`;
            } else {
                status = `Input har ${Math.abs(forskel).toFixed(1)} mere`;
            }
        }

        csv += `${emp.navn};`;
        csv += `${emp.shifts_ferie_1 || 0};`;
        csv += `${emp.shifts_ferie_2 || 0};`;
        csv += `${emp.shifts_ferie_3 || 0};`;
        csv += `${emp.shifts_fridag_1 || 0};`;
        csv += `${emp.shifts_fridag_2 || 0};`;
        csv += `${emp.shifts_fridag_3 || 0};`;
        csv += `${geolms_total};`;
        csv += `${geolms_holdt};`;
        csv += `${emp.lonsedel_1 || 0};`;
        csv += `${emp.lonsedel_2 || 0};`;
        csv += `${emp.ferieOverforselValg || '-'};`;
        csv += `${emp.ferieOverforselDage || 0};`;
        csv += `${total_shifts_ferie.toFixed(1)};`;
        csv += `${total_shifts_fridag.toFixed(1)};`;
        csv += `${eget_input_total.toFixed(1)};`;
        csv += `${forskel.toFixed(1)};`;
        csv += `${status}\n`;
    });

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `ferie_rapport_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAlert('CSV fil downloaded!', 'success');
}

// Show alert
function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    const container = document.querySelector('.container');
    container.insertBefore(alert, container.firstChild);

    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const calendarModal = document.getElementById('calendarModal');
    const pasteModal = document.getElementById('pasteModal');
    const customModal = document.getElementById('customModal');

    if (event.target === calendarModal) {
        closeCalendar();
    }
    if (event.target === pasteModal) {
        closePasteDialog();
    }
    if (event.target === customModal) {
        closeCustomModal();
    }
}

// Import functions
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        importTimeOffData(contents);
    };
    reader.readAsText(file);
}

function showPasteDialog() {
    document.getElementById('pasteModal').style.display = 'block';
    document.getElementById('pasteArea').value = '';
}

function closePasteDialog() {
    document.getElementById('pasteModal').style.display = 'none';
}

function processPastedData() {
    const data = document.getElementById('pasteArea').value;
    if (!data.trim()) {
        showAlert('Ingen data indtastet', 'error');
        return;
    }
    importTimeOffData(data);
    closePasteDialog();
}

// Display Time Off History for current employee
function displayTimeOffHistory() {
    const container = document.getElementById('timeOffHistory');

    if (!currentEmployee || !currentEmployee.timeOffRecords || currentEmployee.timeOffRecords.length === 0) {
        container.innerHTML = '<p class="help-text">Ingen Time Off data importeret endnu</p>';
        return;
    }

    // Group by reason
    const grouped = {};
    currentEmployee.timeOffRecords.forEach(record => {
        if (!grouped[record.reason]) {
            grouped[record.reason] = [];
        }
        grouped[record.reason].push(record);
    });

    let html = '';
    Object.keys(grouped).forEach(reason => {
        const records = grouped[reason];
        const totalDays = records.reduce((sum, r) => sum + r.days, 0);

        html += `<div class="time-off-group">`;
        html += `<div class="time-off-header" onclick="toggleTimeOffDetails('${reason.replace(/'/g, "\\'")}')">`;
        html += `<span><strong>${reason}</strong> - ${totalDays} dage</span>`;
        html += `<span class="toggle-icon">▼</span>`;
        html += `</div>`;
        html += `<div class="time-off-details" id="timeoff-${reason.replace(/[^a-zA-Z0-9]/g, '_')}" style="display: none;">`;
        html += `<table class="time-off-table">`;
        html += `<tr><th>Start</th><th>Slut</th><th>Dage</th></tr>`;

        records.forEach(record => {
            const startFormatted = formatDate(record.startDate);
            const endFormatted = formatDate(record.endDate);
            html += `<tr>`;
            html += `<td>${startFormatted}</td>`;
            html += `<td>${endFormatted}</td>`;
            html += `<td class="number">${record.days}</td>`;
            html += `</tr>`;
        });

        html += `</table>`;
        html += `</div>`;
        html += `</div>`;
    });

    container.innerHTML = html;
}

function toggleTimeOffDetails(reason) {
    const id = 'timeoff-' + reason.replace(/[^a-zA-Z0-9]/g, '_');
    const element = document.getElementById(id);
    if (element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString('da-DK', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Show Time Off for an employee in modal
function showEmployeeTimeOff(employeeIdx) {
    const emp = employees[employeeIdx];
    if (!emp || !emp.timeOffRecords || emp.timeOffRecords.length === 0) return;

    // Group by reason
    const grouped = {};
    let totalDays = 0;
    emp.timeOffRecords.forEach(record => {
        if (!grouped[record.reason]) {
            grouped[record.reason] = [];
        }
        grouped[record.reason].push(record);
        totalDays += record.days;
    });

    let html = `<h3>${emp.navn} - Time Off Oversigt</h3>`;
    html += `<p style="margin-bottom: 20px;"><strong>Total dage:</strong> ${totalDays}</p>`;

    Object.keys(grouped).forEach(reason => {
        const records = grouped[reason];
        const reasonDays = records.reduce((sum, r) => sum + r.days, 0);

        html += `<div class="time-off-group">`;
        html += `<div class="time-off-header-modal">`;
        html += `<strong>${reason}</strong> - ${reasonDays} dage`;
        html += `</div>`;
        html += `<table class="time-off-table">`;
        html += `<tr><th>Start Dato</th><th>Slut Dato</th><th>Dage</th></tr>`;

        records.forEach(record => {
            html += `<tr>`;
            html += `<td>${formatDate(record.startDate)}</td>`;
            html += `<td>${formatDate(record.endDate)}</td>`;
            html += `<td class="number">${record.days}</td>`;
            html += `</tr>`;
        });

        html += `</table>`;
        html += `</div>`;
    });

    // Show in alert-style modal
    showCustomModal('Time Off Detaljer', html);
}

// Custom modal for displaying content
function showCustomModal(title, content) {
    // Create modal if doesn't exist
    let modal = document.getElementById('customModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <span class="close" onclick="closeCustomModal()">&times;</span>
                <div id="customModalContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('customModalContent').innerHTML = `<h2>${title}</h2>` + content;
    modal.style.display = 'block';
}

function closeCustomModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

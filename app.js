// Global state
let employees = [];
let currentEmployee = null;
let selectedDates = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadEmployeesFromStorage();
    populateEmployeeSelect();
    refreshReport();
});

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
            lonsedel_2: 0
        }
    ];
    saveEmployeesToStorage();
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

    // Load selected dates
    selectedDates = currentEmployee.geolms_dates || [];
    displaySelectedDates();

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
            lonsedel_2: 0
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

    let html = '<table class="report-table">';
    html += '<thead><tr>';
    html += '<th>Navn</th>';
    html += '<th class="number">SHIFTS Ferie (1/1-31/8)</th>';
    html += '<th class="number">SHIFTS Ferie (1/9-30/11)</th>';
    html += '<th class="number">SHIFTS Ferie (1/12+)</th>';
    html += '<th class="number">SHIFTS Fridag (1/1-31/8)</th>';
    html += '<th class="number">SHIFTS Fridag (1/9-30/11)</th>';
    html += '<th class="number">SHIFTS Fridag (1/12+)</th>';
    html += '<th class="number">GEOLMS I alt</th>';
    html += '<th class="number">GEOLMS Holdt</th>';
    html += '<th class="number">Lønsedel 1</th>';
    html += '<th class="number">Lønsedel 2</th>';
    html += '<th class="number">Total SHIFTS Ferie</th>';
    html += '<th class="number">Estimeret Tilbage</th>';
    html += '</tr></thead><tbody>';

    employees.forEach(emp => {
        const total_shifts = (emp.shifts_ferie_1 || 0) + (emp.shifts_ferie_2 || 0) + (emp.shifts_ferie_3 || 0);
        const geolms_holdt = (emp.geolms_dates || []).length;
        const remaining = total_shifts - geolms_holdt;

        html += '<tr>';
        html += `<td>${emp.navn}</td>`;
        html += `<td class="number">${(emp.shifts_ferie_1 || 0).toFixed(1)}</td>`;
        html += `<td class="number">${(emp.shifts_ferie_2 || 0).toFixed(1)}</td>`;
        html += `<td class="number">${(emp.shifts_ferie_3 || 0).toFixed(1)}</td>`;
        html += `<td class="number">${(emp.shifts_fridag_1 || 0).toFixed(1)}</td>`;
        html += `<td class="number">${(emp.shifts_fridag_2 || 0).toFixed(1)}</td>`;
        html += `<td class="number">${(emp.shifts_fridag_3 || 0).toFixed(1)}</td>`;
        html += `<td class="number">${(emp.geolms_total || 0).toFixed(1)}</td>`;
        html += `<td class="number">${geolms_holdt}</td>`;
        html += `<td class="number">${(emp.lonsedel_1 || 0).toFixed(1)}</td>`;
        html += `<td class="number">${(emp.lonsedel_2 || 0).toFixed(1)}</td>`;
        html += `<td class="number"><strong>${total_shifts.toFixed(1)}</strong></td>`;
        html += `<td class="number"><strong>${remaining.toFixed(1)}</strong></td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
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
    csv += 'GEOLMS I alt;GEOLMS Holdt;Lønsedel 1;Lønsedel 2;Total SHIFTS Ferie;Estimeret Tilbage\n';

    employees.forEach(emp => {
        const total_shifts = (emp.shifts_ferie_1 || 0) + (emp.shifts_ferie_2 || 0) + (emp.shifts_ferie_3 || 0);
        const geolms_holdt = (emp.geolms_dates || []).length;
        const remaining = total_shifts - geolms_holdt;

        csv += `${emp.navn};`;
        csv += `${emp.shifts_ferie_1 || 0};`;
        csv += `${emp.shifts_ferie_2 || 0};`;
        csv += `${emp.shifts_ferie_3 || 0};`;
        csv += `${emp.shifts_fridag_1 || 0};`;
        csv += `${emp.shifts_fridag_2 || 0};`;
        csv += `${emp.shifts_fridag_3 || 0};`;
        csv += `${emp.geolms_total || 0};`;
        csv += `${geolms_holdt};`;
        csv += `${emp.lonsedel_1 || 0};`;
        csv += `${emp.lonsedel_2 || 0};`;
        csv += `${total_shifts.toFixed(1)};`;
        csv += `${remaining.toFixed(1)}\n`;
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
    const modal = document.getElementById('calendarModal');
    if (event.target === modal) {
        closeCalendar();
    }
}

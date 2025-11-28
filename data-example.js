// EKSEMPEL PÅ HVORDAN DU TILFØJER DINE SHIFTS DATA
// Kopier dette til loadInitialData() funktionen i app.js

// Dette er et eksempel med 3 medarbejdere
// Erstat med dine egne data fra SHIFTS systemet

function loadInitialData() {
    employees = [
        {
            navn: "Anders Jensen",
            shifts_ferie_1: 10,     // Ferie i SHIFTS 1/1 - 31/8 - 2025
            shifts_ferie_2: 5,      // Ferie i SHIFTS 1/9 - 30/11 - 2025
            shifts_ferie_3: 15,     // Ferie i SHIFTS 1/12 - 2025 og frem
            shifts_fridag_1: 2,     // Feriefridage i SHIFTS 1/1 - 31/8 - 2025
            shifts_fridag_2: 1,     // Feriefridage i SHIFTS 1/9 - 30/11 - 2025
            shifts_fridag_3: 3,     // Feriefridage i SHIFTS 1/12 - 2025 og frem
            geolms_total: 0,        // Udfyldes af medarbejder
            geolms_dates: [],       // Udfyldes af medarbejder via kalender
            lonsedel_1: 0,          // Udfyldes af medarbejder
            lonsedel_2: 0           // Udfyldes af medarbejder
        },
        {
            navn: "Maria Nielsen",
            shifts_ferie_1: 12,
            shifts_ferie_2: 6,
            shifts_ferie_3: 14,
            shifts_fridag_1: 2.5,
            shifts_fridag_2: 1.5,
            shifts_fridag_3: 2,
            geolms_total: 0,
            geolms_dates: [],
            lonsedel_1: 0,
            lonsedel_2: 0
        },
        {
            navn: "Peter Hansen",
            shifts_ferie_1: 8,
            shifts_ferie_2: 4,
            shifts_ferie_3: 13,
            shifts_fridag_1: 1.5,
            shifts_fridag_2: 1,
            shifts_fridag_3: 2.5,
            geolms_total: 0,
            geolms_dates: [],
            lonsedel_1: 0,
            lonsedel_2: 0
        }
    ];
    saveEmployeesToStorage();
}

// TRIN-FOR-TRIN GUIDE TIL AT TILFØJE DINE DATA:
//
// 1. Åbn app.js filen
//
// 2. Find funktionen "loadInitialData()"
//
// 3. Erstat employees array med dine egne data:
//    - navn: Medarbejderens fulde navn
//    - shifts_ferie_1: Antal feriedage fra 1/1 til 31/8 - 2025
//    - shifts_ferie_2: Antal feriedage fra 1/9 til 30/11 - 2025
//    - shifts_ferie_3: Antal feriedage fra 1/12 - 2025 og frem
//    - shifts_fridag_1: Antal feriefridage fra 1/1 til 31/8 - 2025
//    - shifts_fridag_2: Antal feriefridage fra 1/9 til 30/11 - 2025
//    - shifts_fridag_3: Antal feriefridage fra 1/12 - 2025 og frem
//
// 4. Lad geolms_total, geolms_dates, lonsedel_1, og lonsedel_2 være 0 eller []
//    (disse udfyldes af medarbejderne selv i appen)
//
// 5. Gem filen
//
// 6. Hvis appen allerede har været brugt, skal du slette localStorage:
//    - Åbn browser konsol (F12)
//    - Skriv: localStorage.removeItem('vacationEmployees')
//    - Tryk Enter
//    - Genindlæs siden
//
// 7. Nu vil dine data blive indlæst!

// ALTERNATIV METODE - IMPORT VIA BROWSER KONSOL:
//
// Hvis du ikke vil redigere app.js, kan du også importere data direkte:
//
// 1. Åbn browser konsol (F12)
// 2. Kopier og tilpas følgende kode:
//
// let newEmployees = [
//     {
//         navn: "Dit Navn",
//         shifts_ferie_1: 10,
//         shifts_ferie_2: 5,
//         shifts_ferie_3: 15,
//         shifts_fridag_1: 2,
//         shifts_fridag_2: 1,
//         shifts_fridag_3: 3,
//         geolms_total: 0,
//         geolms_dates: [],
//         lonsedel_1: 0,
//         lonsedel_2: 0
//     }
// ];
// localStorage.setItem('vacationEmployees', JSON.stringify(newEmployees));
// location.reload();

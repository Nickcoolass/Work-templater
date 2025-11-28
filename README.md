# 🏖️ Ferie Kalkulator

En simpel web-applikation til at administrere og beregne medarbejderes feriedage på tværs af forskellige systemer (SHIFTS, GEOLMS, og lønsedler).

## 📋 Funktioner

- **Datainput**: Indtast feriedata fra forskellige kilder
- **Forudfyldt SHIFTS data**: Data fra SHIFTS systemet kan forudfyldes
- **Kalender visning**: Vælg specifikke feriedatoer med en intuitiv kalender
- **Automatisk beregning**: Beregn automatisk resterende feriedage
- **Rapport**: Se en komplet oversigt over alle medarbejderes feriedata
- **Export**: Eksporter data til CSV format

## 🚀 Sådan bruges applikationen

### 1. Åbn applikationen

Åbn `index.html` i din webbrowser (Chrome, Firefox, Safari, eller Edge).

### 2. Forudfyld SHIFTS data

Hvis du har data fra SHIFTS systemet, skal du redigere `app.js` filen og erstatte example data i `loadInitialData()` funktionen:

```javascript
function loadInitialData() {
    employees = [
        {
            navn: "Medarbejder Navn",
            shifts_ferie_1: 10,     // Ferie 1/1 - 31/8 - 2025
            shifts_ferie_2: 5,      // Ferie 1/9 - 30/11 - 2025
            shifts_ferie_3: 15,     // Ferie 1/12 - 2025 og frem
            shifts_fridag_1: 2,     // Feriefridage 1/1 - 31/8 - 2025
            shifts_fridag_2: 1,     // Feriefridage 1/9 - 30/11 - 2025
            shifts_fridag_3: 3,     // Feriefridage 1/12 - 2025 og frem
            geolms_total: 0,
            geolms_dates: [],
            lonsedel_1: 0,
            lonsedel_2: 0
        },
        // Tilføj flere medarbejdere her...
    ];
    saveEmployeesToStorage();
}
```

### 3. Tilføj eller vælg medarbejder

- Vælg en eksisterende medarbejder fra dropdown menuen
- Eller klik på "+ Tilføj Ny Medarbejder" for at oprette en ny

### 4. Udfyld data

**SHIFTS data** (forudfyldt - kan ikke redigeres i appen):
- Ferie i SHIFTS for forskellige perioder
- Feriefridage i SHIFTS for forskellige perioder

**GEOLMS data** (udfyldes af medarbejder):
- Ferie i GEOLMS i alt
- Vælg specifikke datoer der er holdt ved at klikke på kalender knappen

**Lønsedel data** (udfyldes af medarbejder):
- Ferie Lønsedel 1
- Ferie Lønsedel 2

### 5. Gem data

Klik på "💾 Gem Data" for at gemme ændringerne. Data gemmes lokalt i browserens localStorage.

### 6. Se rapport

Skift til "Se Rapport" fanen for at se en komplet oversigt over alle medarbejdere. Her kan du også:
- Opdatere rapporten med seneste data
- Eksportere til CSV fil

## 📊 Datafelter

| Felt | Beskrivelse | Redigerbar |
|------|-------------|------------|
| Navn | Medarbejderens navn | Nej* |
| Ferie i SHIFTS (1/1 - 31/8 - 2025) | Feriedage i SHIFTS systemet | Nej |
| Ferie i SHIFTS (1/9 - 30/11 - 2025) | Feriedage i SHIFTS systemet | Nej |
| Ferie i SHIFTS (1/12 - 2025 og frem) | Feriedage i SHIFTS systemet | Nej |
| Feriefridage i SHIFTS (1/1 - 31/8 - 2025) | Feriefridage i SHIFTS | Nej |
| Feriefridage i SHIFTS (1/9 - 30/11 - 2025) | Feriefridage i SHIFTS | Nej |
| Feriefridage i SHIFTS (1/12 - 2025 og frem) | Feriefridage i SHIFTS | Nej |
| Ferie i GEOLMS i alt | Total feriedage i GEOLMS | Ja |
| Ferie i GEOLMS datoer holdt | Specifikke datoer (kalender) | Ja |
| Ferie Lønsedel 1 | Feriedage fra lønsedel 1 | Ja |
| Ferie Lønsedel 2 | Feriedage fra lønsedel 2 | Ja |

*Navn kan kun redigeres når ny medarbejder oprettes

## 💾 Data Lagring

Alle data gemmes lokalt i din browser ved hjælp af localStorage. Dette betyder:

- ✅ Data gemmes automatisk på din computer
- ✅ Ingen server eller cloud forbindelse nødvendig
- ⚠️ Data er kun tilgængelig i den browser du bruger
- ⚠️ Hvis du sletter browser data, mistes din information

### Backup af data

For at sikre dine data:
1. Eksporter regelmæssigt til CSV
2. Eller kopier localStorage data ved at køre dette i browser konsollen:
   ```javascript
   console.log(localStorage.getItem('vacationEmployees'))
   ```

## 🔧 Tekniske Detaljer

- **HTML5** - Struktur
- **CSS3** - Styling med moderne design
- **Vanilla JavaScript** - Ingen eksterne afhængigheder
- **localStorage API** - Lokal data lagring

## 📝 Tilpasning

### Ændre beregnings logik

For at ændre hvordan "Estimeret ferie tilbage" beregnes, rediger `calculateRemaining()` funktionen i `app.js`:

```javascript
function calculateRemaining() {
    // Din custom beregnings logik her
    const remaining = shifts_ferie_total - geolms_dates_count;
    // ...
}
```

### Tilføj nye felter

1. Tilføj input felt i `index.html`
2. Opdater data objekt i `app.js`
3. Tilføj felt til rapport tabel
4. Opdater CSV export funktionen

## ⚠️ Bemærkninger

- Applikationen kræver en moderne browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript skal være aktiveret
- Data er kun tilgængelig lokalt - del ikke sensitive oplysninger via URL

## 🐛 Problemer?

Hvis du oplever problemer:

1. Prøv at genindlæse siden (F5)
2. Tjek browser konsollen for fejl (F12)
3. Prøv en anden browser
4. Slet localStorage og start forfra:
   ```javascript
   localStorage.removeItem('vacationEmployees')
   ```

## 📧 Support

For spørgsmål eller hjælp, kontakt din system administrator.

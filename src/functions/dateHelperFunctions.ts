// Segédfüggvény egy dátum YYYY-MM-DD fromátumba írásához
export function getFormattedDateForDateSelect(date: Date) {
    const year = date.getFullYear(); // Évszám deklarálása
    const baseMonth = date.getMonth() + 1; // Hónap deklarálása 0-tól 11-ig
    const baseDay = date.getDate(); // Nap deklarálása

    const month = baseMonth < 10 ? "0" + baseMonth : baseMonth.toString(); // Hónap adat kétszámjegyűvé alaktítása
    const day = baseDay < 10 ? "0" + baseDay : baseDay.toString(); // Nap adat kétszámjegyűvé alakítása

    return year + "-" + month + "-" + day; // Dátim formázása és visszaküldése szövegként
}

// Segédfüggvény egy dátum képernyőn megjeleníthető szerkezetre formázásához
export function getFormattedDateForPage(date: Date) {
    const year = date.getFullYear(); // Évszám deklarálása
    const baseMonth = date.getMonth() + 1; // Hónap deklarálása 0-tól 11-ig
    const baseDay = date.getDate(); // Nap deklarálása

    const month = baseMonth < 10 ? "0" + baseMonth : baseMonth.toString() // Hónap adat kétszámjegyűvé alaktítása
    const day = baseDay < 10 ? "0" + baseDay : baseDay.toString(); // Nap adat kétszámjegyűvé alakítása

    return year + "." + month + "." + day + "."; // Dátim formázása és visszaküldése szövegként
}

// Segédfüggvény a hétfői dátum lekérdezésére
export function getMonday() {
    const now = new Date(); // Az aktuális dátum
    // Az aktuális dátumból a hét jelenlegi napját (0 - 6) kell kivonni majd módosítani azt számolva a vasárnap kezdődő héttel
    const offset = now.getDate() - now.getDay() + (now.getDay() == 0 ? -6 : 1);
    return new Date(now.setDate(offset)); // Eltolt dátum visszaküldése
}

// Segédfüggvény a vasárnapi dátum lekérdezésére
export function getSunday() {
    const monday = getMonday(); // A hétfői dátum
    return new Date(monday.setDate(monday.getDate() + 6)) // Eltolt dátum visszaküldése
}

// Segédfüggvény a hét dátumainak megállapításához
export function getDatesOfWeek() {
    const monday = getMonday();
    const mondayDate = monday.getDate();
    let dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
        dates.push(new Date(monday.setDate(mondayDate + i)));
    }
    return dates;
}

export function getDatesBetween(date1: Date, date2: Date) {
    let dates: Date[] = [];

    if (date1.getTime() > date2.getTime()) {
        let temp = date1;
        date1 = date2;
        date2 = temp;
    }

    while (date1 <= date2) {
        dates.push(new Date(date1));
        date1.setDate(date1.getDate() + 1);
    }

    return dates;
}

export function canDropOrder(date1: Date): boolean {
    const now = new Date();
    const dateOfMeal = new Date(date1);
    const cutoff = new Date(dateOfMeal);
    cutoff.setDate(dateOfMeal.getDate() - 1);
    cutoff.setHours(12, 0, 0, 0);
    
    return cutoff > now;
}
/**
 * Dodaje nowy obiekt dnia do tablicy lub aktualizuje istniejący,
 * jeśli wpis dla tej samej daty (rok, miesiąc, dzień) już istnieje.
 * @param {Array} allDaysData - Główna tablica przechowująca dane wszystkich dni.
 * @param {Object} newDayData - Obiekt z danymi dnia do dodania/aktualizacji.
 */
const addOrUpdateDayData = (allDaysData, newDayData) => {
  // Znajdź indeks dnia, który ma ten sam rok, miesiąc i dzień
  const existingDayIndex = allDaysData.findIndex(day => 
    day.year == newDayData.year &&
    day.month == newDayData.month &&
    day.day == newDayData.day
  );

  if (existingDayIndex > -1) {
    // Jeśli dzień został znaleziony (indeks jest większy od -1),
    // zaktualizuj go (podmień stary obiekt na nowy)
    allDaysData[existingDayIndex] = newDayData;
    console.log(`Zaktualizowano dane dla dnia: ${newDayData.day}-${newDayData.month}-${newDayData.year}`);
  } else {
    // Jeśli dzień nie został znaleziony,
    // dodaj nowy obiekt na koniec tablicy
    allDaysData.push(newDayData);
    console.log(`Dodano nowe dane для dnia: ${newDayData.day}-${newDayData.month}-${newDayData.year}`);
  }
};
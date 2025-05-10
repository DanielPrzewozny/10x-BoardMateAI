/**
 * Globalny setup przed uruchomieniem testów E2E.
 * 
 * Ten plik jest wykonywany raz przed uruchomieniem wszystkich testów.
 * Ustawia zmienne środowiskowe i przeprowadza niezbędne konfiguracje.
 */

// Zapisz czas rozpoczęcia testów, aby później usunąć tylko dane utworzone podczas testów
export default async function globalSetup() {
  // Ustaw czas rozpoczęcia testów, aby można było go użyć do filtrowania rekordów przy czyszczeniu
  process.env.E2E_TEST_START_TIME = new Date().toISOString();
  
  console.log(`Rozpoczęcie testów E2E: ${process.env.E2E_TEST_START_TIME}`);
  
  // Tutaj możesz dodać inne operacje inicjalizacyjne, jak:
  // - Przygotowanie danych testowych
  // - Inicjalizacja zewnętrznych serwisów
  // - Konfiguracja środowiska testowego
} 
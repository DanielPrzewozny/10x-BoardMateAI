# Plan implementacji widoku Historii Gier

## 1. Przegląd
Widok "Historia Gier" umożliwia użytkownikom przeglądanie ich historii rozgrywek w gry planszowe. Zawiera filtrowalną listę gier, w które grali, wraz ze szczegółowymi informacjami o każdej sesji, takimi jak data, czas trwania, liczba graczy i wynik.

## 2. Routing widoku
Ścieżka, na której widok powinien być dostępny: `/history`

## 3. Struktura komponentów
- **HistoryView** (główny komponent)
  - **HistoryFilters** (panel filtrów)
  - **HistoryTable** (tabela z historią)
  - **GameSessionDetails** (szczegóły sesji)
  - **ExportButton** (przycisk eksportu danych)

## 4. Szczegóły komponentów
### HistoryView
- Opis komponentu: Główny kontener widoku historii.
- Główne elementy:
  - Panel filtrów
  - Tabela z historią gier
  - Przycisk eksportu
- Obsługiwane interakcje:
  - Filtrowanie historii
  - Sortowanie wyników
  - Eksport danych
- Typy:
  - `GameHistoryListDTO`
- Propsy:
  - `initialFilters`: początkowe wartości filtrów

### HistoryFilters
- Opis komponentu: Panel filtrów do zawężania historii.
- Główne elementy:
  - Wybór zakresu dat
  - Wybór konkretnych gier
  - Filtry wyników
- Obsługiwane interakcje:
  - Zmiana zakresu dat
  - Wybór gier
  - Resetowanie filtrów
- Typy:
  - `HistoryFilters`
- Propsy:
  - `filters`: aktualne wartości filtrów
  - `onFilterChange`: funkcja obsługująca zmiany

### HistoryTable
- Opis komponentu: Tabela prezentująca historię gier.
- Główne elementy:
  - Kolumny z danymi
  - Sortowanie
  - Paginacja
- Obsługiwane interakcje:
  - Sortowanie po kolumnach
  - Zmiana strony
  - Wyświetlenie szczegółów sesji
- Typy:
  - `GameHistoryDTO[]`
- Propsy:
  - `history`: lista sesji
  - `pagination`: dane paginacji
  - `onRowClick`: funkcja obsługująca kliknięcie wiersza

### GameSessionDetails
- Opis komponentu: Modal ze szczegółami sesji gry.
- Główne elementy:
  - Informacje o grze
  - Statystyki sesji
  - Notatki
  - Przyciski akcji
- Obsługiwane interakcje:
  - Edycja notatek
  - Usuwanie sesji
  - Zamknięcie modalu
- Typy:
  - `GameHistoryDTO`
- Propsy:
  - `session`: dane sesji
  - `onClose`: funkcja zamykająca modal
  - `onEdit`: funkcja edytująca sesję

## 5. Typy
```typescript
interface HistoryFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  games: string[];
  results: string[];
}

interface SessionStats {
  averageScore: number;
  totalTime: number;
  gamesPlayed: number;
}
```

## 6. Zarządzanie stanem
- Wykorzystanie `useState` do przechowywania filtrów i aktywnej sesji
- Wykorzystanie `useQuery` do pobierania i cachowania historii
- Wykorzystanie `useCallback` dla funkcji obsługujących akcje

## 7. Integracja API
- Endpoint `GET /api/game-history` do pobierania historii
- Endpoint `PUT /api/game-history/{id}` do aktualizacji sesji
- Endpoint `DELETE /api/game-history/{id}` do usuwania sesji
- Endpoint `GET /api/game-history/export` do eksportu danych

## 8. Interakcje użytkownika
1. Użytkownik może filtrować i sortować historię gier
2. Kliknięcie w wiersz otwiera szczegóły sesji
3. Możliwość edycji notatek i usuwania sesji
4. Eksport historii do pliku CSV

## 9. Warunki i walidacja
- Zakres dat nie może przekraczać roku wstecz
- Notatki ograniczone do 500 znaków
- Walidacja poprawności dat i wartości liczbowych

## 10. Obsługa błędów
- Wyświetlanie komunikatu przy braku historii
- Obsługa błędów API
- Potwierdzenie przed usunięciem sesji
- Zabezpieczenie przed utratą niezapisanych zmian

## 11. Kroki implementacji
1. Utworzenie podstawowej struktury komponentów
2. Implementacja tabeli historii
3. Dodanie filtrów i sortowania
4. Implementacja szczegółów sesji
5. Integracja z API
6. Dodanie eksportu danych
7. Implementacja edycji i usuwania
8. Stylizacja komponentów
9. Testy jednostkowe i integracyjne 
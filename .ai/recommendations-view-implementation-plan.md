# Plan implementacji widoku Rekomendacji Gier

## 1. Przegląd
Widok "Rekomendacje Gier" prezentuje użytkownikom spersonalizowane rekomendacje gier planszowych na podstawie ich preferencji i historii. Widok zawiera filtry, listę rekomendacji oraz szczegółowe informacje o każdej grze.

## 2. Routing widoku
Ścieżka, na której widok powinien być dostępny: `/recommendations`

## 3. Struktura komponentów
- **RecommendationsView** (główny komponent)
  - **FilterPanel** (panel filtrów)
  - **GameList** (lista rekomendowanych gier)
  - **GameCard** (karta pojedynczej gry)
  - **LoadingSpinner** (wskaźnik ładowania)

## 4. Szczegóły komponentów
### RecommendationsView
- Opis komponentu: Główny kontener widoku rekomendacji.
- Główne elementy:
  - Panel filtrów
  - Lista rekomendowanych gier
  - Paginacja
- Obsługiwane interakcje:
  - Filtrowanie rekomendacji
  - Przewijanie listy gier
  - Odświeżanie rekomendacji
- Typy:
  - `GameRecommendationsResponseDto`
- Propsy:
  - `initialFilters`: początkowe wartości filtrów

### FilterPanel
- Opis komponentu: Panel z filtrami do zawężania rekomendacji.
- Główne elementy:
  - Suwaki do wyboru liczby graczy i czasu gry
  - Wybór typów gier
  - Suwak poziomu złożoności
- Obsługiwane interakcje:
  - Zmiana wartości filtrów
  - Resetowanie filtrów
- Typy:
  - `RecommendationDTO` (filtry)
- Propsy:
  - `filters`: aktualne wartości filtrów
  - `onFilterChange`: funkcja obsługująca zmiany filtrów

### GameList
- Opis komponentu: Lista rekomendowanych gier.
- Główne elementy:
  - Karty gier
  - Paginacja
  - Komunikat o braku wyników
- Obsługiwane interakcje:
  - Przewijanie listy
  - Zmiana strony
- Typy:
  - `GameRecommendation[]`
- Propsy:
  - `games`: lista gier
  - `pagination`: dane paginacji

### GameCard
- Opis komponentu: Karta prezentująca pojedynczą rekomendowaną grę.
- Główne elementy:
  - Zdjęcie gry
  - Tytuł i podstawowe informacje
  - Wskaźnik dopasowania
  - Przyciski akcji
- Obsługiwane interakcje:
  - Wyświetlenie szczegółów gry
  - Dodanie do ulubionych
  - Oznaczenie jako "zagrane"
- Typy:
  - `GameRecommendation`
- Propsy:
  - `game`: dane gry
  - `onGameAction`: funkcja obsługująca akcje

## 5. Typy
```typescript
interface RecommendationFilters {
  players: number;
  duration: number;
  types: string[];
  complexity: number;
}

interface GameMatch {
  score: number;
  reasons: string[];
}
```

## 6. Zarządzanie stanem
- Wykorzystanie `useState` do przechowywania filtrów
- Wykorzystanie `useQuery` do pobierania i cachowania rekomendacji
- Wykorzystanie `useCallback` dla funkcji obsługujących akcje

## 7. Integracja API
- Endpoint `GET /api/recommendations` do pobierania rekomendacji
- Endpoint `POST /api/recommendations/feedback` do wysyłania feedbacku

## 8. Interakcje użytkownika
1. Użytkownik może dostosować filtry rekomendacji
2. Lista gier aktualizuje się automatycznie po zmianie filtrów
3. Użytkownik może przeglądać szczegóły gier i wykonywać akcje
4. Dostępna jest paginacja dla dużej liczby wyników

## 9. Warunki i walidacja
- Filtry muszą mieć wartości w określonych zakresach
- Liczba graczy: 1-10
- Czas gry: 15-300 minut
- Złożoność: 1-5

## 10. Obsługa błędów
- Wyświetlanie komunikatu przy braku rekomendacji
- Obsługa błędów API
- Fallback dla niedostępnych obrazów gier
- Obsługa stanu ładowania danych

## 11. Kroki implementacji
1. Utworzenie podstawowej struktury komponentów
2. Implementacja panelu filtrów
3. Implementacja listy gier i kart
4. Integracja z API rekomendacji
5. Dodanie paginacji
7. Dodanie animacji i przejść
8. Optymalizacja wydajności
9. Testy jednostkowe i integracyjne 
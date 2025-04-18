# Plan implementacji widoku Nowy Widok

## 1. Przegląd
Nowy widok ma na celu umożliwienie użytkownikom przeglądania rekomendacji gier, zarządzania historią gier oraz edycji profilu użytkownika. Widok jest zaprojektowany z myślą o intuicyjności i responsywności, z uwzględnieniem trybu ciemnego/jasnego.

## 2. Routing widoku
Ścieżka, na której widok powinien być dostępny: `/new-view`

## 3. Struktura komponentów
- Widok główny
  - Lista rekomendacji
  - Panel filtrów
  - Pole wyszukiwania
- Widok szczegółów gry
  - Karta gry
  - Karuzela podobnych tytułów
  - Sekcja recenzji
- Widok historii gier
  - Timeline
  - Filtry
- Widok profilu użytkownika
  - Formularz preferencji
  - Sekcja statystyk
- Widok 404
  - Grafika
  - Tekst błędu

## 4. Szczegóły komponentów
### Lista rekomendacji
- Opis komponentu: Wyświetla rekomendowane gry dla użytkownika.
- Główne elementy: Karty gier, przyciski nawigacyjne.
- Obsługiwane interakcje: Kliknięcie na kartę gry.
- Obsługiwana walidacja: Sprawdzenie dostępności rekomendacji.
- Typy: `BoardGameDTO`
- Propsy: `recommendations`

### Panel filtrów
- Opis komponentu: Umożliwia filtrowanie gier według różnych kryteriów.
- Główne elementy: Pola wyboru, przyciski zastosowania.
- Obsługiwane interakcje: Zmiana wartości filtrów.
- Obsługiwana walidacja: Sprawdzenie poprawności wartości filtrów.
- Typy: `FilterOptions`
- Propsy: `filters`

### Pole wyszukiwania
- Opis komponentu: Pozwala użytkownikom na szybkie wyszukiwanie gier.
- Główne elementy: Pole tekstowe, przycisk wyszukiwania.
- Obsługiwane interakcje: Wprowadzenie tekstu, kliknięcie przycisku.
- Obsługiwana walidacja: Sprawdzenie długości tekstu wyszukiwania.
- Typy: `SearchQuery`
- Propsy: `onSearch`

## 5. Typy
- `BoardGameDTO`: Zawiera dane gry planszowej.
- `FilterOptions`: Zawiera opcje filtrów dla gier.
- `SearchQuery`: Zawiera dane zapytania wyszukiwania.

## 6. Zarządzanie stanem
Stan widoku będzie zarządzany za pomocą niestandardowych hooków, takich jak `useRecommendations`, `useGameHistory`, i `useUserProfile`, które będą odpowiedzialne za pobieranie i aktualizację danych.

## 7. Integracja API
Widok będzie integrować się z API poprzez wywołania:
- `GET /api/recommendations`: Pobranie rekomendacji.
- `GET /api/history`: Pobranie historii gier.
- `PATCH /api/profiles/{id}`: Aktualizacja profilu użytkownika.

## 8. Interakcje użytkownika
- Kliknięcie na grę w liście rekomendacji przenosi do widoku szczegółów gry.
- Zastosowanie filtrów aktualizuje listę rekomendacji.
- Edycja profilu zapisuje zmiany w preferencjach.

## 9. Warunki i walidacja
- Autoryzacja JWT: Weryfikacja tokenu przed wykonaniem żądania.
- Walidacja danych wejściowych: Sprawdzenie poprawności danych przed wysłaniem.

## 10. Obsługa błędów
- Błąd autoryzacji: Wyświetlenie komunikatu o błędzie.
- Nieprawidłowe dane wejściowe: Wyświetlenie komunikatu o błędzie walidacji.

## 11. Kroki implementacji
1. Stworzenie komponentu Lista rekomendacji.
2. Implementacja Panelu filtrów.
3. Dodanie funkcjonalności Pola wyszukiwania.
4. Integracja z API dla pobierania rekomendacji i historii gier.
5. Testowanie i walidacja interakcji użytkownika.
6. Obsługa błędów i przypadków brzegowych. 
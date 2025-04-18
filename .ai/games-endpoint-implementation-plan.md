# API Endpoint Implementation Plan: Board Games Management

## 1. Przegląd punktów końcowych
Endpointy służą do zarządzania grami planszowymi. Ich zadaniem jest:
- Pobieranie listy gier planszowych z filtrowaniem i paginacją
- Pobieranie szczegółów konkretnej gry
- Walidacja parametrów wyszukiwania
- Optymalizacja wydajności przy dużych zbiorach danych

## 2. Szczegóły żądań

### GET /api/games
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/games`
- **Parametry**:
  - **Opcjonalne**: 
    - `page`: (number) - numer strony
    - `limit`: (number) - liczba elementów na stronie
    - `sort`: (string) - pole sortowania
    - `complexity`: (number) - poziom złożoności (1-5)
    - `players`: (number) - liczba graczy
    - `duration`: (number) - czas gry
    - `types`: (string[]) - typy gier

### GET /api/games/{id}
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/games/{id}`
- **Parametry ścieżki**:
  - **id**: (UUID) - identyfikator gry

## 3. Wykorzystywane typy
```typescript
interface BoardGame {
  id: string;
  title: string;
  complexity: number;
  min_players: number;
  max_players: number;
  duration: number;
  description: string;
  isArchived: boolean;
  types: GameType[];
}

interface GameType {
  id: string;
  type: string;
}

interface PaginatedBoardGames {
  items: BoardGame[];
  total: number;
  page: number;
  limit: number;
}

interface GameFilters {
  complexity?: number;
  players?: number;
  duration?: number;
  types?: string[];
}
```

## 4. Szczegóły odpowiedzi

### GET /api/games
- **200 OK**: 
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "string",
      "complexity": "number",
      "min_players": "number",
      "max_players": "number",
      "duration": "number",
      "description": "string",
      "isArchived": "boolean",
      "types": [
        {
          "id": "uuid",
          "type": "string"
        }
      ]
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

### GET /api/games/{id}
- **200 OK**: Pojedynczy obiekt BoardGame
- **404 Not Found**: Gdy nie znaleziono gry

## 5. Przepływ danych
- **GET /api/games**:
  1. Walidacja parametrów zapytania
  2. Konwersja parametrów na filtry bazy danych
  3. Pobranie gier z zastosowaniem filtrów
  4. Zastosowanie paginacji i sortowania
  5. Zwrot wyników

- **GET /api/games/{id}**:
  1. Walidacja parametru id
  2. Pobranie gry z bazy danych wraz z relacjami
  3. Zwrot danych gry lub 404

## 6. Względy bezpieczeństwa
- Walidacja wszystkich parametrów wejściowych
- Zabezpieczenie przed SQL injection
- Ograniczenie maksymalnej wielkości strony
- Filtrowanie zarchiwizowanych gier dla zwykłych użytkowników

## 7. Obsługa błędów
- Walidacja zakresów liczbowych (complexity, players, duration)
- Walidacja poprawności UUID dla types
- Obsługa błędów bazy danych
- Logowanie błędów do systemu monitoringu

## 8. Rozważania dotyczące wydajności
- Indeksy na kolumnach używanych do filtrowania
- Cache'owanie popularnych zapytań
- Optymalizacja zapytań przez odpowiednie relacje
- Implementacja ETags dla cachowania po stronie klienta
- Kompresja odpowiedzi dla dużych zbiorów danych

## 9. Etapy wdrożenia
1. Utworzenie plików endpointów w `/src/pages/api/games`
2. Implementacja schematów walidacji przy użyciu zod
3. Utworzenie serwisu `/src/lib/games.service.ts`
4. Implementacja filtrowania i paginacji
5. Dodanie cache'owania
6. Implementacja logiki biznesowej
7. Dodanie testów jednostkowych i integracyjnych
8. Konfiguracja monitoringu i logowania
9. Dokumentacja API w Swagger/OpenAPI

## 10. Integracja z innymi modułami
- Powiązanie z systemem rekomendacji
- Integracja z systemem ulubionych
- Powiązanie z systemem ocen i recenzji
- Wykorzystanie w historii gier 
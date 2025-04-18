# API Endpoint Implementation Plan: Favorites Management

## 1. Przegląd punktów końcowych
Endpointy służą do zarządzania ulubionymi grami użytkownika. Ich zadaniem jest:
- Pobieranie listy ulubionych gier użytkownika
- Dodawanie gier do ulubionych
- Usuwanie gier z ulubionych
- Walidacja danych wejściowych
- Zapewnienie spójności danych

## 2. Szczegóły żądań

### GET /api/favorites
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/favorites`
- **Parametry**:
  - **Opcjonalne**: 
    - `page`: (number) - numer strony
    - `limit`: (number) - liczba elementów na stronie
    - `sort`: (string) - pole sortowania

### POST /api/favorites
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/favorites`
- **Request Body**: 
```json
{
  "gameId": "uuid",
  "notes": "optional string"
}
```

### DELETE /api/favorites/{gameId}
- **Metoda HTTP**: `DELETE`
- **Struktura URL**: `/api/favorites/{gameId}`
- **Parametry ścieżki**:
  - `gameId`: (UUID) - identyfikator gry do usunięcia

## 3. Wykorzystywane typy
```typescript
interface FavoriteGame {
  id: string;
  userId: string;
  gameId: string;
  addedAt: Date;
  notes?: string;
  game: BoardGame; // Relacja do tabeli BoardGames
}

interface FavoriteGameDTO {
  gameId: string;
  notes?: string;
}

interface PaginatedFavoriteGames {
  items: FavoriteGame[];
  total: number;
  page: number;
  limit: number;
}
```

## 4. Szczegóły odpowiedzi

### GET /api/favorites
- **200 OK**: 
```json
{
  "items": [
    {
      "id": "uuid",
      "gameId": "uuid",
      "addedAt": "ISO date",
      "notes": "string",
      "game": {
        "title": "string",
        "complexity": "number",
        // ... reszta pól z BoardGame
      }
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```
- **404 Not Found**: Gdy nie znaleziono żadnych ulubionych

### POST /api/favorites
- **201 Created**: Utworzony obiekt FavoriteGame
- **400 Bad Request**: Błędne dane lub gra już w ulubionych
- **404 Not Found**: Gdy nie znaleziono gry o podanym ID

### DELETE /api/favorites/{gameId}
- **204 No Content**: Pomyślnie usunięto
- **404 Not Found**: Gdy nie znaleziono gry w ulubionych

## 5. Przepływ danych
- **GET**: 
  1. Walidacja parametrów paginacji
  2. Pobranie ulubionych gier użytkownika z relacją do BoardGames
  3. Zastosowanie paginacji i sortowania
  4. Zwrot wyników

- **POST**:
  1. Walidacja danych wejściowych
  2. Sprawdzenie czy gra istnieje i nie jest zarchiwizowana
  3. Sprawdzenie czy gra nie jest już w ulubionych
  4. Utworzenie nowego wpisu w FavoriteGames
  5. Zwrot utworzonego obiektu

- **DELETE**:
  1. Sprawdzenie czy gra jest w ulubionych użytkownika
  2. Usunięcie wpisu z FavoriteGames
  3. Zwrot statusu 204

## 6. Względy bezpieczeństwa
- Wykorzystanie Supabase Auth do uwierzytelniania
- Row Level Security (RLS) na poziomie bazy danych
- Walidacja wszystkich danych wejściowych przy użyciu zod
- Zabezpieczenie przed race conditions przy dodawaniu/usuwaniu

## 7. Obsługa błędów
- Implementacja middleware do obsługi błędów
- Logowanie błędów do systemu monitoringu
- Zwracanie użytkownikowi przyjaznych komunikatów
- Obsługa przypadków granicznych (np. próba dodania już ulubionej gry)

## 8. Rozważania dotyczące wydajności
- Indeksy na kolumnach userId i gameId
- Implementacja cache'owania dla często pobieranych list
- Optymalizacja zapytań przez odpowiednie relacje
- Monitoring wydajności endpointów

## 9. Etapy wdrożenia
1. Utworzenie plików endpointów w `/src/pages/api/favorites`
2. Implementacja walidacji przy użyciu zod
3. Utworzenie serwisu `/src/lib/favorites.service.ts`
4. Konfiguracja Row Level Security w Supabase
5. Implementacja logiki biznesowej
6. Dodanie testów jednostkowych i integracyjnych
7. Konfiguracja monitoringu i logowania
8. Dokumentacja API w Swagger/OpenAPI 
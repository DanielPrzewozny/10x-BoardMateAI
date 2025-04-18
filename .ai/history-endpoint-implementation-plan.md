# API Endpoint Implementation Plan: Game History Management

## 1. Przegląd punktów końcowych
Endpointy służą do zarządzania historią gier użytkownika. Ich zadaniem jest:
- Pobieranie historii gier użytkownika
- Zapisywanie nowych interakcji z grami
- Analiza statystyk gier
- Integracja z systemem rekomendacji

## 2. Szczegóły żądań

### GET /api/history
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/history`
- **Parametry**:
  - **Opcjonalne**: 
    - `page`: (number) - numer strony
    - `limit`: (number) - liczba elementów na stronie
    - `sort`: (string) - pole sortowania
    - `interactionType`: (string) - typ interakcji (played, abandoned, recommended)

### POST /api/history
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/history`
- **Request Body**: 
```json
{
  "gameId": "uuid",
  "durationPlayed": "number",
  "interactionType": "string",
  "sessionDuration": "number",
  "score": "number?",
  "notes": "string?"
}
```

## 3. Wykorzystywane typy
```typescript
interface GameHistory {
  id: string;
  userId: string;
  gameId: string;
  playedAt: Date;
  durationPlayed: number;
  interactionType: InteractionType;
  sessionDuration: number;
  score?: number;
  notes?: string;
  game: BoardGame;
}

enum InteractionType {
  PLAYED = 'played',
  ABANDONED = 'abandoned',
  RECOMMENDED = 'recommended'
}

interface CreateHistoryDTO {
  gameId: string;
  durationPlayed: number;
  interactionType: InteractionType;
  sessionDuration: number;
  score?: number;
  notes?: string;
}

interface PaginatedHistory {
  items: GameHistory[];
  total: number;
  page: number;
  limit: number;
}

interface GameStats {
  totalGamesPlayed: number;
  totalPlayTime: number;
  averagePlayTime: number;
  favoriteGameType: string;
  mostPlayedGame: {
    gameId: string;
    title: string;
    playCount: number;
  };
}
```

## 4. Szczegóły odpowiedzi

### GET /api/history
- **200 OK**: 
```json
{
  "items": [
    {
      "id": "uuid",
      "gameId": "uuid",
      "playedAt": "ISO date",
      "durationPlayed": "number",
      "interactionType": "string",
      "sessionDuration": "number",
      "score": "number?",
      "notes": "string?",
      "game": {
        "title": "string",
        "complexity": "number"
      }
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

### POST /api/history
- **201 Created**: Utworzony wpis historii
- **400 Bad Request**: Błędne dane wejściowe
- **404 Not Found**: Gdy nie znaleziono gry

## 5. Przepływ danych
- **GET**:
  1. Walidacja parametrów zapytania
  2. Pobranie historii użytkownika z relacjami
  3. Filtrowanie według typu interakcji
  4. Zastosowanie paginacji i sortowania
  5. Zwrot wyników

- **POST**:
  1. Walidacja danych wejściowych
  2. Sprawdzenie czy gra istnieje
  3. Utworzenie wpisu w historii
  4. Aktualizacja statystyk użytkownika
  5. Zwrot utworzonego wpisu

## 6. Względy bezpieczeństwa
- Wykorzystanie Supabase Auth do uwierzytelniania
- Row Level Security (RLS) na poziomie bazy danych
- Walidacja wszystkich danych wejściowych przy użyciu zod
- Weryfikacja poprawności wartości liczbowych
- Zabezpieczenie przed nadmierną ilością requestów

## 7. Obsługa błędów
- Walidacja poprawności gameId
- Sprawdzanie zakresu wartości durationPlayed i sessionDuration
- Weryfikacja poprawności typu interakcji
- Logowanie błędów do systemu monitoringu
- Przyjazne komunikaty błędów dla użytkownika

## 8. Rozważania dotyczące wydajności
- Indeksy na kolumnach userId, gameId i playedAt
- Cache'owanie statystyk użytkownika
- Optymalizacja zapytań przez odpowiednie relacje
- Asynchroniczne aktualizacje statystyk
- Monitoring wydajności endpointów

## 9. Etapy wdrożenia
1. Utworzenie plików endpointów w `/src/pages/api/history`
2. Implementacja schematów walidacji przy użyciu zod
3. Utworzenie serwisu `/src/lib/history.service.ts`
4. Konfiguracja Row Level Security w Supabase
5. Implementacja logiki biznesowej
6. Implementacja generowania statystyk
7. Dodanie testów jednostkowych i integracyjnych
8. Konfiguracja monitoringu i logowania
9. Dokumentacja API w Swagger/OpenAPI

## 10. Integracja z innymi modułami
- Wpływ na system rekomendacji
- Powiązanie z profilami użytkowników
- Generowanie statystyk i raportów
- Wykorzystanie w analizie preferencji użytkownika
- Integracja z systemem osiągnięć (jeśli zostanie dodany) 
# API Endpoint Implementation Plan: Reviews Management

## 1. Przegląd punktów końcowych
Endpointy służą do zarządzania recenzjami gier planszowych. Ich zadaniem jest:
- Pobieranie recenzji dla konkretnej gry
- Dodawanie nowych recenzji
- Aktualizacja istniejących recenzji
- Usuwanie recenzji
- Zarządzanie głosami pomocności

## 2. Szczegóły żądań

### GET /api/games/{id}/reviews
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/games/{id}/reviews`
- **Parametry ścieżki**:
  - **id**: (UUID) - identyfikator gry
- **Parametry zapytania**:
  - **Opcjonalne**: 
    - `page`: (number) - numer strony
    - `limit`: (number) - liczba elementów na stronie
    - `sort`: (string) - pole sortowania (np. helpfulVotes, createdAt)

### POST /api/games/{id}/reviews
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/games/{id}/reviews`
- **Parametry ścieżki**:
  - **id**: (UUID) - identyfikator gry
- **Request Body**: 
```json
{
  "reviewText": "string",
  "rating": "number (1-5)"
}
```

### PATCH /api/reviews/{id}
- **Metoda HTTP**: `PATCH`
- **Struktura URL**: `/api/reviews/{id}`
- **Parametry ścieżki**:
  - **id**: (UUID) - identyfikator recenzji
- **Request Body**: 
```json
{
  "reviewText": "string",
  "rating": "number (1-5)"
}
```

### DELETE /api/reviews/{id}
- **Metoda HTTP**: `DELETE`
- **Struktura URL**: `/api/reviews/{id}`
- **Parametry ścieżki**:
  - **id**: (UUID) - identyfikator recenzji

## 3. Wykorzystywane typy
```typescript
interface Review {
  id: string;
  userId: string;
  gameId: string;
  reviewText: string;
  createdAt: Date;
  updatedAt: Date;
  helpfulVotes: number;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface CreateReviewDTO {
  reviewText: string;
  rating: number;
}

interface UpdateReviewDTO {
  reviewText?: string;
  rating?: number;
}

interface PaginatedReviews {
  items: Review[];
  total: number;
  page: number;
  limit: number;
}
```

## 4. Szczegóły odpowiedzi

### GET /api/games/{id}/reviews
- **200 OK**: 
```json
{
  "items": [
    {
      "id": "uuid",
      "userId": "uuid",
      "gameId": "uuid",
      "reviewText": "string",
      "createdAt": "ISO date",
      "updatedAt": "ISO date",
      "helpfulVotes": "number",
      "user": {
        "firstName": "string",
        "lastName": "string"
      }
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

### POST /api/games/{id}/reviews
- **201 Created**: Utworzona recenzja
- **400 Bad Request**: Błędne dane lub recenzja już istnieje
- **404 Not Found**: Gdy nie znaleziono gry

### PATCH /api/reviews/{id}
- **200 OK**: Zaktualizowana recenzja
- **400 Bad Request**: Błędne dane
- **404 Not Found**: Gdy nie znaleziono recenzji

### DELETE /api/reviews/{id}
- **204 No Content**: Pomyślnie usunięto
- **404 Not Found**: Gdy nie znaleziono recenzji

## 5. Przepływ danych
- **GET**:
  1. Walidacja parametrów
  2. Sprawdzenie czy gra istnieje
  3. Pobranie recenzji z relacjami
  4. Zastosowanie paginacji i sortowania
  5. Zwrot wyników

- **POST**:
  1. Walidacja danych wejściowych
  2. Sprawdzenie czy gra istnieje i nie jest zarchiwizowana
  3. Sprawdzenie czy użytkownik nie dodał już recenzji
  4. Utworzenie nowej recenzji
  5. Zwrot utworzonej recenzji

- **PATCH**:
  1. Walidacja danych wejściowych
  2. Sprawdzenie uprawnień użytkownika
  3. Aktualizacja recenzji
  4. Zwrot zaktualizowanej recenzji

- **DELETE**:
  1. Sprawdzenie uprawnień użytkownika
  2. Usunięcie recenzji
  3. Zwrot statusu 204

## 6. Względy bezpieczeństwa
- Wykorzystanie Supabase Auth do uwierzytelniania
- Row Level Security (RLS) na poziomie bazy danych
- Walidacja wszystkich danych wejściowych przy użyciu zod
- Zabezpieczenie przed spamem recenzji
- Weryfikacja uprawnień do modyfikacji/usuwania

## 7. Obsługa błędów
- Walidacja długości tekstu recenzji
- Sprawdzanie unikalności recenzji per użytkownik/gra
- Weryfikacja czy gra nie jest zarchiwizowana
- Logowanie błędów do systemu monitoringu
- Przyjazne komunikaty błędów dla użytkownika

## 8. Rozważania dotyczące wydajności
- Indeksy na kolumnach gameId i userId
- Cache'owanie popularnych recenzji
- Paginacja dla dużych zbiorów danych
- Optymalizacja zapytań przez odpowiednie relacje
- Monitoring wydajności endpointów

## 9. Etapy wdrożenia
1. Utworzenie plików endpointów w `/src/pages/api/reviews`
2. Implementacja schematów walidacji przy użyciu zod
3. Utworzenie serwisu `/src/lib/reviews.service.ts`
4. Konfiguracja Row Level Security w Supabase
5. Implementacja logiki biznesowej
6. Implementacja systemu głosów pomocności
7. Dodanie testów jednostkowych i integracyjnych
8. Konfiguracja monitoringu i logowania
9. Dokumentacja API w Swagger/OpenAPI

## 10. Integracja z innymi modułami
- Powiązanie z systemem ocen
- Wpływ na system rekomendacji
- Integracja z powiadomieniami
- Możliwość moderacji recenzji 
# API Endpoint Implementation Plan: Profile Management

## 1. Przegląd punktów końcowych
Endpointy służą do zarządzania profilami użytkowników. Ich zadaniem jest:
- Pobieranie danych profilu użytkownika
- Aktualizacja danych profilu
- Walidacja danych wejściowych
- Integracja z Supabase Auth

## 2. Szczegóły żądań

### GET /api/profiles/{id}
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/profiles/{id}`
- **Parametry ścieżki**:
  - **id**: (UUID) - identyfikator użytkownika

### PATCH /api/profiles/{id}
- **Metoda HTTP**: `PATCH`
- **Struktura URL**: `/api/profiles/{id}`
- **Parametry ścieżki**:
  - **id**: (UUID) - identyfikator użytkownika
- **Request Body**: 
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "accountStatus": "uuid"
}
```

## 3. Wykorzystywane typy
```typescript
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  lastLogin: Date;
  accountStatus: string;
}

interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  accountStatus?: string;
}

interface ProfileValidationError {
  field: string;
  message: string;
}
```

## 4. Szczegóły odpowiedzi

### GET /api/profiles/{id}
- **200 OK**: 
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "createdAt": "ISO date",
  "lastLogin": "ISO date",
  "accountStatus": "uuid"
}
```
- **404 Not Found**: Gdy nie znaleziono profilu

### PATCH /api/profiles/{id}
- **200 OK**: Zaktualizowany profil
- **400 Bad Request**: Błędne dane wejściowe
```json
{
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```
- **404 Not Found**: Gdy nie znaleziono profilu

## 5. Przepływ danych
- **GET**:
  1. Walidacja parametru id
  2. Sprawdzenie uprawnień użytkownika
  3. Pobranie profilu z bazy danych
  4. Zwrot danych profilu lub 404

- **PATCH**:
  1. Walidacja parametru id i danych wejściowych
  2. Sprawdzenie uprawnień użytkownika
  3. Sprawdzenie czy profil istnieje
  4. Aktualizacja profilu w bazie danych
  5. Zwrot zaktualizowanego profilu

## 6. Względy bezpieczeństwa
- Wykorzystanie Supabase Auth do uwierzytelniania
- Row Level Security (RLS) na poziomie bazy danych
- Walidacja wszystkich danych wejściowych przy użyciu zod
- Weryfikacja uprawnień do modyfikacji profilu
- Zabezpieczenie przed jednoczesną edycją profilu

## 7. Obsługa błędów
- Szczegółowa walidacja wszystkich pól wejściowych
- Weryfikacja formatu adresu email
- Sprawdzanie unikalności adresu email
- Logowanie błędów do systemu monitoringu
- Przyjazne komunikaty błędów dla użytkownika

## 8. Rozważania dotyczące wydajności
- Indeks na kolumnie email
- Cache'owanie profili użytkowników
- Optymalizacja zapytań do bazy danych
- Monitoring czasu odpowiedzi endpointów

## 9. Etapy wdrożenia
1. Utworzenie plików endpointów w `/src/pages/api/profiles`
2. Implementacja schematów walidacji przy użyciu zod
3. Utworzenie serwisu `/src/lib/profiles.service.ts`
4. Konfiguracja Row Level Security w Supabase
5. Implementacja logiki biznesowej
6. Dodanie testów jednostkowych i integracyjnych
7. Konfiguracja monitoringu i logowania
8. Dokumentacja API w Swagger/OpenAPI 
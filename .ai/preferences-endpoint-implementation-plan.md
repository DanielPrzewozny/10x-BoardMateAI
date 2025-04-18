# API Endpoint Implementation Plan: User Preferences Management

## 1. Przegląd punktów końcowych
Endpointy służą do zarządzania preferencjami użytkownika dotyczącymi gier planszowych. Ich zadaniem jest:
- Pobieranie preferencji użytkownika
- Aktualizacja preferencji użytkownika
- Walidacja danych wejściowych
- Wykorzystanie preferencji w systemie rekomendacji

## 2. Szczegóły żądań

### GET /api/preferences
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/preferences`
- **Parametry**: Brak

### PUT /api/preferences
- **Metoda HTTP**: `PUT`
- **Struktura URL**: `/api/preferences`
- **Request Body**: 
```json
{
  "preferredComplexity": "number (1-5)",
  "preferredPlayerCount": "number > 0",
  "maxGameDuration": "number > 0",
  "preferredGameTypes": ["uuid"],
  "preferredMechanics": ["uuid"]
}
```

## 3. Wykorzystywane typy
```typescript
interface UserPreferences {
  id: string;
  userId: string;
  preferredComplexity: number;
  preferredPlayerCount: number;
  maxGameDuration: number;
  preferredGameTypes: string[];
  preferredMechanics: string[];
  updatedAt: Date;
  isActive: boolean;
}

interface PreferencesDTO {
  preferredComplexity: number;
  preferredPlayerCount: number;
  maxGameDuration: number;
  preferredGameTypes: string[];
  preferredMechanics: string[];
}

interface PreferencesValidationError {
  field: string;
  message: string;
}
```

## 4. Szczegóły odpowiedzi

### GET /api/preferences
- **200 OK**: 
```json
{
  "preferredComplexity": "number",
  "preferredPlayerCount": "number",
  "maxGameDuration": "number",
  "preferredGameTypes": ["uuid"],
  "preferredMechanics": ["uuid"],
  "updatedAt": "ISO date"
}
```
- **404 Not Found**: Gdy nie znaleziono preferencji dla użytkownika

### PUT /api/preferences
- **200 OK**: Zaktualizowane preferencje
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

## 5. Przepływ danych
- **GET**:
  1. Pobranie ID użytkownika z tokenu
  2. Pobranie aktywnych preferencji użytkownika
  3. Zwrot preferencji lub 404 jeśli nie istnieją

- **PUT**:
  1. Walidacja danych wejściowych
  2. Sprawdzenie istnienia wszystkich referencjonowanych UUID (typy gier, mechaniki)
  3. Dezaktywacja poprzednich preferencji (soft delete)
  4. Utworzenie nowego wpisu preferencji
  5. Zwrot zaktualizowanych preferencji

## 6. Względy bezpieczeństwa
- Wykorzystanie Supabase Auth do uwierzytelniania
- Row Level Security (RLS) na poziomie bazy danych
- Walidacja wszystkich danych wejściowych przy użyciu zod
- Weryfikacja istnienia referencjonowanych UUID
- Zabezpieczenie przed jednoczesną edycją preferencji

## 7. Obsługa błędów
- Szczegółowa walidacja wszystkich pól wejściowych
- Weryfikacja poprawności zakresów liczbowych
- Sprawdzanie istnienia referencjonowanych elementów
- Logowanie błędów do systemu monitoringu
- Przyjazne komunikaty błędów dla użytkownika

## 8. Rozważania dotyczące wydajności
- Indeks na kolumnie userId
- Indeks na kolumnie isActive
- Cache'owanie preferencji użytkownika
- Optymalizacja zapytań sprawdzających referencje
- Monitoring czasu odpowiedzi endpointów

## 9. Etapy wdrożenia
1. Utworzenie plików endpointów w `/src/pages/api/preferences`
2. Implementacja schematów walidacji przy użyciu zod
3. Utworzenie serwisu `/src/lib/preferences.service.ts`
4. Konfiguracja Row Level Security w Supabase
5. Implementacja logiki biznesowej
6. Integracja z systemem rekomendacji
7. Dodanie testów jednostkowych i integracyjnych
8. Konfiguracja monitoringu i logowania
9. Dokumentacja API w Swagger/OpenAPI

## 10. Integracja z systemem rekomendacji
- Automatyczne odświeżanie cache'u rekomendacji po zmianie preferencji
- Wykorzystanie preferencji w algorytmie rekomendacji
- Ważenie poszczególnych preferencji w procesie rekomendacji
- Możliwość rozszerzenia preferencji o dodatkowe parametry 
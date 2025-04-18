# Specyfikacja architektury modułu rejestracji, logowania i odzyskiwania hasła użytkowników

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### Zmiany w warstwie frontendu

- **Strony i komponenty**:
  - **Strona rejestracji**: Formularz rejestracji z polami na adres email, hasło i potwierdzenie hasła. Komponent React do walidacji danych wejściowych i wyświetlania komunikatów błędów.
  - **Strona logowania**: Formularz logowania z polami na adres email i hasło. Komponent React do obsługi sesji użytkownika.
  - **Strona odzyskiwania hasła**: Formularz do wprowadzenia adresu email w celu wysłania linku do resetowania hasła.
  - **Strona resetowania hasła**: Formularz do wprowadzenia nowego hasła po kliknięciu w link z emaila.

- **Layouty**:
  - **Tryb auth**: Layout z przyciskiem wylogowania w prawym górnym rogu, dostępny po zalogowaniu.
  - **Tryb non-auth**: Layout z przyciskiem logowania w prawym górnym rogu, dostępny przed zalogowaniem.

### Rozdzielenie odpowiedzialności

- **Formularze i komponenty client-side React**:
  - Walidacja danych wejściowych (np. poprawność formatu email, długość hasła).
  - Wyświetlanie komunikatów błędów (np. niepoprawne dane logowania, brakujące pola).
  - Integracja z backendem autentykacji poprzez wywołania API.

- **Strony Astro**:
  - Renderowanie stron rejestracji, logowania i odzyskiwania hasła.
  - Nawigacja pomiędzy stronami w zależności od stanu autentykacji użytkownika.

### Przypadki walidacji i komunikaty błędów

- **Rejestracja**: Sprawdzenie unikalności adresu email, zgodności hasła z potwierdzeniem.
- **Logowanie**: Sprawdzenie poprawności danych logowania.
- **Odzyskiwanie hasła**: Sprawdzenie istnienia adresu email w bazie danych.

### Obsługa scenariuszy

- **Rejestracja**: Użytkownik wprowadza dane, otrzymuje email z potwierdzeniem.
- **Logowanie**: Użytkownik wprowadza dane, uzyskuje dostęp do aplikacji.
- **Odzyskiwanie hasła**: Użytkownik wprowadza email, otrzymuje link do resetowania hasła.

## 2. LOGIKA BACKENDOWA

### Struktura endpointów API

- **POST /api/register**: Rejestracja nowego użytkownika.
- **POST /api/login**: Logowanie użytkownika.
- **POST /api/logout**: Wylogowanie użytkownika.
- **POST /api/forgot-password**: Wysłanie linku do resetowania hasła.
- **POST /api/reset-password**: Resetowanie hasła użytkownika.

### Mechanizm walidacji danych wejściowych

- Walidacja danych wejściowych za pomocą bibliotek takich jak `zod` lub `joi`.
- Sprawdzenie poprawności formatu email, długości hasła, zgodności hasła z potwierdzeniem.

### Obsługa wyjątków

- Obsługa błędów związanych z bazą danych (np. duplikaty emaili).
- Obsługa błędów związanych z autentykacją (np. niepoprawne dane logowania).

### Aktualizacja renderowania stron server-side

- Wykorzystanie `@astro.config.mjs` do konfiguracji renderowania stron w zależności od stanu autentykacji użytkownika.

## 3. SYSTEM AUTENTYKACJI

### Wykorzystanie Supabase Auth

- **Rejestracja**: Wykorzystanie Supabase Auth do tworzenia nowych kont użytkowników.
- **Logowanie**: Wykorzystanie Supabase Auth do zarządzania sesjami użytkowników.
- **Wylogowywanie**: Wykorzystanie Supabase Auth do zakończenia sesji użytkownika.
- **Odzyskiwanie konta**: Wykorzystanie Supabase Auth do wysyłania emaili z linkami do resetowania hasła.

## Kluczowe wnioski

- Integracja z Supabase Auth pozwala na efektywne zarządzanie autentykacją użytkowników.
- Rozdzielenie odpowiedzialności pomiędzy komponenty React i strony Astro umożliwia elastyczne zarządzanie interfejsem użytkownika.
- Walidacja danych wejściowych i obsługa wyjątków zapewniają bezpieczeństwo i poprawność działania aplikacji. 
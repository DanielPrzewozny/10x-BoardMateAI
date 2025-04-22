# Plan implementacji widoku Rejestracji

## 1. Przegląd
Widok "Rejestracja" umożliwia nowym użytkownikom utworzenie konta w aplikacji BoardMate AI. Użytkownicy mogą zarejestrować się poprzez formularz lub za pomocą zewnętrznych dostawców tożsamości (Google, Facebook).

## 2. Routing widoku
Ścieżka, na której widok powinien być dostępny: `/register`

## 3. Struktura komponentów
- **RegistrationForm** (główny komponent)
  - **EmailInput** (komponent do wprowadzania emaila)
  - **PasswordInput** (komponent do wprowadzania hasła)
  - **ConfirmPasswordInput** (komponent do potwierdzenia hasła)
  - **SubmitButton** (przycisk do zatwierdzania formularza)

## 4. Szczegóły komponentów
### RegistrationForm
- Opis komponentu: Główny formularz rejestracji użytkownika.
- Główne elementy:
  - Pola do wprowadzania danych osobowych
  - Pola do wprowadzania hasła
  - Przyciski do rejestracji przez zewnętrznych dostawców
  - Checkbox akceptacji regulaminu
- Obsługiwane interakcje:
  - Rejestracja przez email/hasło
  - Rejestracja przez Google/Facebook
  - Walidacja formularza
- Obsługiwana walidacja:
  - Email: unikalność i poprawny format
  - Hasło: wymagania bezpieczeństwa
  - Potwierdzenie hasła: zgodność
- Typy:
  - `RegistrationData`
- Propsy:
  - `onSubmit`: funkcja do obsługi rejestracji

### EmailInput
- Opis komponentu: Pole do wprowadzania adresu email.
- Główne elementy: Pole tekstowe z walidacją.
- Obsługiwane interakcje: Wprowadzanie i walidacja emaila.
- Obsługiwana walidacja:
  - Format adresu email
  - Unikalność adresu
- Typy:
  - `string`
- Propsy:
  - `value`: wartość pola
  - `onChange`: funkcja obsługująca zmiany
  - `error`: komunikat błędu

### PasswordInput
- Opis komponentu: Pole do wprowadzania hasła.
- Główne elementy:
  - Pole tekstowe typu password
  - Wskaźnik siły hasła
  - Przycisk pokazywania/ukrywania hasła
- Obsługiwane interakcje:
  - Wprowadzanie hasła
  - Przełączanie widoczności hasła
- Obsługiwana walidacja:
  - Minimalna długość: 8 znaków
  - Wymagane znaki specjalne
  - Wymagane cyfry
- Typy:
  - `string`
- Propsy:
  - `value`: wartość pola
  - `onChange`: funkcja obsługująca zmiany
  - `error`: komunikat błędu

## 5. Typy
```typescript
interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}
```

## 6. Zarządzanie stanem
- Wykorzystanie `useState` do przechowywania danych formularza
- Wykorzystanie `useForm` do zarządzania walidacją
- Wykorzystanie `useAuth` do zarządzania procesem rejestracji

## 7. Integracja API
- Endpoint `POST /api/auth/register` do rejestracji przez email/hasło
- Endpoint `GET /api/auth/check-email` do sprawdzania dostępności emaila

## 8. Interakcje użytkownika
1. Użytkownik wypełnia formularz rejestracji
2. System waliduje dane w czasie rzeczywistym
3. Po udanej rejestracji następuje:
   - Automatyczne logowanie
   - Przekierowanie do formularza preferencji
4. W przypadku błędów wyświetlane są odpowiednie komunikaty

## 9. Warunki i walidacja
- Email musi być unikalny w systemie
- Hasło musi spełniać wymagania bezpieczeństwa
- Wymagana akceptacja regulaminu
- Walidacja w czasie rzeczywistym

## 10. Obsługa błędów
- Wyświetlanie błędów walidacji
- Obsługa błędów API
- Obsługa błędów rejestracji przez dostawców zewnętrznych
- Zabezpieczenie przed wielokrotnym wysłaniem formularza

## 11. Kroki implementacji
1. Utworzenie podstawowej struktury komponentów
2. Implementacja formularza rejestracji
3. Dodanie walidacji pól
4. Integracja z API
5. Implementacja rejestracji przez dostawców zewnętrznych
6. Dodanie obsługi błędów i komunikatów
7. Stylizacja komponentów
8. Testy jednostkowe i integracyjne 
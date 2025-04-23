# Plan implementacji widoku Logowania

## 1. Przegląd
Widok "Logowanie" umożliwia użytkownikom zalogowanie się do aplikacji BoardMate AI. Użytkownicy mogą się zalogować za pomocą adresu email i hasła lub poprzez zewnętrznych dostawców tożsamości (Google, Facebook).

## 2. Routing widoku
Ścieżka, na której widok powinien być dostępny: `/login`

## 3. Struktura komponentów
- **LoginForm** (główny komponent)
  - **EmailInput** (komponent do wprowadzania emaila)
  - **PasswordInput** (komponent do wprowadzania hasła)
  - **SubmitButton** (przycisk do zatwierdzania formularza)

## 4. Szczegóły komponentów
### LoginForm
- Opis komponentu: Główny formularz logowania użytkownika.
- Główne elementy:
  - Pola do wprowadzania emaila i hasła
  - Przyciski do logowania przez zewnętrznych dostawców
  - Link do resetowania hasła
  - Link do rejestracji
- Obsługiwane interakcje:
  - Logowanie przez email/hasło
  - Przekierowanie do resetowania hasła
  - Przekierowanie do rejestracji
- Obsługiwana walidacja:
  - Email: poprawny format adresu email
  - Hasło: minimum 8 znaków
- Typy:
  - `LoginCredentials` (dane logowania)
- Propsy:
  - `onSubmit`: funkcja do obsługi logowania

### EmailInput
- Opis komponentu: Pole do wprowadzania adresu email.
- Główne elementy: Pole tekstowe z walidacją.
- Obsługiwane interakcje: Wprowadzanie i walidacja emaila.
- Obsługiwana walidacja: Format adresu email.
- Typy:
  - `string` (adres email)
- Propsy:
  - `value`: wartość pola
  - `onChange`: funkcja obsługująca zmiany
  - `error`: komunikat błędu

### PasswordInput
- Opis komponentu: Pole do wprowadzania hasła.
- Główne elementy:
  - Pole tekstowe typu password
  - Przycisk pokazywania/ukrywania hasła
- Obsługiwane interakcje:
  - Wprowadzanie hasła
  - Przełączanie widoczności hasła
- Obsługiwana walidacja: Minimalna długość hasła.
- Typy:
  - `string` (hasło)
- Propsy:
  - `value`: wartość pola
  - `onChange`: funkcja obsługująca zmiany
  - `error`: komunikat błędu

## 5. Typy
```typescript
interface LoginCredentials {
  email: string;
  password: string;
}
```

## 6. Zarządzanie stanem
- Wykorzystanie `useState` do przechowywania danych formularza
- Wykorzystanie `useAuth` (custom hook) do zarządzania stanem autentykacji

## 7. Integracja API
- Endpoint `POST /api/auth/login` do logowania przez email/hasło

## 8. Interakcje użytkownika
1. Użytkownik wprowadza email i hasło lub wybiera logowanie przez dostawcę zewnętrznego
2. Po udanym logowaniu następuje przekierowanie do głównego widoku aplikacji
3. W przypadku błędu wyświetlany jest odpowiedni komunikat

## 9. Warunki i walidacja
- Walidacja emaila: poprawny format
- Walidacja hasła: minimum 8 znaków
- Blokada przycisku logowania do czasu wypełnienia wymaganych pól

## 10. Obsługa błędów
- Wyświetlanie komunikatów o błędach walidacji
- Obsługa błędów API (niepoprawne dane, problemy z serwerem)
- Obsługa błędów logowania przez dostawców zewnętrznych

## 11. Kroki implementacji
1. Utworzenie podstawowej struktury komponentów
2. Implementacja formularza logowania
3. Dodanie walidacji pól
4. Integracja z API
5. Implementacja logowania przez dostawców zewnętrznych
6. Dodanie obsługi błędów i komunikatów
7. Stylizacja komponentów
8. Testy jednostkowe i integracyjne 
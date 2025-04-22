# Plan implementacji widoku Uzupełnienie profilu

## 1. Przegląd
Widok "Uzupełnienie profilu" ma na celu umożliwienie użytkownikom wprowadzenia i edytowania preferencji dotyczących gier planszowych. Użytkownicy będą mogli określić liczbę graczy, preferowany czas rozgrywki oraz typy gier, co pozwoli na lepsze dopasowanie rekomendacji gier przez aplikację.

## 2. Routing widoku
Ścieżka, na której widok powinien być dostępny: `/profile`

## 3. Struktura komponentów
- **ProfileForm** (główny komponent)
  - **InputField** (komponent do wprowadzania danych)
  - **SelectField** (komponent do wyboru opcji)
  - **SubmitButton** (przycisk do zapisywania zmian)

## 4. Szczegóły komponentów
### ProfileForm
- Opis komponentu: Główny formularz do uzupełniania profilu użytkownika.
- Główne elementy: 
  - Pola do wprowadzania liczby graczy, preferowanego czasu rozgrywki, typów gier.
  - Przycisk do zapisywania zmian.
- Obsługiwane interakcje: 
  - Zapisanie preferencji po kliknięciu przycisku.
  - Walidacja danych wprowadzonych przez użytkownika.
- Obsługiwana walidacja: 
  - Liczba graczy: musi być liczbą całkowitą w zakresie 1-10.
  - Czas rozgrywki: musi być liczbą całkowitą w zakresie 15-300 minut.
- Typy: 
  - `ProfileDTO` (do przesyłania danych profilu).
- Propsy: 
  - `onSubmit`: funkcja do obsługi zapisu danych.

### InputField
- Opis komponentu: Komponent do wprowadzania danych.
- Główne elementy: Pole tekstowe.
- Obsługiwane interakcje: Wprowadzanie danych przez użytkownika.
- Obsługiwana walidacja: Sprawdzenie, czy pole nie jest puste.
- Typy: 
  - `string` (typ danych wprowadzanych przez użytkownika).
- Propsy: 
  - `label`: etykieta pola.
  - `value`: aktualna wartość pola.
  - `onChange`: funkcja do obsługi zmiany wartości.

### SelectField
- Opis komponentu: Komponent do wyboru opcji.
- Główne elementy: Lista rozwijana.
- Obsługiwane interakcje: Wybór opcji przez użytkownika.
- Obsługiwana walidacja: Sprawdzenie, czy wybrano opcję.
- Typy: 
  - `string[]` (lista dostępnych opcji).
- Propsy: 
  - `options`: dostępne opcje do wyboru.
  - `onChange`: funkcja do obsługi zmiany wybranej opcji.

### SubmitButton
- Opis komponentu: Przycisk do zapisywania zmian.
- Główne elementy: Przycisk.
- Obsługiwane interakcje: Kliknięcie przycisku.
- Obsługiwana walidacja: Sprawdzenie, czy wszystkie pola są poprawnie wypełnione przed wysłaniem.
- Typy: 
  - `void` (brak danych do przesyłania).
- Propsy: 
  - `label`: tekst na przycisku.

## 5. Typy
- `ProfileDTO`: 
  - `id: string`
  - `first_name: string`
  - `last_name: string`
  - `preferred_types: string[]`
  - `min_players: number`
  - `max_players: number`
  - `duration: number`

## 6. Zarządzanie stanem
Zarządzanie stanem będzie realizowane za pomocą hooka `useState` do przechowywania wartości pól formularza oraz `useEffect` do inicjalizacji danych profilu z API.

## 7. Integracja API
Widok będzie integrować się z endpointem `POST /api/profile` do zapisywania preferencji użytkownika. Typ żądania to `ProfileDTO`, a odpowiedź to `201 Created` z nowym obiektem profilu.

## 8. Interakcje użytkownika
Użytkownik wprowadza dane w formularzu, a następnie klika przycisk "Zapisz". Po pomyślnym zapisaniu, użytkownik otrzymuje komunikat o sukcesie.

## 9. Warunki i walidacja
Walidacja będzie sprawdzać, czy wszystkie pola są wypełnione poprawnie przed wysłaniem formularza. W przypadku błędów, użytkownik otrzyma odpowiednie komunikaty.

## 10. Obsługa błędów
W przypadku błędów podczas zapisu (np. 400 Bad Request), użytkownik otrzyma komunikat o błędzie, a formularz pozostanie w stanie edycji.

## 11. Kroki implementacji
1. Utworzenie komponentu `ProfileForm` z odpowiednimi polami.
2. Implementacja komponentów `InputField`, `SelectField` i `SubmitButton`.
3. Dodanie logiki walidacji do formularza.
4. Integracja z API do zapisywania danych profilu.
5. Testowanie widoku pod kątem poprawności działania i walidacji.
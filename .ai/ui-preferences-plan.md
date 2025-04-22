# Architektura UI dla BoardMate AI

## 1. Przegląd struktury UI
Architektura interfejsu użytkownika dla BoardMate AI ma na celu zapewnienie intuicyjnego i responsywnego doświadczenia użytkownika, które umożliwia łatwe wprowadzanie preferencji gier oraz zarządzanie profilem. Interfejs będzie składał się z różnych widoków, które będą ze sobą powiązane, aby umożliwić płynne przejścia i interakcje.

## 2. Lista widoków

### 2.1 Ekran rejestracji
- **Ścieżka widoku**: `/register`
- **Główny cel**: Umożliwienie użytkownikom rejestracji w aplikacji.
- **Kluczowe informacje do wyświetlenia**: Formularz rejestracji z polami na imię, nazwisko, e-mail i hasło.
- **Kluczowe komponenty widoku**: Formularz, przycisk rejestracji, link do logowania.
- **UX, dostępność i względy bezpieczeństwa**: Walidacja pól, komunikaty o błędach, zabezpieczenia hasła.

### 2.2 Ekran logowania
- **Ścieżka widoku**: `/login`
- **Główny cel**: Umożliwienie użytkownikom logowania się do swojego konta.
- **Kluczowe informacje do wyświetlenia**: Formularz logowania z polami na e-mail i hasło.
- **Kluczowe komponenty widoku**: Formularz, przycisk logowania, link do rejestracji.
- **UX, dostępność i względy bezpieczeństwa**: Walidacja e-maila, komunikaty o błędach, opcja przypomnienia hasła.

### 2.3 Ekran profilu użytkownika
- **Ścieżka widoku**: `/profile`
- **Główny cel**: Umożliwienie użytkownikom edytowania swojego profilu i preferencji gier.
- **Kluczowe informacje do wyświetlenia**: Formularz z danymi użytkownika, preferencjami gier, budżetem i poziomem trudności.
- **Kluczowe komponenty widoku**: Formularz, przycisk zapisz, podpowiedzi kontekstowe.
- **UX, dostępność i względy bezpieczeństwa**: Intuicyjny interfejs, walidacja danych.

### 2.4 Ekran rekomendacji gier
- **Ścieżka widoku**: `/recommendations`
- **Główny cel**: Wyświetlenie rekomendacji gier na podstawie preferencji użytkownika.
- **Kluczowe informacje do wyświetlenia**: Lista rekomendowanych gier z krótkimi opisami.
- **Kluczowe komponenty widoku**: Karty gier, filtry, przyciski do dodawania do ulubionych.
- **UX, dostępność i względy bezpieczeństwa**: Responsywność, łatwe przeglądanie.

### 2.5 Ekran historii gier
- **Ścieżka widoku**: `/history`
- **Główny cel**: Umożliwienie użytkownikom przeglądania historii gier, w które grali.
- **Kluczowe informacje do wyświetlenia**: Lista gier z datami i czasem gry.
- **Kluczowe komponenty widoku**: Tabela z historią, przyciski do usuwania lub edytowania wpisów.
- **UX, dostępność i względy bezpieczeństwa**: Intuicyjna nawigacja, możliwość filtrowania historii.

## 3. Mapa podróży użytkownika
1. Użytkownik odwiedza stronę logowania.
2. Użytkownik loguje się lub rejestruje nowe konto.
3. Użytkownik przechodzi do ekranu profilu, aby wprowadzić swoje preferencje.
4. Użytkownik zapisuje zmiany w profilu.
5. Użytkownik przegląda rekomendacje gier na podstawie wprowadzonych preferencji.
6. Użytkownik może przeglądać historię gier, w które grał.

## 4. Układ i struktura nawigacji
- **Główna nawigacja**: Pasek nawigacyjny z linkami do: Strona główna, Rekomendacje, Historia, Profil, Logowanie/ Rejestracja.
- **Podmenu**: Opcje w zależności od stanu logowania (np. po zalogowaniu: Profil, Historia, Wyloguj).

## 5. Kluczowe komponenty
1. **Formularz rejestracji i logowania**: Z polami na dane użytkownika, walidacją i komunikatami o błędach. (Już istnieją komponenty tego typu)
2. **Formularz profilu**: Z polami do wprowadzania preferencji gier, z podpowiedziami kontekstowymi.
3. **Karty gier**: Z krótkimi opisami, przyciskami do dodawania do ulubionych i oceniania.
4. **Tabela historii gier**: Z możliwością filtrowania i edytowania wpisów. (Już istnieje taka tabela. Należy ją rozbudować zgodnie z potrzebami)

<ui_architecture_planning>

# Architektura UI dla BoardMate AI

## 1. Przegląd struktury UI

Struktura UI dla BoardMate AI koncentruje się na zapewnieniu intuicyjnego i responsywnego interfejsu, który umożliwia użytkownikom łatwe wyszukiwanie, zarządzanie i odkrywanie gier planszowych. Kluczowe elementy obejmują rekomendacje gier, zarządzanie historią gier, oraz personalizację profilu użytkownika. Interfejs jest zaprojektowany z myślą o responsywności, dostępności i bezpieczeństwie, z uwzględnieniem trybu ciemnego/jasnego.

## 2. Lista widoków

### Widok główny
- **Ścieżka widoku**: `/`
- **Główny cel**: Prezentacja rekomendacji gier i możliwość wyszukiwania
- **Kluczowe informacje do wyświetlenia**: Rekomendacje gier, pole wyszukiwania, filtry
- **Kluczowe komponenty widoku**: Lista rekomendacji, panel filtrów, pole wyszukiwania
- **UX, dostępność i względy bezpieczeństwa**: Responsywność, tryb ciemny/jasny, autoryzacja JWT

### Widok szczegółów gry
- **Ścieżka widoku**: `/games/{id}`
- **Główny cel**: Prezentacja szczegółowych informacji o grze
- **Kluczowe informacje do wyświetlenia**: Opis gry, podobne tytuły, recenzje
- **Kluczowe komponenty widoku**: Karta gry, karuzela podobnych tytułów, sekcja recenzji
- **UX, dostępność i względy bezpieczeństwa**: Czytelność, dostępność dla osób z niepełnosprawnościami

### Widok historii gier
- **Ścieżka widoku**: `/history`
- **Główny cel**: Zarządzanie i przeglądanie historii gier
- **Kluczowe informacje do wyświetlenia**: Timeline gier, filtry
- **Kluczowe komponenty widoku**: Timeline, filtry, miniatury gier
- **UX, dostępność i względy bezpieczeństwa**: Intuicyjność, efektywność nawigacji

### Widok profilu użytkownika
- **Ścieżka widoku**: `/profile`
- **Główny cel**: Zarządzanie preferencjami i statystykami użytkownika
- **Kluczowe informacje do wyświetlenia**: Preferencje, statystyki, edycja profilu
- **Kluczowe komponenty widoku**: Formularz preferencji, sekcja statystyk
- **UX, dostępność i względy bezpieczeństwa**: Personalizacja, bezpieczeństwo danych

### Widok 404
- **Ścieżka widoku**: `/404`
- **Główny cel**: Informowanie o błędzie nawigacji
- **Kluczowe informacje do wyświetlenia**: Komunikat błędu, grafika
- **Kluczowe komponenty widoku**: Grafika, tekst błędu
- **UX, dostępność i względy bezpieczeństwa**: Przyjazność, humorystyczny akcent

## 3. Mapa podróży użytkownika

Użytkownik rozpoczyna na widoku głównym, gdzie może przeglądać rekomendacje lub wyszukiwać gry. Po kliknięciu na grę, przechodzi do widoku szczegółów gry. Z widoku głównego lub szczegółów gry, użytkownik może przejść do swojego profilu, aby zarządzać preferencjami. Historia gier jest dostępna z profilu lub bezpośrednio z menu nawigacji. W przypadku błędów nawigacji, użytkownik zostaje przekierowany na stronę 404.

## 4. Układ i struktura nawigacji

Nawigacja główna obejmuje linki do widoku głównego, profilu użytkownika, historii gier i wyszukiwania. Użytkownicy mogą łatwo przełączać się między trybem ciemnym a jasnym. Nawigacja jest responsywna i dostosowuje się do różnych rozmiarów ekranów.

## 5. Kluczowe komponenty

- **Lista rekomendacji**: Prezentuje gry rekomendowane dla użytkownika.
- **Panel filtrów**: Umożliwia filtrowanie gier według różnych kryteriów.
- **Pole wyszukiwania**: Pozwala użytkownikom na szybkie wyszukiwanie gier.
- **Karta gry**: Wyświetla szczegółowe informacje o wybranej grze.
- **Karuzela podobnych tytułów**: Prezentuje gry podobne do wybranej.
- **Timeline**: Wizualizuje historię gier użytkownika.
- **Formularz preferencji**: Umożliwia edycję preferencji użytkownika.
- **Sekcja statystyk**: Prezentuje statystyki gracza w formie liczbowej.
- **Grafika 404**: Informuje o błędzie nawigacji w przyjazny sposób.

</ui_architecture_planning>

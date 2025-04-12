# Dokument wymagań produktu (PRD) - BoardMate AI
## 1. Przegląd produktu
BoardMate AI to aplikacja, która ma na celu ułatwienie użytkownikom znalezienia idealnej gry planszowej na daną okazję. Dzięki inteligentnemu narzędziu, które analizuje preferencje graczy, aplikacja sugeruje najlepsze gry na podstawie liczby uczestników, poziomu trudności i stylu rozgrywki. Aplikacja ma na celu zaspokojenie potrzeb graczy, którzy często czują się przytłoczeni ogromną liczbą dostępnych tytułów.

## 2. Problem użytkownika
Wiele osób ma trudności ze znalezieniem odpowiedniej gry planszowej, co jest spowodowane:
- Nadmierną ilością opcji, które mogą przytłaczać użytkowników.
- Niedopasowaniem gier do specyficznych potrzeb grupy, takich jak liczba graczy, poziom trudności czy czas rozgrywki.
- Brakiem spersonalizowanych rekomendacji, które uwzględniają indywidualne preferencje graczy.

## 3. Wymagania funkcjonalne
- Prosty system kont użytkowników, który pozwala na zapisywanie ulubionych gier i preferencji rozgrywki.
- Strona profilu użytkownika, gdzie użytkownik określa liczbę graczy, preferowany czas rozgrywki i typ gier (strategiczne, imprezowe, kooperacyjne itp.).
- AI analizujące podane preferencje i generujące rekomendacje gier planszowych najlepiej dopasowanych do sytuacji.

## 4. Granice produktu
W zakresie MVP nie będą realizowane następujące funkcjonalności:
- Pełna integracja z bazami danych recenzji gier.
- Możliwość zamawiania gier bezpośrednio z aplikacji.
- Zaawansowane analizy mechanik gier dla indywidualnych użytkowników.

## 5. Historyjki użytkowników
### US-001
- **Tytuł**: Rejestracja użytkownika
- **Opis**: Użytkownik chce zarejestrować się w aplikacji, aby móc zapisywać swoje ulubione gry i preferencje.
- **Kryteria akceptacji**:
  - Użytkownik może wprowadzić swoje dane i utworzyć konto.
  - Użytkownik otrzymuje potwierdzenie rejestracji.

### US-002
- **Tytuł**: Uzupełnienie profilu
- **Opis**: Użytkownik chce uzupełnić swój profil o preferencje dotyczące gier.
- **Kryteria akceptacji**:
  - Użytkownik może określić liczbę graczy, preferowany czas rozgrywki i typ gier.
  - Preferencje są zapisywane i dostępne do edycji.

### US-003
- **Tytuł**: Generowanie rekomendacji
- **Opis**: Użytkownik chce otrzymać rekomendacje gier na podstawie swoich preferencji.
- **Kryteria akceptacji**:
  - AI generuje listę gier na podstawie wprowadzonych preferencji.
  - Użytkownik może przeglądać rekomendowane gry.

### US-004
- **Tytuł**: Logowanie użytkownika
- **Opis**: Użytkownik chce się zalogować do swojego konta, aby uzyskać dostęp do zapisanych preferencji.
- **Kryteria akceptacji**:
  - Użytkownik może wprowadzić swoje dane logowania.
  - Użytkownik uzyskuje dostęp do swojego profilu po pomyślnym zalogowaniu.

### US-005
- **Tytuł**: Wylogowanie użytkownika
- **Opis**: Użytkownik chce się wylogować z aplikacji.
- **Kryteria akceptacji**:
  - Użytkownik może wylogować się z aplikacji.
  - Użytkownik zostaje przekierowany na stronę logowania.

## 6. Metryki sukcesu
- Minimum 70% użytkowników wypełnia swoje preferencje dotyczące gier w pierwszym tygodniu korzystania z aplikacji.
- 60% użytkowników korzysta z rekomendacji AI co najmniej 3 razy w miesiącu.
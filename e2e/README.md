# Testy E2E BoardMateAI

## Wprowadzenie

Ten katalog zawiera testy end-to-end (E2E) dla aplikacji BoardMateAI, wykorzystujące framework Playwright. Testy te są zorganizowane zgodnie z wzorcem Page Object Model (POM), co ułatwia ich utrzymanie i rozszerzanie.

## Struktura projektu

```
e2e/
├── page-objects/       # Page Object Model dla poszczególnych stron
├── pages/              # Page Object Model dla poszczególnych stron (alternatywna implementacja)
├── tests/              # Pliki testowe
├── utils/              # Narzędzia pomocnicze (np. autoryzacja)
├── run-tests.js        # Skrypt do uruchamiania testów
└── README.md           # Ten plik
```

## Przygotowanie środowiska

1. Zainstaluj wymagane zależności:
   ```
   npm install
   ```

2. Wykonaj instalację przeglądarek dla Playwright:
   ```
   npx playwright install
   ```

3. Utwórz plik `.env.test` w katalogu głównym projektu z następującymi zmiennymi:
   ```
   # Dane dostępowe do Supabase
   PUBLIC_SUPABASE_URL=https://twój-projekt.supabase.co
   PUBLIC_SUPABASE_KEY=twój-klucz-anon-public

   # Dane testowego użytkownika
   E2E_USERNAME=testuser@example.com
   E2E_PASSWORD=silne-hasło-testowego-użytkownika

   # Ustawienia Playwright
   E2E_HEADLESS=true
   E2E_SLOW_MO=0
   ```

## Uruchamianie testów

### Wszystkie testy

```
npm run test:e2e:run
```

### Poszczególne zestawy testów

```
npm run test:e2e:run:auth       # Testy logowania
npm run test:e2e:run:catalog    # Testy katalogu gier
npm run test:e2e:run:details    # Testy szczegółów gry
npm run test:e2e:run:favorites  # Testy ulubionych gier
npm run test:e2e:run:add-favorite-and-review  # Test scenariusza dodawania do ulubionych i recenzowania
```

### Uruchamianie testów w trybie UI

```
npm run test:e2e:ui
```

### Uruchamianie testów w trybie debug

```
npm run test:e2e:debug
```

## Organizacja testów

Testy są zorganizowane według funkcjonalności:

- `auth.spec.ts` - testy logowania i autoryzacji
- `catalog.spec.ts` - testy przeglądania katalogu gier
- `game-details.spec.ts` - testy strony szczegółów gry i dodawania recenzji
- `favorites.spec.ts` - testy zarządzania ulubionymi grami
- `add-favorite-and-review.spec.ts` - test scenariusza przejścia użytkownika przez proces dodawania gry do ulubionych i napisania recenzji

## Scenariusze testowe

### Dodawanie do ulubionych i recenzowanie (add-favorite-and-review.spec.ts)

Ten test sprawdza kluczowy scenariusz biznesowy:

1. Logowanie użytkownika
2. Otwarcie katalogu gier
3. Dodanie pierwszej gry do ulubionych
4. Przejście do widoku ulubionych 
5. Weryfikacja obecności dodanej gry
6. Przejście do szczegółów gry
7. Dodanie recenzji (tekst i ocena)
8. Weryfikacja dodanej recenzji

Test zawiera również przypadki negatywne:
- Próba dodania recenzji bez oceny
- Próba dodania zbyt krótkiej recenzji
- Usuwanie istniejącej recenzji

## Page Object Model

W projekcie zastosowano wzorzec Page Object Model, który abstrahuje szczegóły implementacji stron i udostępnia intuicyjne API do interakcji. Główne klasy POM:

- `CatalogPage` - reprezentuje stronę katalogu gier
- `GameDetailsPage` - reprezentuje stronę szczegółów gry
- `FavoritesPage` - reprezentuje stronę ulubionych gier

## Narzędzia pomocnicze

W katalogu `utils` znajdują się narzędzia pomocnicze:

- `auth.ts` - funkcje do logowania użytkownika i weryfikacji stanu uwierzytelnienia

## Atrybuty data-test-id

W aplikacji zastosowano atrybuty `data-test-id` do identyfikacji elementów w testach:

- Przyrostek `game-card-${id}` dla kart gier
- Przyrostek `favorite-game-${id}` dla ulubionych gier
- Atrybuty typu `game-catalog`, `games-grid`, `search-input` dla głównych komponentów
- Atrybuty typu `rating-star-${number}`, `review-text`, `submit-review-button` dla formularza recenzji

## Struktura testów E2E

Testy E2E są zorganizowane zgodnie z wzorcem projektowym Page Object Model (POM), który zapewnia lepszą modularność i łatwość utrzymania testów.

### Klasy POM

W katalogu `e2e/pages` i `e2e/page-objects` znajdują się klasy POM, które enkapsulują interakcje z poszczególnymi stronami:

- `CatalogPage` - strona z katalogiem gier planszowych
- `GameDetailsPage` - strona szczegółów gry
- `FavoritesPage` - strona ulubionych gier użytkownika
- `LoginPage` - strona logowania
- `ReviewForm` - komponent formularza recenzji

### Testy

W katalogu `e2e/tests` znajdują się testy:

- `add-favorite-and-review.spec.ts` - testy dodawania gier do ulubionych i recenzowania
- `login-validation.spec.ts` - testy walidacji formularza logowania
- `full-user-flow.spec.ts` - kompleksowy scenariusz użytkownika od logowania po dodanie i usunięcie recenzji

## Uruchamianie testów

Testy można uruchomić za pomocą skryptu `run-tests.js`:

```bash
node e2e/run-tests.js
```

Aby uruchomić konkretny test:

```bash
node e2e/run-tests.js login-validation.spec.ts
```

## Wymagane zmienne środowiskowe

Testy E2E wymagają skonfigurowania pliku `.env.test` z następującymi zmiennymi:

```
PUBLIC_SUPABASE_URL=twój_url_do_supabase
PUBLIC_SUPABASE_KEY=twój_klucz_publiczny_supabase
E2E_USERNAME=adres_email_testowego_użytkownika
E2E_PASSWORD=hasło_testowego_użytkownika
E2E_HEADLESS=true (lub false jeśli chcesz widzieć przeglądarkę)
E2E_SLOW_MO=0 (lub większa wartość dla spowolnienia wykonania testów)
```

## Atrybuty data-test-id

Dla stabilnych testów używamy atrybutów `data-test-id` zamiast polegać na klasach CSS czy strukturze DOM. Poniżej lista używanych atrybutów:

- `game-catalog` - kontener katalogu gier
- `game-card-{gameId}` - karta gry w katalogu
- `search-input` - pole wyszukiwania w katalogu
- `games-grid` - siatka z kartami gier
- `game-details-button` - przycisk "Zobacz szczegóły" na karcie gry
- `add-to-favorites-button` - przycisk dodawania do ulubionych
- `remove-from-favorites-button` - przycisk usuwania z ulubionych
- `favorite-games-list` - lista ulubionych gier
- `favorite-game-{gameId}` - karta ulubionej gry
- `game-details-card` - karta szczegółów gry
- `game-stats` - statystyki gry
- `game-players` - informacja o liczbie graczy
- `game-duration` - informacja o czasie gry
- `game-complexity` - informacja o złożoności gry
- `game-title` - tytuł gry
- `game-description` - opis gry
- `reviews-list` - lista recenzji
- `review-form` - formularz dodawania recenzji
- `rating-star-{1-5}` - gwiazdki oceny
- `review-text` - pole tekstowe recenzji
- `submit-review-button` - przycisk dodawania recenzji
- `review-content` - treść recenzji
- `delete-review-button` - przycisk usuwania recenzji
- `no-reviews-message` - komunikat o braku recenzji
- `back-to-catalog` - przycisk powrotu do katalogu
- `login-error` - komunikat o błędzie logowania 
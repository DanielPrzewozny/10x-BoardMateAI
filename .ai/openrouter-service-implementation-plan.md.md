# Przewodnik implementacji usługi OpenRouter

## 1. Opis usługi
Usługa OpenRouter ma na celu integrację z interfejsem API OpenRouter, aby umożliwić uzupełnianie czatów opartych na modelach językowych (LLM). Dzięki tej usłudze użytkownicy będą mogli korzystać z zaawansowanych funkcji generowania odpowiedzi, które są dostosowane do ich potrzeb.

## 2. Opis konstruktora
Konstruktor usługi OpenRouter będzie odpowiedzialny za inicjalizację klienta API oraz konfigurację niezbędnych parametrów. Będzie przyjmować następujące argumenty:
- `apiKey`: Klucz API do autoryzacji.
- `modelName`: Nazwa modelu, który ma być używany do generowania odpowiedzi.
- `systemMessage`: Komunikat systemowy, który ustawia kontekst dla modelu.

## 3. Publiczne metody i pola
### Publiczne metody:
1. `generateResponse(userMessage: string): Promise<string>` - Generuje odpowiedź na podstawie wiadomości użytkownika.
2. `setModel(modelName: string): void` - Ustawia nazwę modelu do użycia.

### Publiczne pola:
- `apiKey: string` - Klucz API do autoryzacji.
- `modelName: string` - Nazwa modelu używanego do generowania odpowiedzi.

## 4. Prywatne metody i pola
### Prywatne metody:
1. `_callApi(payload: object): Promise<object>` - Wysyła żądanie do API OpenRouter i zwraca odpowiedź.
2. `_formatResponse(response: object): string` - Formatuje odpowiedź z API do postaci tekstowej.

### Prywatne pola:
- `_baseUrl: string` - Podstawowy URL API OpenRouter.

## 5. Obsługa błędów
### Potencjalne scenariusze błędów:
1. **Błąd autoryzacji** - Nieprawidłowy klucz API.
2. **Błąd połączenia** - Problemy z połączeniem z API.
3. **Błąd formatu odpowiedzi** - Odpowiedź z API nie jest w oczekiwanym formacie.

## 6. Kwestie bezpieczeństwa
- Upewnij się, że klucz API jest przechowywany w bezpieczny sposób, np. w zmiennych środowiskowych.
- Zastosuj szyfrowanie dla wrażliwych danych przesyłanych do i z API.

## 7. Plan wdrożenia krok po kroku
1. **Inicjalizacja klienta API**:
   - Użyj `createClient` z `@supabase/supabase-js` do utworzenia klienta.
   - Skonfiguruj zmienne środowiskowe z przedrostkiem `PUBLIC_` dla Supabase.

2. **Implementacja metod**:
   - Zaimplementuj metodę `generateResponse`, która będzie wysyłać wiadomości użytkownika do API OpenRouter.
   - Użyj `_callApi` do komunikacji z API.

3. **Formatowanie odpowiedzi**:
   - Zaimplementuj `_formatResponse`, aby przekształcić odpowiedzi z API do formatu tekstowego.

4. **Obsługa błędów**:
   - Dodaj obsługę błędów w każdej metodzie, aby odpowiednio reagować na problemy z API.

5. **Testowanie**:
   - Przeprowadź testy jednostkowe dla wszystkich publicznych metod, aby upewnić się, że działają zgodnie z oczekiwaniami.

6. **Dokumentacja**:
   - Upewnij się, że wszystkie metody są odpowiednio udokumentowane, aby ułatwić przyszłe utrzymanie.

## 8. Włączenie elementów OpenRouter API
### Przykłady implementacji:
1. **Komunikat systemowy**:
   ```javascript
   const systemMessage = "Jesteś asystentem AI, który pomaga użytkownikom w znalezieniu informacji.";
   ```

2. **Komunikat użytkownika**:
   ```javascript
   const userMessage = "Jakie są najlepsze gry planszowe na dwie osoby?";
   ```

3. **Ustrukturyzowane odpowiedzi poprzez response_format**:
   ```javascript
   const responseFormat = {
     type: 'json_schema',
     json_schema: {
       name: 'response',
       strict: true,
       schema: {
         type: 'object',
         properties: {
           answer: { type: 'string' },
           suggestions: { type: 'array', items: { type: 'string' } }
         }
       }
     }
   };
   ```

4. **Nazwa modelu**:
   ```javascript
   const modelName = "gpt-4o-mini";
   ```

5. **Parametry modelu**:
   ```javascript
   const modelParams = {
     temperature: 0.7,
     max_tokens: 150
   };
   ```

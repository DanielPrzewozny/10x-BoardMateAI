import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Ścieżki do plików .env.test (sprawdzamy oba potencjalne miejsca)
const envTestInRoot = path.resolve(process.cwd(), '../.env.test');
const envTestInE2E = path.resolve(process.cwd(), '../.env.test');

// Spróbuj załadować z katalogu e2e
let configLoaded = false;
console.log(`Sprawdzam plik .env.test w katalogu e2e: ${envTestInE2E}`);

try {
  if (fs.existsSync(envTestInE2E)) {
    console.log(`Znaleziono plik .env.test w katalogu e2e, ładuję...`);
    const result = dotenv.config({ path: envTestInE2E });
    if (result.error) {
      console.warn(`Błąd ładowania .env.test z katalogu e2e: ${result.error.message}`);
    } else {
      console.log('Zmienne środowiskowe załadowane poprawnie z katalogu e2e');
      configLoaded = true;
    }
  } else {
    console.warn(`Nie znaleziono pliku .env.test w katalogu e2e`);
  }
  
  // Jeśli nie znaleziono w katalogu e2e, spróbuj w katalogu głównym
  if (!configLoaded) {
    console.log(`Sprawdzam plik .env.test w katalogu głównym: ${envTestInRoot}`);
    if (fs.existsSync(envTestInRoot)) {
      console.log(`Znaleziono plik .env.test w katalogu głównym, ładuję...`);
      const result = dotenv.config({ path: envTestInRoot });
      if (result.error) {
        console.warn(`Błąd ładowania .env.test z katalogu głównego: ${result.error.message}`);
      } else {
        console.log('Zmienne środowiskowe załadowane poprawnie z katalogu głównego');
        configLoaded = true;
      }
    } else {
      console.warn(`Nie znaleziono pliku .env.test w katalogu głównym`);
    }
  }

} catch (error) {
  console.error('Błąd podczas konfiguracji zmiennych środowiskowych:', error);
}

// Wypisz aktualnie używane zmienne dla weryfikacji
console.log('--- Aktualne zmienne środowiskowe w konfiguracji Playwright ---');
console.log(`PUBLIC_SUPABASE_URL: ${process.env.PUBLIC_SUPABASE_URL || '(nie ustawiono)'}`);
console.log(`PUBLIC_SUPABASE_KEY: ${process.env.PUBLIC_SUPABASE_KEY ? '(ustawiono)' : '(nie ustawiono)'}`);
console.log(`E2E_USERNAME: ${process.env.E2E_USERNAME || '(nie ustawiono)'}`);
console.log(`E2E_PASSWORD: ${process.env.E2E_PASSWORD ? '(ustawiono)' : '(nie ustawiono)'}`);
console.log(`E2E_HEADLESS: ${process.env.E2E_HEADLESS || '(nie ustawiono)'}`);
console.log(`E2E_SLOW_MO: ${process.env.E2E_SLOW_MO || '(nie ustawiono)'}`);
console.log(`E2E_TEST_USER_ID: ${process.env.E2E_TEST_USER_ID || '(nie ustawiono)'}`);

// Wartości z zmiennych środowiskowych
const headless = process.env.E2E_HEADLESS === 'true';
const slowMo = process.env.E2E_SLOW_MO ? parseInt(process.env.E2E_SLOW_MO) : 0;

/**
 * Konfiguracja testów Playwright dla BoardMateAI
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Dodaj 1 automatyczną próbę nawet lokalnie
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  
  // Limit czasowy na test
  timeout: 60 * 1000, // Zwiększony limit czasu do 60 sekund
  
  // Konfiguracja globalnego setupu i teardownu
  globalSetup: require.resolve('./globalSetup'),
  globalTeardown: require.resolve('./globalTeardown'),
  
  // Globalne parametry współdzielone przez wszystkie testy
  use: {
    // Bazowy URL dla wszystkich testów
    baseURL: 'http://localhost:3000',
    
    // Zapisywanie śladów testów do debugowania
    trace: 'on-first-retry',
    
    // Zapisywanie zrzutów ekranu
    screenshot: 'only-on-failure',
    
    // Parametry z .env.test
    headless: headless,
    launchOptions: {
      slowMo: slowMo
    },
    
    // Zwiększenie limitów czasowych dla asercji i nawigacji
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  
  // Konfiguracja dla różnych projektów (tylko przeglądarka Chrome)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  // Konfiguracja serwera webowego (opcjonalna - może być używana, jeśli chcemy uruchomić serwer z tego katalogu)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 180000, // 3 minuty na uruchomienie serwera
    stdout: 'pipe',
    stderr: 'pipe',
  },
}); 
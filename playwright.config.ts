import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Ładowanie zmiennych środowiskowych z pliku .env.test
const isCI = process.env.CI === "true" || process.env.CI === "1" || process.env.ENV_NAME === "unittests";
const envTestPath = path.resolve(process.cwd(), ".env.test");
if (!isCI) {
  console.log(`Próba załadowania zmiennych środowiskowych z: ${envTestPath}`);
} else {
  console.log("Pomijam ładowanie .env.test w środowisku CI");
}

try {
  if (!isCI) {
    if (fs.existsSync(envTestPath)) {
      console.log(`Plik .env.test znaleziony, ładuję zmienne...`);
      const result = dotenv.config({ path: envTestPath });
      if (result.error) {
        console.error(`Błąd ładowania .env.test: ${result.error.message}`);
      } else {
        console.log("Zmienne środowiskowe załadowane poprawnie");
        console.log(`PUBLIC_SUPABASE_URL: ${process.env.PUBLIC_SUPABASE_URL || "(nie ustawiono)"}`);
        console.log(`PUBLIC_SUPABASE_KEY: ${process.env.PUBLIC_SUPABASE_KEY ? "(ustawiono)" : "(nie ustawiono)"}`);
      }
    } else {
      console.warn(`Plik .env.test nie istnieje w: ${envTestPath}`);
    }
  }
} catch (error) {
  console.error("Błąd podczas ładowania zmiennych środowiskowych:", error);
}

/**
 * Konfiguracja testów E2E dla Playwright.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }]],

  /* Folder dla artefaktów testowych (śladów, zrzutów ekranu, etc.) */
  outputDir: "./test-results",

  /* Współczynnik oczekiwania dla asercji. */
  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
    },
  },

  /* Globalny timeout dla testów */
  timeout: 30000,

  /* Konfiguracja projektu testowego */
  use: {
    /* Przechwytywanie śladu testu - przydatne do debugowania */
    trace: "on-first-retry",

    /* Zapisywanie zrzutów ekranu w przypadku błędów */
    screenshot: "only-on-failure",

    /* Bazowy URL dla testów */
    baseURL: "http://localhost:3000",
  },

  /* Konfiguracja projektów - używamy tylko Chromium zgodnie z zaleceniami */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Konfiguracja deweloperskiego serwera webowego */
  webServer: {
    command: "npm run dev:e2e",
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minuty na uruchomienie serwera
    stdout: "pipe",
    stderr: "pipe",
    env: {
      NODE_ENV: "test",
      ASTRO_TELEMETRY_DISABLED: "1",
      DEBUG: "*",
    },
  },
});

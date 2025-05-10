/**
 * Skrypt do uruchamiania testów E2E
 * Ustawia zmienne środowiskowe i uruchamia testy Playwright
 */
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sprawdź czy jesteśmy w środowisku CI
const isCI = process.env.CI === 'true' || process.env.CI === '1' || process.env.ENV_NAME === 'unittests';
console.log(`Środowisko: ${isCI ? 'CI' : 'lokalne'}`);

// Ładuj .env.test tylko w środowisku lokalnym
if (!isCI) {
  const envTestPath = path.resolve(__dirname, '../.env.test');
  if (!fs.existsSync(envTestPath)) {
    console.error('Błąd: Nie znaleziono pliku .env.test!');
    console.error('Utwórz plik .env.test w katalogu głównym projektu z następującymi zmiennymi:');
    console.error(`
PUBLIC_SUPABASE_URL=twój_url_do_supabase
PUBLIC_SUPABASE_KEY=twój_klucz_publiczny_supabase
E2E_USERNAME=adres_email_testowego_użytkownika
E2E_PASSWORD=hasło_testowego_użytkownika
E2E_TEST_USER_ID=id_testowego_użytkownika
E2E_HEADLESS=true (lub false jeśli chcesz widzieć przeglądarkę)
E2E_SLOW_MO=0 (lub większa wartość dla spowolnienia wykonania testów)
    `);
    process.exit(1);
  }
  console.log(`Ładowanie zmiennych środowiskowych z ${envTestPath}`);
  dotenv.config({ path: envTestPath });
}

// Uruchom testy
try {
  console.log('\n=== Uruchamianie testów E2E ===\n');
  
  // Sprawdź wymagane zmienne środowiskowe
  const requiredSecrets = [
    'PUBLIC_SUPABASE_URL',
    'PUBLIC_SUPABASE_KEY'
  ];

  const requiredVars = [
    'E2E_USERNAME',
    'E2E_PASSWORD',
    'E2E_TEST_USER_ID'
  ];

  console.log('\nDostępne zmienne środowiskowe:');
  [...requiredSecrets, ...requiredVars].forEach(varName => {
    const value = process.env[varName];
    console.log(`${varName}: ${value ? '✓' : '✗'}`);
  });

  const missingSecrets = requiredSecrets.filter(varName => !process.env[varName]);
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingSecrets.length > 0 || missingVars.length > 0) {
    if (missingSecrets.length > 0) {
      console.error('\nBłąd: Brak wymaganych secrets:');
      missingSecrets.forEach(varName => console.error(`- ${varName}`));
    }
    if (missingVars.length > 0) {
      console.error('\nBłąd: Brak wymaganych zmiennych środowiskowych:');
      missingVars.forEach(varName => console.error(`- ${varName}`));
    }
    process.exit(1);
  }
  
  // Ustaw parametry uruchomieniowe Playwright
  const playwrightCommand = 'npx playwright test';
  const options = {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--no-experimental-fetch',
      PLAYWRIGHT_SKIP_VITEST_GLOBALS: 'true',
      CI: isCI ? 'true' : 'false'
    },
    shell: true
  };
  
  // Sprawdź czy mamy dodatkowe argumenty z linii poleceń
  const args = process.argv.slice(2);
  const fullCommand = args.length > 0 
    ? `${playwrightCommand} ${args.join(' ')}` 
    : playwrightCommand;
  
  console.log(`\nWykonuję: ${fullCommand}\n`);
  execSync(fullCommand, options);
  
  console.log('\n=== Testy zakończone pomyślnie ===\n');
} catch (error) {
  console.error('\n=== Wystąpiły błędy podczas wykonywania testów ===\n');
  process.exit(1);
} 
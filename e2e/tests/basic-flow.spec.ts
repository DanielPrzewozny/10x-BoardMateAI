import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CatalogPage } from '../pages/CatalogPage';

test.describe('Podstawowy przepływ użytkownika', () => {
  let loginPage: LoginPage;
  let catalogPage: CatalogPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    catalogPage = new CatalogPage(page);
  });

  test('powinien zalogować się i zobaczyć katalog gier', async ({ page }) => {
    // 0. Jeśli jesteśmy zalogowani, wyloguj się
    await page.goto('/auth/logout');
    await page.waitForTimeout(500);

    // 1. Przejdź do strony logowania
    await loginPage.goto();
    
    // Upewnij się, że jesteśmy na stronie logowania
    expect(page.url()).toContain('/auth/login');

    // 2. Zaloguj się
    await loginPage.login(
      process.env.E2E_USERNAME || 'test@example.com',
      process.env.E2E_PASSWORD || 'test123'
    );

    // 3. Sprawdź czy zostaliśmy przekierowani do katalogu
    await expect(page).toHaveURL('/recommendations');

    // 4. Przejdź do katalogu gier
    await catalogPage.goto();
    
    // 5. Poczekaj na załadowanie gier
    await catalogPage.waitForGames();

    // 6. Sprawdź zawartość katalogu
    const gamesCount = await catalogPage.getGamesCount();
    expect(gamesCount).toBeGreaterThan(0);

    const titles = await catalogPage.getGameTitles();
    expect(titles.length).toBe(gamesCount);
    expect(titles[0]).toBeTruthy();
  });
}); 
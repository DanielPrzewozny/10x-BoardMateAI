import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CatalogPage } from '../pages/CatalogPage';
import { FavoritesPage } from '../pages/FavoritesPage';

test.describe('Zarządzanie ulubionymi grami', () => {
  let loginPage: LoginPage;
  let catalogPage: CatalogPage;
  let favoritesPage: FavoritesPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    catalogPage = new CatalogPage(page);
    favoritesPage = new FavoritesPage(page);

    // Jeśli jesteśmy zalogowani, wyloguj się
    await page.goto('/auth/logout');
    await page.waitForTimeout(500);

    // Zaloguj się przed każdym testem
    await loginPage.goto();

    // Upewnij się, że jesteśmy na stronie logowania
   expect(page.url()).toContain('/auth/login');


    await loginPage.login(
      process.env.E2E_USERNAME || 'test@example.com',
      process.env.E2E_PASSWORD || 'test123'
    );
    await page.waitForTimeout(500);
  });

  test('powinien dodać i usunąć grę z ulubionych', async ({ page }) => {
    // 1. Przejdź do katalogu gier
    await catalogPage.goto();
    await catalogPage.waitForGames();

    // 2. Znajdź pierwszą grę i dodaj ją do ulubionych
    const addToFavoritesButton = page.getByTestId('add-to-favorites-button').first();
    await addToFavoritesButton.click();
    
    // Czekamy na potwierdzenie dodania do ulubionych (toast lub inna informacja)
    await page.waitForTimeout(1000);

    // 3. Przejdź do strony ulubionych
    await favoritesPage.goto();
    
    // 4. Czekamy na załadowanie listy gier
    await favoritesPage.waitForGames();

    // Sprawdź czy lista nie jest pusta
    const gamesCount = await favoritesPage.getGamesCount();
    expect(gamesCount).toBeGreaterThan(0);

    // 5. Usuń grę z ulubionych
    await favoritesPage.deleteGameTitle();

    // 6. Czekamy na aktualizację listy
    await page.waitForTimeout(1000);

    // 7. Sprawdź czy gra została usunięta
    const newGamesCount = await favoritesPage.getGamesCount();
    expect(newGamesCount).toBeLessThan(gamesCount);
  });

  test('powinien wyświetlić komunikat gdy nie ma ulubionych gier', async ({ page }) => {
    // 1. Przejdź do strony ulubionych
    await page.goto('/favorites');
    await page.waitForTimeout(500);
    const noFavoritesGames = await favoritesPage.getNoFavoritesMessage();

    // 2. Sprawdź czy lista ulubionych jest pusta
    const gamesCount = await favoritesPage.getGamesCount();
    
    if (gamesCount === 0) {
      // Jeśli nie ma gier, powinien być wyświetlony odpowiedni komunikat
      expect(noFavoritesGames).toBe('Nie masz jeszcze żadnych ulubionych gier');
    } else {
      // Jeśli są jakieś gry, usuń wszystkie
      for (let i = 0; i < gamesCount; i++) {
        const removeButton = page.getByTestId('remove-from-favorites-button').first();
        await page.waitForTimeout(500);
        await removeButton.click();
        // Poczekaj na aktualizację UI
        await page.waitForTimeout(500);
      }
      
      // Sprawdź czy wyświetla się komunikat o braku gier
      await page.waitForTimeout(500);
      
      console.log(noFavoritesGames);
      expect(noFavoritesGames).toBe('Nie masz jeszcze żadnych ulubionych gier');
    }
  });
}); 
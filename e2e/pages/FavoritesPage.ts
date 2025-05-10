import { type Page } from '@playwright/test';

export class FavoritesPage {
    constructor(private page: Page) {}

  // Selektory
  private readonly gamesList = '[data-testid="favorite-games-list"]';
  private readonly gameCard = '[data-testid*="favorite-game-"]';
  private readonly gameTitle = '[data-testid="favorite-game-title"]';
  private readonly deleteButton = '[data-testid="remove-from-favorites-button"]'
  private readonly noFavoritesMessage = '[data-testid="no-favorites-message"]';
  async goto() {
    await this.page.goto('/favorites');
  }

  async waitForGames() {
    await this.page.waitForSelector(this.gamesList);
    await this.page.waitForSelector(this.gameCard);
  }

  async getGamesCount() {
    return await this.page.locator(this.gameCard).count();
  }

  async getGameTitles() {
    return await this.page.locator(this.gameTitle).allTextContents();
  }
  async deleteGameTitle(){
    return await this.page.locator(this.deleteButton).click();
  }
  async getNoFavoritesMessage(): Promise<string | null> {
    return await this.page.locator(this.noFavoritesMessage).textContent();
  }
} 